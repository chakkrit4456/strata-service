"use client";

import { useState } from "react";
import { PACKAGES } from "@/lib/packages";
import { CategoryStart } from "@/components/StartChat";
import { CategoryIcon } from "./icons";

// แท็บแพ็กเกจ 8 บริการ — โครงแบบ membership ของเทมเพลต (แผนกลางเป็นสไลด์กรมท่า)
export function PackagesTabs() {
  const [key, setKey] = useState(PACKAGES[0].key);
  const group = PACKAGES.find((p) => p.key === key)!;
  return (
    <div className="relative flex flex-col gap-6">
      <div role="tablist" aria-label="หมวดบริการ" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap">
        {PACKAGES.map((p) => {
          const on = p.key === key;
          return (
            <button
              key={p.key}
              role="tab"
              aria-selected={on}
              onClick={() => setKey(p.key)}
              className={`flex flex-none items-center gap-2 rounded-full border px-4 py-2 text-sm transition duration-300 ${
                on ? "border-ink bg-ink text-white" : "border-sand-2 bg-white text-ink hover:border-ink"
              }`}
            >
              <CategoryIcon name={p.key} className="size-4" />
              {p.label}
            </button>
          );
        })}
      </div>

      <div key={key} className="mb-plans">
        {group.tiers.map((t, i) => (
          <div
            key={t.name}
            className={`mb-plan anim-fade-up ${t.hot ? "mb-plan--featured" : ""}`}
            style={{ "--delay": `${i * 80}ms` } as React.CSSProperties}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="t-6">{t.name}</h3>
              {t.hot && <span className="flex-none rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink">ยอดนิยม</span>}
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-sm ${t.hot ? "text-stone-2" : "text-muted"}`}>เริ่มต้น</span>
              <span className="text-[clamp(36px,3.6vw,52px)] leading-none font-medium tracking-[-0.045em]">฿{t.price}</span>
              {t.unit && <span className={`text-sm ${t.hot ? "text-stone-2" : "text-muted"}`}>{t.unit}</span>}
            </div>
            <p className={`text-sm ${t.hot ? "text-stone-2" : "text-muted"}`}>ระยะเวลา {t.time}</p>
            <ul className="mb-inc">
              {t.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <CategoryStart category={key} className={`${t.hot ? "btn-pill-light" : "btn-pill"} self-start`}>
              <span>คุยเรื่องนี้กับ AI</span>
            </CategoryStart>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">
        {group.note} · ราคาเริ่มต้น — ราคาจริงประเมินจาก Requirement หลังคุย
      </p>
    </div>
  );
}
