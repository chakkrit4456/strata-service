import Link from "next/link";
import { count, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { LogoMark } from "@/components/Logo";
import { SOURCE_LABEL } from "@/lib/retention";
import { logout } from "../actions";
import { NavLink } from "./NavLink";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const c = schema.conversations;
  const [byStatus, bySource, [archived], settings] = await Promise.all([
    db.select({ status: c.status, n: count() }).from(c).where(isNull(c.archivedAt)).groupBy(c.status),
    db.select({ source: c.source, n: count() }).from(c).where(isNull(c.archivedAt)).groupBy(c.source).orderBy(sql`count(*) desc`),
    db.select({ n: count() }).from(c).where(sql`${c.archivedAt} is not null`),
    getSettings(),
  ]);
  const s = (k: string) => byStatus.find((x) => x.status === k)?.n ?? 0;
  const total = byStatus.reduce((a, b) => a + b.n, 0);
  const providers = [
    process.env.AI_MOCK === "1" && "mock",
    process.env.GEMINI_API_KEY && settings.geminiModel,
    process.env.GROQ_API_KEY && `fallback ${settings.groqModel}`,
  ].filter(Boolean);

  const nav = [
    { href: "/admin", label: "บทสนทนาทั้งหมด", count: total },
    { href: "/admin?status=open", label: "ใหม่ / กำลังคุย", count: s("new") + s("chatting") },
    { href: "/admin?status=summarized", label: "รอเสนอราคา", count: s("summarized") },
    { href: "/admin/logs", label: "Audit log", count: null },
    { href: "/admin/logs?tab=archive", label: "คลัง (Archive)", count: archived.n },
    { href: "/admin/settings", label: "ตั้งค่า", count: null },
  ];

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="flex flex-none flex-col gap-5 bg-ink px-3 py-4 text-stone-1 md:sticky md:top-0 md:h-dvh md:w-60">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <LogoMark size={26} />
          <span className="text-[15px] font-semibold text-cream">strata</span>
          <span className="ml-auto font-mono text-[10px] text-stone-3">ADMIN</span>
        </div>
        <nav className="flex flex-col gap-0.5 text-sm">
          {nav.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} count={n.count} />
          ))}
        </nav>
        <div className="hidden flex-col gap-0.5 text-[13px] md:flex">
          <span className="px-2.5 pb-1.5 font-mono text-[10px] font-medium tracking-[.08em] text-stone-3">ช่องทางที่มา</span>
          {bySource.map((x) => (
            <Link key={x.source} href={`/admin?source=${x.source}`} className="flex justify-between rounded-md px-2.5 py-1.5 hover:bg-ink-line">
              <span>{SOURCE_LABEL[x.source] ?? x.source}</span>
              <span className="font-mono text-xs text-stone-3">{x.n}</span>
            </Link>
          ))}
        </div>
        <div className="mt-auto hidden flex-col gap-2 rounded-lg bg-ink-2 p-3.5 md:flex">
          <div className="flex items-center gap-2 text-xs text-cream">
            <span className={`size-1.5 rounded-full ${providers.length ? "bg-[#5FA37E]" : "bg-red-500"}`} />
            {providers.length ? "AI พร้อมใช้งาน" : "ยังไม่ได้ตั้ง API key"}
          </div>
          <span className="font-mono text-[11px] text-stone-3">{providers.join(" · ") || "GEMINI_API_KEY / GROQ_API_KEY"}</span>
        </div>
        <form action={logout} className="hidden px-2 md:block">
          <button className="font-mono text-[11px] text-stone-3 hover:text-cream">ออกจากระบบ ({user})</button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 bg-white">{children}</main>
    </div>
  );
}
