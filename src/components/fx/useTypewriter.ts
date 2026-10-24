"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./motion";

// วนพิมพ์/ลบตัวอย่างข้อความ — ใช้เป็น placeholder
export function useTypewriter(lines: string[], active = true) {
  const [text, setText] = useState(lines[0]);
  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    let line = 0;
    let i = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const chars = (s: string) => Array.from(s);
    const step = () => {
      const cur = chars(lines[line]);
      if (!deleting) {
        i++;
        setText(cur.slice(0, i).join(""));
        if (i >= cur.length) {
          deleting = true;
          timer = setTimeout(step, 1800);
          return;
        }
        timer = setTimeout(step, 45);
      } else {
        i--;
        setText(cur.slice(0, i).join(""));
        if (i <= 0) {
          deleting = false;
          line = (line + 1) % lines.length;
          timer = setTimeout(step, 300);
          return;
        }
        timer = setTimeout(step, 18);
      }
    };
    i = 0;
    timer = setTimeout(step, 600);
    return () => clearTimeout(timer);
  }, [lines, active]);
  return text;
}
