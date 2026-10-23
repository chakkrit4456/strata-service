# ติดตั้ง Strata บน TurnKey Linux Node.js

```bash
apt update && apt install -y postgresql
sudo -u postgres psql -c "create user strata with password 'change-me';"
sudo -u postgres psql -c "create database strata owner strata;"

git clone https://github.com/chakkrit4456/strata-service.git /var/www/strata
cd /var/www/strata
cp .env.example .env            # แก้ค่า DATABASE_URL, API key, SESSION_SECRET
npm ci
npm run hash-password -- "รหัสผ่านเจ้าของ"   # คัดลอกบรรทัดผลลัพธ์ไปใส่ .env
npm run db:migrate
npm run build

npm i -g pm2
pm2 start deploy/ecosystem.config.js && pm2 save && pm2 startup
```

- nginx: คัดลอก `deploy/nginx-strata.conf` ไป `/etc/nginx/sites-available/` แก้ `server_name` แล้ว enable + reload
- SSL: `confconsole` → Lets Encrypt
- cron: เพิ่มบรรทัดใน `deploy/crontab.txt`
- อัปเดต: `git pull && npm ci && npm run db:migrate && npm run build && pm2 restart strata`
- ลิงก์ให้ลูกค้า: `https://โดเมน/?src=fastwork`, `?src=facebook` หรือ UTM ใดๆ
- หลังบ้าน: `/admin`
