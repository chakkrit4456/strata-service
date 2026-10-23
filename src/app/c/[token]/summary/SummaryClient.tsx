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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-[#F1EEE8] py-4 md:grid-cols-[150px_1fr] md:gap-6">
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
    <span className="text-[#A9A59C]">-</span>
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

  const input = "w-full rounded-md border border-sand-2 bg-white px-3 py-2 text-sm outline-none focus:border-gold";
  const contactLine = [r.contact.name, r.contact.phone, r.contact.line && `LINE ${r.contact.line}`, r.contact.email]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-dvh bg-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[1fr_340px]">
        <div>
          <Link href={`/c/${token}`} className="no-print text-sm text-gold-dark hover:text-ink">
            ← กลับไปแชท
          </Link>
          <article className="mt-4 rounded-xl border border-sand bg-white p-6 md:p-10">
            <div className="font-mono text-xs tracking-wide text-gold-dark">
              REQUIREMENT · {code} ·{" "}
              {new Date(createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
            </div>
            <h1 className="mt-2 text-2xl font-semibold md:text-3xl">{r.title || "โปรเจกต์ใหม่"}</h1>
            <p className="mt-1 text-sm text-muted">
              {r.organization ? `${r.organization} · ` : ""}มาจาก {SOURCE_NAME[source] ?? source} · {categoryName(r.category)}
            </p>
            <div className="mt-6">
              <Row label="ผู้ติดต่อ">{contactLine || <span className="text-red-700">ยังไม่ครบ — กรอกด้านขวา</span>}</Row>
              <Row label="เป้าหมาย">{r.goal ?? "-"}</Row>
              {r.users && <Row label="ผู้ใช้">{r.users}</Row>}
              <Row label="ต้องมี"><List items={r.mustHave} /></Row>
              <Row label="ถ้ามีจะดี"><List items={r.niceToHave} /></Row>
              <Row label="ไฟล์ / ตัวอย่าง"><List items={r.references} /></Row>
              <Row label="งบ / กำหนด">
                {r.budget ?? "ไม่ระบุงบ"} · {r.deadline ?? "ไม่ระบุกำหนดส่ง"}
              </Row>
            </div>
            {r.openQuestions.length > 0 && (
              <div className="mt-6 rounded-lg bg-gold-soft p-4 text-sm">
                <div className="font-medium text-gold-text">คำถามที่ทีมจะถามเพิ่ม</div>
                <div className="mt-1">{r.openQuestions.join(" · ")}</div>
              </div>
            )}
          </article>
        </div>

        <aside className="no-print flex flex-col gap-5 lg:pt-9">
          <div className="rounded-xl bg-ink p-6 text-cream">
            <div className="font-mono text-xs text-gold">ขั้นตอนถัดไป</div>
            <div className="mt-2 text-lg font-semibold">Strata จะติดต่อกลับพร้อมใบเสนอราคา</div>
            <ol className="mt-4 flex flex-col gap-2.5 text-sm text-stone-1">
              <li><span className="mr-2 font-mono text-gold">01</span>ทีมตรวจ Requirement</li>
              <li><span className="mr-2 font-mono text-gold">02</span>ติดต่อกลับตามช่องทางที่ให้ไว้</li>
              <li><span className="mr-2 font-mono text-gold">03</span>ส่งใบเสนอราคาให้พิจารณา</li>
            </ol>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-sand bg-white p-5">
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
            <div className="rounded-xl border border-gold bg-gold-soft p-5 text-sm leading-relaxed text-gold-text">{done}</div>
          ) : null}
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            onClick={confirm}
            disabled={busy || !hasContact(r)}
            className="rounded-lg bg-ink p-3.5 text-sm font-semibold text-cream hover:bg-ink-2 disabled:opacity-40"
          >
            {busy ? "กำลังส่ง…" : done ? "อัปเดตและส่งอีกครั้ง" : "ยืนยันและส่งให้ Strata"}
          </button>
          <Link href={`/c/${token}`} className="rounded-lg border border-sand-2 p-3 text-center text-sm font-medium hover:bg-white">
            แก้ไขเพิ่มเติมในแชท
          </Link>
          <div className="flex justify-center gap-3 text-sm text-gold-dark">
            <button onClick={() => window.print()} className="hover:text-ink">ดาวน์โหลด PDF</button>·
            <button onClick={downloadMd} className="hover:text-ink">Markdown</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
