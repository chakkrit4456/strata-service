"use client";

import { useState } from "react";
import Link from "next/link";
import { type Requirement, categoryName, hasContact, requirementToMarkdown } from "@/lib/requirement";

type Props = {
  token: string;
  code: string;
  source: string;
  createdAt: string;
  confirmedAt: string | null;
  initial: Requirement;
};

const SOURCE_NAME: Record<string, string> = { fastwork: "Fastwork", facebook: "Facebook", google: "Google", direct: "เว็บไซต์" };

function Row({ label, children, i = 0 }: { label: string; children: React.ReactNode; i?: number }) {
  return (
    <div
      className="anim-fade-up grid gap-1 border-b border-[#e8eef4] py-4 md:grid-cols-[150px_1fr] md:gap-6"
      style={{ "--delay": `${150 + i * 70}ms` } as React.CSSProperties}
    >
      <span className="text-[13px] text-muted">{label}</span>
      <div className="text-[15px] leading-relaxed">{children}</div>
    </div>
  );
}

const List = ({ items }: { items: string[] }) =>
  items.length ? (
    <ul className="flex flex-col gap-1">
      {items.map((x) => (
        <li key={x}>— {x}</li>
      ))}
    </ul>
  ) : (
    <span className="text-[#8a9bb0]">-</span>
  );

