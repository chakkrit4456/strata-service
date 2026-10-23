#!/usr/bin/env bash
# ติดตั้ง Strata บน TurnKey Linux Node.js (Debian 12) — รันด้วย root
#   bash install.sh [PUBLIC_URL]
#   เช่น  bash install.sh https://strata.itdev.in.th
# ตัวแปรเสริม:
#   GEMINI_API_KEY=... GROQ_API_KEY=...   ใส่ key ให้เลยตอนติดตั้งครั้งแรก
#   RESET_ADMIN_PASSWORD=1                สร้างรหัสผ่าน admin ใหม่ (รหัสเดิมกู้คืนไม่ได้)
set -euo pipefail

REPO="https://github.com/chakkrit4456/strata-service.git"
APP_DIR="${APP_DIR:-/var/www/strata}"
DB_NAME="strata"
DB_USER="strata"
PORT=3000
PUBLIC_URL="${1:-${PUBLIC_URL:-http://$(hostname -I | awk '{print $1}'):$PORT}}"
CRED_FILE="/root/strata-admin.txt"

log() { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }
rand() { openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c "$1"; }
# ตั้งค่าใน .env (เพิ่มถ้ายังไม่มี)
set_env() {
  local key="$1" val="$2" tmp
  # ไม่ใช้ sed เพราะค่าอย่าง hash มี \ และ $ ที่ sed ตีความผิด
  tmp=$(mktemp)
  grep -v "^${key}=" .env > "$tmp" || true
  printf '%s=%s\n' "$key" "$val" >> "$tmp"
  cat "$tmp" > .env
  rm -f "$tmp"
}
get_env() { grep "^$1=" .env | head -1 | cut -d= -f2- || true; }

[ "$(id -u)" -eq 0 ] || { echo "กรุณารันด้วย root"; exit 1; }

log "ติดตั้งแพ็กเกจระบบ (PostgreSQL, git)"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql git openssl curl >/dev/null
systemctl enable --now postgresql >/dev/null

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
if [ "$NODE_MAJOR" -lt 20 ]; then
  log "ติดตั้ง Node.js 20 (พบเวอร์ชัน $NODE_MAJOR)"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi

log "ดึงโค้ดไปที่ $APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull --ff-only
else
  mkdir -p "$(dirname "$APP_DIR")"
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

FIRST_INSTALL=0
if [ ! -f .env ]; then
  FIRST_INSTALL=1
  cp .env.example .env
  chmod 600 .env
fi

log "เตรียมฐานข้อมูล"
DB_PASS=$(get_env DATABASE_URL | sed -n 's|^postgres://[^:]*:\([^@]*\)@.*|\1|p')
if [ -z "$DB_PASS" ] || [ "$DB_PASS" = "change-me" ]; then
  DB_PASS=$(rand 24)
fi
if sudo -u postgres psql -tAc "select 1 from pg_roles where rolname='$DB_USER'" | grep -q 1; then
  sudo -u postgres psql -qc "alter user $DB_USER with password '$DB_PASS';"
else
  sudo -u postgres psql -qc "create user $DB_USER with password '$DB_PASS';"
fi
if ! sudo -u postgres psql -tAc "select 1 from pg_database where datname='$DB_NAME'" | grep -q 1; then
  sudo -u postgres psql -qc "create database $DB_NAME owner $DB_USER;"
fi
set_env DATABASE_URL "postgres://$DB_USER:$DB_PASS@127.0.0.1:5432/$DB_NAME"

[ -n "$(get_env SESSION_SECRET)" ] || set_env SESSION_SECRET "$(rand 48)"
[ -n "$(get_env ADMIN_USER)" ] || set_env ADMIN_USER admin
set_env PUBLIC_URL "$PUBLIC_URL"
set_env UPLOAD_DIR "$APP_DIR/uploads"
[ -z "${GEMINI_API_KEY:-}" ] || set_env GEMINI_API_KEY "$GEMINI_API_KEY"
[ -z "${GROQ_API_KEY:-}" ] || set_env GROQ_API_KEY "$GROQ_API_KEY"
mkdir -p "$APP_DIR/uploads"

