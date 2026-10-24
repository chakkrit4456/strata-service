import Link from "next/link";
import { and, desc, eq, gte, ilike, inArray, isNull, or, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { STATUSES } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { CATEGORIES, categoryName } from "@/lib/requirement";
import { SOURCE_LABEL, STATUS_LABEL, daysLeft, expiresAt, fmtDate } from "@/lib/retention";

type SP = { q?: string; source?: string; category?: string; status?: string; view?: string; range?: string };

export default async function Inbox({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const c = schema.conversations;
  const settings = await getSettings();

  const where: SQL[] = [isNull(c.archivedAt)];
  if (sp.q) {
    const q = `%${sp.q.trim()}%`;
    where.push(or(ilike(c.code, q), ilike(c.title, q), ilike(c.contactName, q), ilike(c.contactPhone, q), ilike(c.contactLine, q), ilike(c.contactEmail, q))!);
  }
  if (sp.source) where.push(eq(c.source, sp.source));
  if (sp.category) where.push(eq(c.category, sp.category));
  if (sp.status === "open") where.push(inArray(c.status, ["new", "chatting"]));
  else if (sp.status) where.push(eq(c.status, sp.status as never));
  const days = Number(sp.range);
  if (days > 0) where.push(gte(c.lastActivityAt, new Date(Date.now() - days * 86_400_000)));

  const rows = await db.select().from(c).where(and(...where)).orderBy(desc(c.lastActivityAt)).limit(500);
  const withExp = rows.map((r) => ({ ...r, exp: expiresAt(r, settings.retentionMonths) }));
  const soon = withExp.filter((r) => daysLeft(r.exp) <= 7).length;
  const view = sp.view === "board" ? "board" : "list";
  const qs = (patch: Partial<SP>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin?${p}`;
  };
  const groups = STATUSES.map((s) => ({ s, items: withExp.filter((r) => r.status === s) }));

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-col gap-3.5 border-b border-[#e3eaf1] px-4 pt-4.5 md:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="orb size-7" />
            <h1 className="text-[28px] leading-none font-medium tracking-[-0.04em]">บทสนทนาทั้งหมด</h1>
          </div>
          <form className="flex gap-2">
            {Object.entries(sp)
              .filter(([k, v]) => k !== "q" && v)
              .map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
            <input
              name="q"
              defaultValue={sp.q}
              placeholder="ค้นหาลูกค้า, รหัส, เบอร์, LINE"
              className="w-56 rounded-md border border-sand px-3 py-1.5 text-[13px] outline-none focus:border-gold"
            />
          </form>
        </div>
        <div className="flex gap-6 text-sm">
          {(["list", "board"] as const).map((v) => (
            <Link
              key={v}
              href={qs({ view: v === "list" ? undefined : v })}
              className={`pb-2.5 ${view === v ? "border-b-2 border-ink font-semibold" : "text-muted"}`}
            >
              {v === "list" ? "รายการ" : "บอร์ด"}
            </Link>
          ))}
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-2 border-b border-[#e3eaf1] px-4 py-3 text-[13px] md:px-7">
        {sp.q && <input type="hidden" name="q" value={sp.q} />}
        {sp.view && <input type="hidden" name="view" value={sp.view} />}
        <select name="source" defaultValue={sp.source ?? ""} className="rounded-md border border-sand px-2.5 py-1.5">
          <option value="">ช่องทาง: ทั้งหมด</option>
          {Object.entries(SOURCE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select name="category" defaultValue={sp.category ?? ""} className="rounded-md border border-sand px-2.5 py-1.5">
          <option value="">หมวด: ทั้งหมด</option>
          {CATEGORIES.map((x) => (
            <option key={x.key} value={x.key}>{x.name}</option>
          ))}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className="rounded-md border border-sand px-2.5 py-1.5">
          <option value="">สถานะ: ทั้งหมด</option>
          <option value="open">ใหม่ + กำลังคุย</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <select name="range" defaultValue={sp.range ?? ""} className="rounded-md border border-sand px-2.5 py-1.5">
          <option value="">{settings.retentionMonths} เดือนล่าสุด</option>
          <option value="1">วันนี้</option>
          <option value="7">7 วัน</option>
          <option value="30">30 วัน</option>
        </select>
        <button className="rounded-full bg-ink px-4 py-1.5 text-white">กรอง</button>
        {soon > 0 && (
          <span className="ml-auto flex items-center gap-2 rounded-md bg-gold-soft px-3 py-1.5 text-gold-text">
            <span className="size-1.5 bg-gold" />
            {soon} รายการจะย้ายเข้าคลังภายใน 7 วัน
          </span>
        )}
      </form>

      {rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-16 text-center text-muted">
          <span className="size-2.5 bg-gold" />
          ยังไม่มีบทสนทนา — แชร์ลิงก์ <code className="font-mono text-xs">/?src=fastwork</code> ให้ลูกค้าเพื่อเริ่ม
        </div>
      ) : view === "board" ? (
        <div className="grid flex-1 auto-cols-[280px] grid-flow-col gap-4 overflow-x-auto bg-paper p-4 md:p-7">
          {groups.map((g) => (
            <div key={g.s} className="flex flex-col gap-2.5">
              <div className="flex items-baseline gap-2 px-1 text-sm font-semibold">
                {STATUS_LABEL[g.s]} <span className="font-mono text-xs text-muted">{g.items.length}</span>
              </div>
              {g.items.map((r) => (
                <Link key={r.id} href={`/admin/c/${r.id}`} className="flex flex-col gap-2 rounded-lg border border-sand bg-white p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-gold hover:shadow-[0_8px_20px_-8px_rgb(26_35_51/0.35)]">
                  <span className="font-mono text-[11px] text-muted">{r.code} · {SOURCE_LABEL[r.source] ?? r.source}</span>
                  <span className="text-sm font-medium">{r.contactName ?? "ไม่ระบุชื่อ"}</span>
                  <span className="line-clamp-2 text-[13px] text-muted">{r.title ?? "—"}</span>
                  <Pct pct={r.completeness} />
                </Link>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[minmax(0,2.2fr)_100px_140px_110px_110px_90px_110px] gap-4 border-b border-[#e3eaf1] px-7 py-2 text-xs text-muted">
              <span>ลูกค้า / หัวข้อ</span><span>ช่องทาง</span><span>หมวดบริการ</span><span>งบ</span><span>ความครบ</span><span>อัปเดต</span><span>แสดงถึง</span>
            </div>
            {groups
              .filter((g) => g.items.length)
              .map((g) => (
                <section key={g.s}>
                  <div className="flex items-baseline gap-2 border-b border-[#e3eaf1] bg-paper px-7 py-2 text-sm font-semibold">
                    ▾ {STATUS_LABEL[g.s]} <span className="font-mono text-xs font-normal text-muted">{g.items.length}</span>
                  </div>
                  {g.items.map((r) => {
                    const left = daysLeft(r.exp);
                    return (
                      <Link
                        key={r.id}
                        href={`/admin/c/${r.id}`}
                        className="grid grid-cols-[minmax(0,2.2fr)_100px_140px_110px_110px_90px_110px] items-center gap-4 border-b border-[#edf2f6] px-7 py-3 text-[13px] shadow-[inset_0_0_0_0_#c9ae73] transition-[background-color,box-shadow] duration-200 hover:bg-paper hover:shadow-[inset_3px_0_0_0_#c9ae73]"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="font-mono text-[11px] text-muted">{r.code}</span>
                          <span className="truncate">
                            <span className="font-medium">{r.contactName ?? "ไม่ระบุชื่อ"}</span>
                            <span className="text-muted"> · {r.title ?? "ยังไม่มีหัวข้อ"}</span>
                          </span>
                          {!r.aiEnabled && <span className="rounded bg-gold px-1.5 font-mono text-[10px] text-white">ทีมตอบ</span>}
                        </span>
                        <span>
                          <span className="rounded bg-gold-soft px-2 py-0.5 font-mono text-[11px] text-gold-text">{SOURCE_LABEL[r.source] ?? r.source}</span>
                        </span>
                        <span className="truncate">{categoryName(r.category)}</span>
                        <span className="truncate font-mono text-xs">{r.budget ?? "—"}</span>
                        <Pct pct={r.completeness} />
                        <span className="font-mono text-xs text-muted">{fmtDate(r.lastActivityAt)}</span>
                        <span className={`font-mono text-xs ${left <= 7 ? "font-semibold text-[#A13D2D]" : "text-muted"}`}>
                          {r.pinnedUntil && "📌 "}
                          {fmtDate(r.exp)}
                        </span>
                      </Link>
                    );
                  })}
                </section>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Pct({ pct }: { pct: number }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-1 w-14 overflow-hidden rounded-sm bg-[#e3eaf1]">
        <span className="block h-1 bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
      </span>
      <span className="font-mono text-[11px]">{pct}%</span>
    </span>
  );
}
