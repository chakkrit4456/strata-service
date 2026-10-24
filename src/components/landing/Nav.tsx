"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";

const LINKS = [
  ["#method", "ขั้นตอน"],
  ["#services", "บริการ"],
  ["#showcase", "ผลงาน"],
  ["#packages", "แพ็กเกจ"],
  ["#faq", "FAQ"],
] as const;

type LenisLike = { stop(): void; start(): void } | null | undefined;
const lenis = () => (window as unknown as { lenis?: LenisLike }).lenis;

// แถบเมนูแคปซูลลอย ซ่อนเมื่อเลื่อนลง แสดงเมื่อเลื่อนขึ้น + เมนูเต็มจอบนมือถือ
export function Nav() {
  const bar = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let lastY = scrollY;
    let turnY = scrollY;
    let hidden = false;
    const on = () => {
      const y = scrollY;
      if (y > lastY) {
        if (hidden) turnY = y;
        else if (y > 160 && y - turnY > 24) {
          hidden = true;
          bar.current?.setAttribute("data-hidden", "");
          turnY = y;
        }
      } else if (y < lastY) {
        if (!hidden) turnY = y;
        else if (turnY - y > 24 || y < 80) {
          hidden = false;
          bar.current?.removeAttribute("data-hidden");
          turnY = y;
        }
      }
      lastY = y;
    };
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (open) lenis()?.stop();
    else lenis()?.start();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  return (
    <header className="nav">
      <div ref={bar} className="nav__bar" onFocus={() => bar.current?.removeAttribute("data-hidden")}>
        <a href="#opening" aria-label="strata กลับด้านบน">
          <Logo />
        </a>
        <p className="nav__line t-4">รับงาน Software · AI · IT ครบวงจร</p>
        <nav aria-label="เมนูหลัก" className="nav__links">
          {LINKS.map(([h, l]) => (
            <a key={h} href={h} className="link-line link-line-hover">
              {l}
            </a>
          ))}
        </nav>
        <a href="#contact" className="btn-pill nav__cta">
          <span>เริ่มคุยโปรเจกต์</span>
        </a>
        <button type="button" className="iconbtn nav__menu" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(true)}>
          <span className="sr-only">เปิดเมนู</span>
          <svg aria-hidden viewBox="0 0 24 24">
            <path d="M4 9h16M4 15h16" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="menu" id="menu" data-lenis-prevent onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}>
          <button type="button" className="iconbtn menu__close" onClick={() => setOpen(false)} autoFocus>
            <span className="sr-only">ปิดเมนู</span>
            <svg aria-hidden viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <nav aria-label="เมนู" className="menu__links">
            {[...LINKS, ["#contact", "ติดต่อ"] as const].map(([h, l]) => (
              <a key={h} href={h}>
                {l}
              </a>
            ))}
          </nav>
          <a href="#contact" className="btn-pill-light mt-8">
            <span>เริ่มคุยโปรเจกต์</span>
          </a>
        </div>
      )}
    </header>
  );
}