log "ติดตั้ง dependencies และ build (อาจใช้เวลาหลายนาที)"
npm ci --no-audit --no-fund
npm run db:migrate
npm run build

ADMIN_USER=$(get_env ADMIN_USER)
ADMIN_PASS=""
if [ -z "$(get_env ADMIN_PASSWORD_HASH)" ] || [ "${RESET_ADMIN_PASSWORD:-0}" = "1" ]; then
  log "สร้างรหัสผ่าน admin"
  ADMIN_PASS=$(rand 16)
  HASH_LINE=$(npx --yes tsx scripts/hash-password.mts "$ADMIN_PASS" | tail -1)
  set_env ADMIN_PASSWORD_HASH "${HASH_LINE#ADMIN_PASSWORD_HASH=}"
  umask 077
  printf 'URL:      %s/admin\nUser:     %s\nPassword: %s\nCreated:  %s\n' \
    "$PUBLIC_URL" "$ADMIN_USER" "$ADMIN_PASS" "$(date '+%F %T')" > "$CRED_FILE"
fi

log "เริ่มแอปด้วย PM2"
command -v pm2 >/dev/null || npm i -g pm2 >/dev/null
if ss -ltnp 2>/dev/null | grep -q ":$PORT " && ! pm2 describe strata >/dev/null 2>&1; then
  echo "คำเตือน: port $PORT ถูกใช้อยู่ (อาจเป็นแอปตัวอย่างของ TurnKey) — ดู 'pm2 list' และ 'ss -ltnp'"
fi
if pm2 describe strata >/dev/null 2>&1; then
  pm2 restart strata --update-env >/dev/null
else
  pm2 start deploy/ecosystem.config.js >/dev/null
fi
pm2 save >/dev/null
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

log "ตั้ง cron (ซ่อนแชทครบกำหนด + backup ฐานข้อมูล)"
mkdir -p /var/backups/strata
CRON_TAG="# strata"
( crontab -l 2>/dev/null | grep -v "$CRON_TAG" || true
  echo "15 3 * * * cd $APP_DIR && npm run retention >> /var/log/strata-retention.log 2>&1 $CRON_TAG"
  echo "30 3 * * * sudo -u postgres pg_dump $DB_NAME | gzip > /var/backups/strata/strata-\$(date +\\%F).sql.gz $CRON_TAG"
  echo "0 4 * * * find /var/backups/strata -name '*.sql.gz' -mtime +30 -delete $CRON_TAG"
) | crontab -

sleep 3
HTTP=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || echo "-")

echo
echo "============================================================"
echo " ติดตั้ง Strata เสร็จแล้ว  (ทดสอบ http://127.0.0.1:$PORT → $HTTP)"
echo "============================================================"
echo " หน้าเว็บลูกค้า : $PUBLIC_URL/?src=fastwork"
echo " หลังบ้าน       : $PUBLIC_URL/admin"
echo " ชื่อผู้ใช้      : $ADMIN_USER"
if [ -n "$ADMIN_PASS" ]; then
  echo " รหัสผ่าน       : $ADMIN_PASS"
  echo
  echo " บันทึกไว้ที่ $CRED_FILE (อ่านได้เฉพาะ root)"
  echo " เปลี่ยนรหัสใหม่: RESET_ADMIN_PASSWORD=1 bash deploy/install.sh $PUBLIC_URL"
else
  echo " รหัสผ่าน       : (ใช้รหัสเดิม — ดูใน $CRED_FILE ถ้ามี)"
  echo " ลืมรหัส: RESET_ADMIN_PASSWORD=1 bash deploy/install.sh $PUBLIC_URL"
fi
if [ -z "$(get_env GEMINI_API_KEY)" ] && [ -z "$(get_env GROQ_API_KEY)" ]; then
  echo
  echo " ⚠ ยังไม่ได้ใส่ API key ของ AI — แก้ $APP_DIR/.env (GEMINI_API_KEY / GROQ_API_KEY)"
  echo "   แล้วรัน: pm2 restart strata --update-env"
fi
[ "$FIRST_INSTALL" = 1 ] && echo && echo " ไฟล์ตั้งค่า: $APP_DIR/.env"
echo "============================================================"
