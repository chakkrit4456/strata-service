"use client";

import { useEffect, useRef, useState } from "react";
import { type Requirement, completeness, requirementFields } from "@/lib/requirement";

export function RequirementPanel({ requirement, footer, updating }: { requirement: Requirement; footer?: React.ReactNode; updating?: boolean }) {
  const fields = requirementFields(requirement);
  const pct = completeness(requirement);
  const filled = fields.filter((f) => f.value).length;
  // ไฮไลต์หัวข้อที่เพิ่งได้ข้อมูล/เปลี่ยนค่า
  const prev = useRef<Record<string, string | null> | null>(null);
  const [fresh, setFresh] = useState<string[]>([]);
  const signature = fields.map((f) => `${f.label}=${f.value ?? ""}`).join("|");
  useEffect(() => {
    const now = Object.fromEntries(fields.map((f) => [f.label, f.value]));
    if (prev.current) {
      const changed = fields.filter((f) => f.value && f.value !== prev.current![f.label]).map((f) => f.label);
      if (changed.length) {
        setFresh(changed);
        const t = setTimeout(() => setFresh([]), 1700);
        prev.current = now;
        return () => clearTimeout(t);
      }
    }
    prev.current = now;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  return (
    <aside className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3.5 border-b border-[#e3eaf1] px-7 pt-6 pb-5">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-medium tracking-[-0.03em]">Requirement ร่าง</span>
          <span className="text-2xl font-medium tracking-[-0.04em]">{pct}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-sand">
          <div className={`h-1 rounded-full bg-ink-2 transition-all duration-700 ease-out ${updating ? "bar-shimmer" : ""}`} style={{ width: `${Math.max(pct, updating ? 6 : 0)}%` }} />
        </div>
        <span className="text-xs text-muted">
          {updating ? "กำลังอัปเดต…" : "อัปเดตอัตโนมัติระหว่างคุย"} · {filled}/{fields.length} หัวข้อ
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-7 py-2">
        {requirement.title && (
          <div className="border-b border-[#e8eef4] py-3.5">
            <span className="text-xs text-muted">โปรเจกต์</span>
            <div className="text-sm font-semibold">{requirement.title}</div>
          </div>
        )}
        {fields.map((f) => (
          <div key={f.label} className={`-mx-3 flex gap-3 rounded-md border-b border-[#e8eef4] px-3 py-3.5 ${fresh.includes(f.label) ? "anim-highlight" : ""}`}>
            {f.value ? (
              <span className="anim-pop mt-0.5 flex size-4 flex-none items-center justify-center rounded-full bg-ink-2 text-[10px] text-white">✓</span>
            ) : (
              <span className="mt-0.5 size-4 flex-none rounded-full border-[1.5px] border-dashed border-[#9db1c4]" />
            )}
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-xs text-muted">{f.label}</span>
              {f.value ? (
                <span className="text-sm leading-normal break-words">{f.value}</span>
              ) : (
                <span className="text-sm text-[#8a9bb0]">รอข้อมูลจากแชท</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {footer && <div className="flex gap-2.5 border-t border-[#e3eaf1] px-7 py-5">{footer}</div>}
    </aside>
  );
}
