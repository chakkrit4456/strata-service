import Link from "next/link";
import { count, desc, isNotNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { logDetail, logWhere, type LogFilter } from "@/lib/audit-query";
import { SOURCE_LABEL, STATUS_LABEL, fmtDate, fmtDateTime } from "@/lib/retention";
import { getSettings } from "@/lib/settings";

const PAGE = 100;
const DANGER = new Set(["login.failed", "ai.failed", "chat.archived", "settings.changed"]);
const EVENTS = [
  "chat.started", "message.sent", "ai.replied", "ai.failed", "file.uploaded", "requirement.generated",
  "requirement.confirmed", "admin.viewed", "admin.takeover", "admin.replied", "admin.note", "status.changed",
  "chat.pinned", "chat.archived", "settings.changed", "login.success", "login.failed", "logout",
];

export default async function LogsPage({ searchParams }: { searchParams: Promise<LogFilter & { page?: string }> }) {
  const sp = await searchParams;
  const tab = sp.tab === "archive" || sp.tab === "login" ? sp.tab : "events";
  const page = Math.max(1, Number(sp.page) || 1);
  const l = schema.auditLogs;
  const [[total]] = await Promise.all([db.select({ n: count() }).from(l)]);
  const qs = (patch: Record<string, string | undefined>) =>
    `/admin/logs?${new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][])}`;

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-col gap-3.5 border-b border-[#e3eaf1] px-4 pt-4.5 md:px-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-[28px] leading-none font-medium tracking-[-0.04em]">Audit log</h1>
          <span className="font-mono text-xs text-muted">append-only · {total.n.toLocaleString()} เหตุการณ์ · ไม่มีการลบ</span>
        </div>
        <div className="flex gap-6 text-sm">
          {[
            ["events", "เหตุการณ์ทั้งหมด"],
            ["archive", "คลังบทสนทนา (Archive)"],
            ["login", "การเข้าสู่ระบบ"],
          ].map(([k, label]) => (
            <Link key={k} href={`/admin/logs${k === "events" ? "" : `?tab=${k}`}`} className={`pb-2.5 ${tab === k ? "border-b-2 border-ink font-semibold" : "text-muted"}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
      {tab === "archive" ? <Archive /> : <Events sp={{ ...sp, tab }} page={page} qs={qs} />}
    </div>
  );
}

async function Events({ sp, page, qs }: { sp: LogFilter; page: number; qs: (p: Record<string, string | undefined>) => string }) {
  const l = schema.auditLogs;
  const where = logWhere(sp);
  const [rows, [filtered]] = await Promise.all([
    db.select().from(l).where(where).orderBy(desc(l.id)).limit(PAGE).offset((page - 1) * PAGE),
    db.select({ n: count() }).from(l).where(where),
  ]);
  const csv = `/api/admin/logs?${new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][])}`;
  const input = "rounded-md border border-sand px-2.5 py-1.5";
  const grid = "grid grid-cols-[150px_110px_180px_70px_120px_minmax(0,1fr)] gap-x-4";

  return (
    <>
      <form className="flex flex-wrap items-center gap-2 border-b border-[#e3eaf1] px-4 py-3 text-[13px] md:px-7">
        {sp.tab === "login" && <input type="hidden" name="tab" value="login" />}
        <input name="q" defaultValue={sp.q} placeholder="ค้นหา event, IP, ผู้กระทำ" className={`${input} w-52`} />
        {sp.tab !== "login" && (
          <select name="event" defaultValue={sp.event ?? ""} className={input}>
            <option value="">เหตุการณ์: ทั้งหมด</option>
            {EVENTS.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        )}
        <select name="actor" defaultValue={sp.actor ?? ""} className={input}>
          <option value="">ผู้กระทำ: ทั้งหมด</option>
          <option value="customer">ลูกค้า</option>
          <option value="ai">AI</option>
          <option value="admin">เจ้าของ</option>
          <option value="system">ระบบ</option>
        </select>
        <input name="conv" defaultValue={sp.conv} placeholder="ID แชท" className={`${input} w-20`} />
        <input type="date" name="from" defaultValue={sp.from} className={input} />
        <input type="date" name="to" defaultValue={sp.to} className={input} />
        <button className="rounded-full bg-ink px-4 py-1.5 text-white">กรอง</button>
        <a href={csv} className={`${input} ml-auto hover:bg-paper`}>ส่งออก CSV</a>
      </form>
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className={`${grid} border-b border-[#e3eaf1] px-7 py-2 text-xs text-muted`}>
            <span>เวลา</span><span>ผู้กระทำ</span><span>เหตุการณ์</span><span>แชท</span><span>IP</span><span>รายละเอียด</span>
          </div>
          {rows.map((r) => (
            <div key={r.id} className={`${grid} items-center border-b border-[#edf2f6] px-7 py-2.5 font-mono text-xs`}>
              <span className="text-muted">{fmtDateTime(r.createdAt)}</span>
              <span className="truncate">{r.actor}</span>
              <span className={`font-medium ${DANGER.has(r.event) ? "text-[#A13D2D]" : ""}`}>{r.event}</span>
              <span className="text-muted">
                {r.conversationId ? <Link href={`/admin/c/${r.conversationId}`} className="hover:text-ink">#{r.conversationId}</Link> : "—"}
              </span>
              <span className="truncate text-muted">{r.ip ?? "—"}</span>
              <span className="truncate font-sans text-[13px] text-[#2a3446]" title={logDetail(r)}>{logDetail(r)}</span>
            </div>
          ))}
          {rows.length === 0 && <div className="p-10 text-center text-sm text-muted">ไม่พบเหตุการณ์</div>}
        </div>
      </div>
      <div className="flex items-center justify-between px-7 py-4 text-[13px] text-muted">
        <span>{filtered.n.toLocaleString()} รายการ</span>
        <span className="flex gap-3">
          {page > 1 && <Link href={qs({ page: String(page - 1) })}>← ก่อนหน้า</Link>}
          {page * PAGE < filtered.n && <Link href={qs({ page: String(page + 1) })}>ถัดไป →</Link>}
        </span>
      </div>
    </>
  );
}

async function Archive() {
  const c = schema.conversations;
  const settings = await getSettings();
  const rows = await db.select().from(c).where(isNotNull(c.archivedAt)).orderBy(desc(c.archivedAt)).limit(500);
  return (
    <div className="flex flex-col">
      <p className="border-b border-[#e3eaf1] bg-paper px-7 py-3 text-[13px] text-muted">
        บทสนทนาที่ไม่มีความเคลื่อนไหว {settings.retentionMonths} เดือน ถูกซ่อนจากหน้า Inbox อัตโนมัติ ข้อมูลยังอยู่ครบในฐานข้อมูลเพื่อตรวจสอบย้อนหลัง —
        กด “ขยาย 6 เดือน” ในหน้ารายละเอียดเพื่อนำกลับ หรือเมื่อลูกค้ากลับมาคุยต่อจะกลับขึ้น Inbox เอง
      </p>
      {rows.map((r) => (
        <Link key={r.id} href={`/admin/c/${r.id}`} className="flex flex-wrap gap-x-4 border-b border-[#edf2f6] px-7 py-3 text-[13px] hover:bg-paper">
          <span className="font-mono text-[11px] text-muted">{r.code}</span>
          <span className="font-medium">{r.contactName ?? "ไม่ระบุชื่อ"}</span>
          <span className="text-muted">{r.title ?? "—"}</span>
          <span className="ml-auto font-mono text-xs text-muted">
            {SOURCE_LABEL[r.source] ?? r.source} · {STATUS_LABEL[r.status]} · เก็บเข้าคลัง {fmtDate(r.archivedAt!)}
          </span>
        </Link>
      ))}
      {rows.length === 0 && <div className="p-10 text-center text-sm text-muted">ยังไม่มีบทสนทนาในคลัง</div>}
    </div>
  );
}
