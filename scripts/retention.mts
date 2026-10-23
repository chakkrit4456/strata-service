// รันวันละครั้งด้วย cron: ซ่อนแชทที่ไม่มีความเคลื่อนไหวเกินกำหนดจากหน้าเว็บ (ไม่ลบข้อมูล)
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const { rows: s } = await pool.query("select value from settings where key = 'retentionMonths'");
const months = Number(s[0]?.value) || 6;
const { rows } = await pool.query(
  `update conversations set archived_at = now()
   where archived_at is null
     and last_activity_at < now() - make_interval(months => $1)
     and (pinned_until is null or pinned_until < now())
   returning id, last_activity_at`,
  [months],
);
for (const r of rows) {
  await pool.query(
    "insert into audit_logs (event, actor, conversation_id, meta) values ('chat.archived', 'system', $1, $2)",
    [r.id, JSON.stringify({ months, lastActivityAt: r.last_activity_at })],
  );
}
console.log(`archived ${rows.length} conversation(s), retention ${months} months`);
await pool.end();
