import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { STATUSES } from "@/db/schema";
import { audit } from "@/lib/audit";
import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { getAttachments, getMessages, getRequirement, requirementOf } from "@/lib/conversations";
import { requirementToMarkdown } from "@/lib/requirement";
import { SOURCE_LABEL, STATUS_LABEL, daysLeft, expiresAt, fmtDate, fmtDateTime } from "@/lib/retention";
import { Messages } from "@/components/Messages";
import { RequirementPanel } from "@/components/RequirementPanel";
import { addNote, adminReply, pin, setStatus, setTakeover } from "../../../actions";

export default async function ConversationDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [c] = await db.select().from(schema.conversations).where(eq(schema.conversations.id, id));
  if (!c) notFound();

  const [msgs, req, files, notes, settings] = await Promise.all([
    getMessages(id),
    getRequirement(id),
    getAttachments(id),
    db.select().from(schema.adminNotes).where(eq(schema.adminNotes.conversationId, id)).orderBy(asc(schema.adminNotes.id)),
    getSettings(),
  ]);
  const recentLogs = await db
    .select()
    .from(schema.auditLogs)
    .where(eq(schema.auditLogs.conversationId, id))
    .orderBy(desc(schema.auditLogs.id))
    .limit(15);
  await audit("admin.viewed", `admin:${user}`, { conversationId: id });

  const requirement = requirementOf(req);
  const exp = expiresAt(c, settings.retentionMonths);
  const md = requirementToMarkdown(requirement, c.code, SOURCE_LABEL[c.source] ?? c.source);
  const btn = "rounded-md border border-sand px-3 py-1.5 text-[13px] hover:bg-paper";

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEEBE4] px-4 py-4 md:px-7">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5 text-sm">
          <Link href="/admin" className="text-muted hover:text-ink">บทสนทนาทั้งหมด</Link>
          <span className="text-muted">/</span>
          <span className="font-mono text-xs">{c.code}</span>
          <span className="font-semibold">{c.contactName ?? "ไม่ระบุชื่อ"}</span>
          <span className="rounded bg-gold-soft px-2 py-0.5 font-mono text-[11px] text-gold-text">{SOURCE_LABEL[c.source] ?? c.source}</span>
          {c.archivedAt && <span className="rounded bg-sand px-2 py-0.5 text-[11px]">อยู่ในคลัง</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form action={async (f: FormData) => { "use server"; await setStatus(id, f.get("status") as never); }} className="flex gap-1">
            <select name="status" defaultValue={c.status} className="rounded-md border border-sand px-2.5 py-1.5 text-[13px]">
              {STATUSES.map((s) => (
                <option key={s} value={s}>สถานะ: {STATUS_LABEL[s]}</option>
              ))}
            </select>
            <button className={btn}>บันทึก</button>
          </form>
          <form action={async () => { "use server"; await setTakeover(id, c.aiEnabled); }}>
            <button className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold ${c.aiEnabled ? "bg-ink text-cream" : "bg-gold text-ink"}`}>
              {c.aiEnabled ? "รับช่วงต่อจาก AI" : "คืนให้ AI ตอบ"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-h-0 flex-col">
          <div className="flex flex-col gap-4.5 overflow-y-auto px-4 py-6 md:px-10">
            <div className="text-center font-mono text-[11px] text-muted">
              {fmtDateTime(c.createdAt)} · เริ่มแชทจาก {SOURCE_LABEL[c.source] ?? c.source}
              {c.referrer ? ` (${c.referrer})` : ""} · IP {c.ip ?? "-"}
              {Object.keys(c.utm).length > 0 && ` · ${Object.entries(c.utm).map(([k, v]) => `${k}=${v}`).join(" ")}`}
            </div>
            <Messages
              perspective="admin"
              messages={msgs
                .filter((m) => m.role !== "system")
                .map((m) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt }))}
            />
          </div>
          <form action={adminReply.bind(null, id)} className="mt-auto border-t border-[#EEEBE4] bg-paper px-4 py-4 md:px-10">
            <div className="mb-2 text-xs text-muted">
              ตอบในนาม Strata — ลูกค้าเห็นข้อความในแชททันที {c.aiEnabled && "(AI จะหยุดตอบในแชทนี้อัตโนมัติ)"}
            </div>
            <div className="flex gap-2">
              <textarea name="message" rows={2} required className="flex-1 resize-y rounded-md border border-sand-2 bg-white px-3 py-2 text-sm outline-none focus:border-gold" placeholder="พิมพ์เพื่อตอบลูกค้าโดยตรง…" />
              <button className="self-end rounded-md bg-ink px-4 py-2 text-sm font-semibold text-cream">ส่ง</button>
            </div>
          </form>
        </div>

        <div className="flex min-h-0 flex-col border-l border-sand">
          <RequirementPanel requirement={requirement} />
          <div className="flex flex-col gap-5 border-t border-[#EEEBE4] px-7 py-5 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted">Requirement</span>
              <span>
                {req?.confirmedAt ? `ลูกค้ายืนยันแล้ว ${fmtDateTime(req.confirmedAt)}` : "ยังไม่ยืนยัน"} · v{req?.version ?? 0}
              </span>
              <div className="mt-1 flex gap-2">
                <a href={`data:text/markdown;charset=utf-8,${encodeURIComponent(md)}`} download={`requirement-${c.code}.md`} className={btn}>
                  Markdown
                </a>
                <a href={`/c/${c.publicToken}/summary`} target="_blank" className={btn}>
                  หน้าสรุป / PDF
                </a>
              </div>
            </div>

            {files.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted">ไฟล์แนบ</span>
                {files.map((f) => (
                  <a key={f.id} href={`/api/files/${f.id}`} className="truncate text-gold-dark hover:text-ink">
                    📎 {f.fileName} <span className="font-mono text-xs text-muted">{(f.size / 1024).toFixed(0)} KB</span>
                  </a>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted">การแสดงผล</span>
              <span className={daysLeft(exp) <= 7 ? "font-semibold text-[#A13D2D]" : ""}>
                แสดงถึง {fmtDate(exp)} (อีก {Math.max(0, daysLeft(exp))} วัน){c.pinnedUntil && " · ปักหมุดแล้ว"}
              </span>
              <div className="mt-1 flex gap-2">
                <form action={async () => { "use server"; await pin(id, 6); }}>
                  <button className={btn}>📌 ขยาย 6 เดือน</button>
                </form>
                {c.pinnedUntil && (
                  <form action={async () => { "use server"; await pin(id, 0); }}>
                    <button className={btn}>ยกเลิกปักหมุด</button>
                  </form>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted">โน้ตภายใน (ลูกค้าไม่เห็น)</span>
              {notes.map((n) => (
                <div key={n.id} className="rounded-md bg-gold-soft px-3 py-2 text-[13px]">
                  <div className="prose-chat">{n.content}</div>
                  <div className="mt-1 font-mono text-[10px] text-gold-text">{fmtDateTime(n.createdAt)}</div>
                </div>
              ))}
              <form action={addNote.bind(null, id)} className="flex gap-2">
                <input name="note" required placeholder="เพิ่มโน้ต…" className="flex-1 rounded-md border border-sand px-3 py-1.5 text-[13px] outline-none focus:border-gold" />
                <button className={btn}>เพิ่ม</button>
              </form>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted">กิจกรรมล่าสุด</span>
              {recentLogs.map((l) => (
                <div key={l.id} className="flex justify-between gap-2 font-mono text-[11px]">
                  <span>{l.event}</span>
                  <span className="text-muted">{fmtDateTime(l.createdAt)}</span>
                </div>
              ))}
              <Link href={`/admin/logs?conv=${id}`} className="mt-1 text-xs text-gold-dark hover:text-ink">ดู log ทั้งหมดของแชทนี้ →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
