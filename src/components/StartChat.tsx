"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/requirement";

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

export function StartChat() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [last, setLast] = useState<string | null>(null);

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
        className="flex max-w-[600px] flex-col gap-4 rounded-xl border border-ink-line-2 bg-ink-2 p-5"
      >
        <div className="flex items-start gap-3">
          <span className="mt-2 size-2.5 flex-none bg-gold" />
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
            placeholder="เช่น อยากได้ระบบสต็อกร้าน 2 สาขา แจ้งเตือนเข้า LINE…"
            aria-label="เล่าโปรเจกต์ของคุณ"
            className="w-full resize-none bg-transparent text-base leading-relaxed text-cream outline-none placeholder:text-stone-3"
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-[13px] text-stone-1">
            {QUICK.map((k) => {
              const c = CATEGORIES.find((x) => x.key === k)!;
              const on = category === k;
              return (
                <button
                  type="button"
                  key={k}
                  onClick={() => setCategory(on ? undefined : k)}
                  className={`rounded-full border px-3 py-1.5 transition ${
                    on ? "border-gold bg-gold text-ink" : "border-ink-line-2 hover:border-stone-3"
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
            className="flex size-10 flex-none items-center justify-center rounded-lg bg-cream text-lg font-semibold text-ink transition hover:bg-gold disabled:opacity-50"
          >
            {busy ? "…" : "↑"}
          </button>
        </div>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <p className="font-mono text-xs text-stone-3">
        มาจาก Fastwork หรือ Facebook? เริ่มคุยต่อที่นี่ได้เลย
        {last && (
          <>
            {" · "}
            <a href={`/c/${last}`} className="text-gold underline-offset-4 hover:underline">
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
