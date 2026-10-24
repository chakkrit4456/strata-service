"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/requirement";
import { useTypewriter } from "@/components/fx/useTypewriter";

const EXAMPLES = [
  "อยากได้ระบบสต็อกร้าน 2 สาขา แจ้งเตือนเข้า LINE…",
  "ช่วยตัดต่อคลิปรีวิวสินค้าด้วย CapCut 10 คลิป…",
  "ทำ Dashboard ยอดขายใน Excel ให้อัปเดตอัตโนมัติ…",
  "แชทบอทตอบลูกค้าบนเพจ Facebook…",
  "แก้บั๊กเว็บ PHP เดิม หน้าชำระเงินค้าง…",
  "สไลด์ PowerPoint นำเสนอนักลงทุน 15 หน้า…",
];

const QUICK = ["software", "ai", "code", "powerpoint"] as const;

export function startPayload(category?: string) {
  const q = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  q.forEach((v, k) => {
    if (k.startsWith("utm_")) utm[k] = v;
  });
  let referrer = document.referrer;
  try {
    if (referrer && new URL(referrer).host === window.location.host) referrer = "";
  } catch {}
  return { source: q.get("src") ?? q.get("source") ?? undefined, utm, referrer, category };
}

export function StartChat({ tone = "light" }: { tone?: "light" | "dark" }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [last, setLast] = useState<string | null>(null);
  const placeholder = useTypewriter(EXAMPLES, !text);

  useEffect(() => {
    try {
      setLast(localStorage.getItem("strata:last"));
    } catch {}
  }, []);

  async function start(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(startPayload(category)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เริ่มแชทไม่สำเร็จ");
      const first =
        text.trim() || (category ? `สนใจบริการ ${CATEGORIES.find((c) => c.key === category)?.name}` : "");
      try {
        if (first) sessionStorage.setItem(`strata:pending:${data.token}`, first);
        localStorage.setItem("strata:last", data.token);
      } catch {}
      router.push(`/c/${data.token}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={start}
        className="flex w-full flex-col gap-4 rounded-[22px] border border-sand bg-white p-4 text-ink shadow-[0_30px_60px_-30px_rgb(26_35_51/0.5)] transition focus-within:border-gold/60 focus-within:shadow-[0_0_0_4px_rgb(47_84_224/0.12)] md:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="anim-pulse-dot mt-2 size-2 flex-none rounded-full bg-brand" />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                start();
              }
            }}
            rows={2}
            maxLength={4000}
            placeholder={`เช่น ${placeholder}`}
            aria-label="เล่าโปรเจกต์ของคุณ"
            className="w-full resize-none bg-transparent text-base leading-relaxed text-ink outline-none placeholder:text-stone-3"
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 text-[13px] text-muted">
            {QUICK.map((k) => {
              const c = CATEGORIES.find((x) => x.key === k)!;
              const on = category === k;
              return (
                <button
                  type="button"
                  key={k}
                  onClick={() => setCategory(on ? undefined : k)}
                  className={`rounded-full border px-3 py-1.5 transition duration-200 ${
                    on ? "border-ink-2 bg-ink-2 text-white" : "border-sand hover:border-ink-2 hover:text-ink"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
          <button
            type="submit"
            disabled={busy}
            aria-label="เริ่มคุย"
            className="flex size-11 flex-none items-center justify-center rounded-full bg-ink text-lg font-semibold text-white transition hover:-translate-y-0.5 hover:bg-gold disabled:opacity-50"
          >
            {busy ? "…" : "↑"}
          </button>
        </div>
      </form>
      {error && <p className={`text-sm ${tone === "dark" ? "text-red-300" : "text-red-700"}`}>{error}</p>}
      <p className={`text-xs ${tone === "dark" ? "text-stone-2" : "text-muted"}`}>
        มาจาก Fastwork หรือ Facebook? เริ่มคุยต่อที่นี่ได้เลย
        {last && (
          <>
            {" · "}
            <a href={`/c/${last}`} className="link-line">
              กลับไปแชทเดิม
            </a>
          </>
        )}
      </p>
    </div>
  );
}

export function CategoryStart({ category, children, className }: { category: string; children: React.ReactNode; className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      aria-busy={busy}
      className={className}
      onClick={async () => {
        setBusy(true);
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(startPayload(category)),
        });
        const data = await res.json();
        if (!res.ok) return setBusy(false);
        try {
          sessionStorage.setItem(
            `strata:pending:${data.token}`,
            `สนใจบริการ ${CATEGORIES.find((c) => c.key === category)?.name}`,
          );
          localStorage.setItem("strata:last", data.token);
        } catch {}
        router.push(`/c/${data.token}`);
      }}
    >
      {children}
    </button>
  );
}