export function SummaryClient({ token, code, source, createdAt, confirmedAt, initial }: Props) {
  const [r, setR] = useState(initial);
  const [done, setDone] = useState<string | null>(confirmedAt ? "ส่งให้ Strata แล้ว" : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const setContact = (k: keyof Requirement["contact"], v: string) => setR({ ...r, contact: { ...r.contact, [k]: v || null } });

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/requirements/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, requirement: r }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(data.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  function downloadMd() {
    const blob = new Blob([requirementToMarkdown(r, code, SOURCE_NAME[source] ?? source)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `requirement-${code}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const input = "w-full border border-sand-2 bg-pale px-3.5 py-3 text-[15px] outline-none transition focus:border-gold focus:bg-white";
  const contactLine = [r.contact.name, r.contact.phone, r.contact.line && `LINE ${r.contact.line}`, r.contact.email]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#c5d3e0,#dbe4ec_30%)]">
      <div className="mx-auto grid max-w-6xl gap-6 px-3 py-6 md:px-8 md:py-10 lg:grid-cols-[1fr_360px]">
        <div>
          <Link href={`/c/${token}`} className="no-print link-line text-sm">
            ← กลับไปแชท
          </Link>
          <article className="slide corners anim-fade-up relative mt-4 overflow-hidden p-6 md:p-12">
            <div className="text-[13px] font-medium text-muted">
              REQUIREMENT · {code} ·{" "}
              {new Date(createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
            </div>
            <h1 className="mt-3 text-[clamp(30px,4vw,52px)] leading-[1.05] font-medium tracking-[-0.045em]">{r.title || "โปรเจกต์ใหม่"}</h1>
            <p className="mt-3 text-sm text-muted">
              {r.organization ? `${r.organization} · ` : ""}มาจาก {SOURCE_NAME[source] ?? source} · {categoryName(r.category)}
            </p>
            <div className="mt-6">
              <Row i={0} label="ผู้ติดต่อ">{contactLine || <span className="text-red-700">ยังไม่ครบ — กรอกด้านขวา</span>}</Row>
              <Row i={1} label="เป้าหมาย">{r.goal ?? "-"}</Row>
              {r.users && <Row i={2} label="ผู้ใช้">{r.users}</Row>}
              <Row i={3} label="ต้องมี"><List items={r.mustHave} /></Row>
              <Row i={4} label="ถ้ามีจะดี"><List items={r.niceToHave} /></Row>
              <Row i={5} label="ไฟล์ / ตัวอย่าง"><List items={r.references} /></Row>
              <Row i={6} label="งบ / กำหนด">
                {r.budget ?? "ไม่ระบุงบ"} · {r.deadline ?? "ไม่ระบุกำหนดส่ง"}
              </Row>
            </div>
            {r.openQuestions.length > 0 && (
              <div className="mt-6 bg-pale p-5 text-sm">
                <div className="font-medium text-ink-2">คำถามที่ทีมจะถามเพิ่ม</div>
                <div className="mt-1">{r.openQuestions.join(" · ")}</div>
              </div>
            )}
          </article>
        </div>

        <aside className="no-print flex flex-col gap-5 lg:pt-9">
          <div className="slide-navy corners anim-fade-up relative overflow-hidden p-7" style={{ "--delay": "120ms" } as React.CSSProperties}>
            <span aria-hidden className="anim-orbit pointer-events-none absolute -top-24 -right-24 size-64 rounded-full border border-white/20">
              <span className="orb absolute top-0 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2" />
            </span>
            <div className="text-[13px] text-stone-2">ขั้นตอนถัดไป</div>
            <div className="mt-2 text-2xl leading-tight font-medium tracking-[-0.035em]">Strata จะติดต่อกลับพร้อมใบเสนอราคา</div>
            <ol className="mt-5 flex flex-col gap-3 text-sm text-stone-1">
              <li><span className="mr-3 text-stone-2">01</span>ทีมตรวจ Requirement</li>
              <li><span className="mr-3 text-stone-2">02</span>ติดต่อกลับตามช่องทางที่ให้ไว้</li>
              <li><span className="mr-3 text-stone-2">03</span>ส่งใบเสนอราคาให้พิจารณา</li>
            </ol>
          </div>

          <div className="slide flex flex-col gap-3 p-6">
            <div className="text-sm font-semibold">ข้อมูลติดต่อ (จำเป็น)</div>
            <input className={input} placeholder="ชื่อ *" value={r.contact.name ?? ""} onChange={(e) => setContact("name", e.target.value)} />
            <input className={input} placeholder="เบอร์โทร *" inputMode="tel" value={r.contact.phone ?? ""} onChange={(e) => setContact("phone", e.target.value)} />
            <input className={input} placeholder="LINE ID" value={r.contact.line ?? ""} onChange={(e) => setContact("line", e.target.value)} />
            <input className={input} placeholder="อีเมล" type="email" value={r.contact.email ?? ""} onChange={(e) => setContact("email", e.target.value)} />
            <span className="text-xs text-muted">ต้องมี LINE หรืออีเมล อย่างน้อยหนึ่งช่อง</span>
            <div className="mt-1 text-sm font-semibold">งบ / กำหนดส่ง</div>
            <input className={input} placeholder="งบประมาณ (ถ้ามี)" value={r.budget ?? ""} onChange={(e) => setR({ ...r, budget: e.target.value || null })} />
            <input className={input} placeholder="กำหนดส่ง" value={r.deadline ?? ""} onChange={(e) => setR({ ...r, deadline: e.target.value || null })} />
          </div>

          {done ? (
            <div className="slide-pale anim-fade-up flex gap-3 p-5 text-sm leading-relaxed text-ink">
              <svg viewBox="0 0 24 24" className="size-7 flex-none" aria-hidden>
                <circle cx="12" cy="12" r="11" fill="#1a2333" />
                <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="draw-check" />
              </svg>
              <span>{done}</span>
            </div>
          ) : null}
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            onClick={confirm}
            disabled={busy || !hasContact(r)}
            className="btn-pill disabled:opacity-40"
          >
            <span>{busy ? "กำลังส่ง…" : done ? "อัปเดตและส่งอีกครั้ง" : "ยืนยันและส่งให้ Strata"}</span>
          </button>
          <Link href={`/c/${token}`} className="rounded-full border border-ink py-3 text-center text-sm font-medium transition hover:bg-ink hover:text-white">
            แก้ไขเพิ่มเติมในแชท
          </Link>
          <div className="flex justify-center gap-4 text-sm">
            <button onClick={() => window.print()} className="link-line">ดาวน์โหลด PDF</button>
            <button onClick={downloadMd} className="link-line">Markdown</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
