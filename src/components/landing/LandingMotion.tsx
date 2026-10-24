"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// อนิเมชันทั้งหน้าแรก พอร์ตจากเทมเพลต arcline (8B, MIT):
// Lenis smooth scroll + เอฟเฟกต์ data-motion (streak/focus/rise/orbit) + ฉากเฉพาะ section
export function LandingMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", blur: "(min-width: 1024px) and (hover: hover)", wide: "(min-width: 861px)" }, (ctx) => {
        const { motion, blur } = ctx.conditions as { motion: boolean; blur: boolean };
        if (!motion) return;

        // ---- smooth scroll ----
        const bar = document.querySelector(".nav__bar");
        const offset = bar ? bar.getBoundingClientRect().bottom + 12 : 0;
        const lenis = new Lenis({ lerp: 0.09, anchors: { offset: -offset } });
        (window as unknown as { lenis: Lenis | null }).lenis = lenis;
        const tick = (time: number) => lenis.raf(time * 1000);
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        // ---- เอฟเฟกต์ทั่วไป ----
        document.querySelectorAll<HTMLElement>('[data-motion~="streak"]').forEach((el) => {
          const dir = el.dataset.from === "left" ? -1 : 1;
          const tl = gsap
            .timeline()
            .fromTo(
              el,
              { x: () => dir * Math.min(innerWidth * 0.22, 320), skewX: -20 * dir, scaleX: 1.15, transformOrigin: dir > 0 ? "100% 50%" : "0% 50%" },
              { x: 0, skewX: 0, scaleX: 1, duration: 1, ease: "expo.out", immediateRender: true },
              0,
            )
            .fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "none", immediateRender: true }, 0);
          ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, animation: tl });
        });
        document.querySelectorAll<HTMLElement>('[data-motion~="focus"]').forEach((el) => {
          const tl = gsap.fromTo(
            el,
            { scale: 1.14, filter: blur ? "blur(14px)" : "none" },
            { scale: 1, filter: blur ? "blur(0px)" : "none", duration: 1.2, ease: "power3.out", immediateRender: true, clearProps: blur ? "filter" : "" },
          );
          ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, animation: tl });
        });
        document.querySelectorAll<HTMLElement>('[data-motion~="rise"]').forEach((el) => {
          const tl = gsap.fromTo(el.children, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.09, ease: "power3.out", immediateRender: true });
          ScrollTrigger.create({ trigger: el, start: "top 86%", once: true, animation: tl });
        });
        document.querySelectorAll<SVGElement>('[data-motion~="orbit"]').forEach((el) => {
          const tl = gsap
            .timeline()
            .fromTo(el, { rotation: -24 }, { rotation: 24, duration: 1, ease: "none", immediateRender: true }, 0)
            .fromTo(el.querySelectorAll("circle"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, stagger: 0.05, ease: "power2.out", immediateRender: true }, 0);
          ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", scrub: true, animation: tl });
        });

        // ---- opening: หัวข้อวิ่งออกข้าง สไลด์หดและมืด สไลด์ที่สองเข้ามา ----
        const op = document.getElementById("opening");
        if (op) {
          const q = (s: string) => op.querySelector(s);
          const vw = (f: number) => () => innerWidth * f;
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: { trigger: op, start: "top top", end: () => "+=" + (q(".op-s1") as HTMLElement).offsetHeight, scrub: true, invalidateOnRefresh: true },
            })
            .to(q(".op-line--1"), { x: vw(-0.6), skewX: 24, scaleX: 1.25, transformOrigin: "100% 50%", duration: 0.7, ease: "power1.in" }, 0)
            .to(q(".op-line--2"), { x: vw(0.55), skewX: -24, scaleX: 1.25, transformOrigin: "0% 50%", duration: 0.66, ease: "power1.in" }, 0.03)
            .to(q(".op-line--3"), { x: vw(-0.75), skewX: 24, scaleX: 1.25, transformOrigin: "100% 50%", duration: 0.62, ease: "power1.in" }, 0.06)
            .to(op.querySelectorAll(".op-line"), { opacity: 0, duration: 0.2 }, 0.5)
            .to(q(".op-meta"), { y: -40, opacity: 0, duration: 0.35 }, 0)
            .to(q(".op-photo"), { scale: 1.3, xPercent: -6, filter: blur ? "blur(10px)" : "none", duration: 1 }, 0)
            .to(q(".op-ring"), { opacity: 0, duration: 0.5 }, 0)
            .to(q(".op-slide"), { scale: 0.8, yPercent: -4, xPercent: 6, duration: 1, ease: "power1.in" }, 0)
            .to(q(".op-dim"), { opacity: 0.78, duration: 1 }, 0)
            .to(q(".op-ground"), { opacity: 0, duration: 1 }, 0)
            .fromTo(q(".op-card"), { x: vw(0.08), rotation: 2.5 }, { x: 0, rotation: 0, duration: 1, ease: "power2.out" }, 0)
            .fromTo(q(".op-title2"), { x: vw(0.35), skewX: -24, scaleX: 1.3, transformOrigin: "0% 50%" }, { x: 0, skewX: 0, scaleX: 1, duration: 0.8, ease: "expo.out" }, 0.2)
            .fromTo(q(".op-orb"), { x: vw(0.6), rotation: 300, scale: 0.4 }, { x: 0, rotation: 0, scale: 1, duration: 1, ease: "power3.out" }, 0)
            // การ์ดผลงานถูกแจกเข้ามาทีละใบจากด้านขวา
            .fromTo(
              op.querySelectorAll(".op-work"),
              { x: vw(0.45), y: () => innerHeight * 0.15, rotation: 24, opacity: 0 },
              { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.6, stagger: 0.09, ease: "power3.out" },
              0.15,
            );
        }

        // ---- method: รูปวงกลมกลิ้งเข้าช่องในหัวข้อ ----
        const mt = document.getElementById("method");
        if (mt) {
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: mt.querySelector(".mt-title"), start: "top 92%", end: "top 32%", scrub: true, invalidateOnRefresh: true },
          });
          mt.querySelectorAll<HTMLElement>(".mt-gap").forEach((gap, i) => {
            const chip = gap.querySelector(".mt-chip");
            const after = gap.parentElement!.querySelector(".mt-after");
            const at = i * 0.16;
            if (after) tl.fromTo(after, { x: () => -gap.offsetWidth }, { x: 0, duration: 0.45, ease: "power2.out" }, at);
            tl.fromTo(
              chip,
              { x: () => -gap.offsetWidth * 1.5, y: () => -innerHeight * 0.28, rotation: -300, scale: 0.45 },
              { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.7, ease: "power2.inOut" },
              at + 0.04,
            );
          });
        }

        // ---- services: ไทล์กองเอียงกลางจอแล้วแจกออกไปที่ของตัวเอง ----
        const grid = document.querySelector<HTMLElement>("#services .ds-grid");
        if (grid) {
          const tiles = [...grid.querySelectorAll<HTMLElement>(".ds-tile")];
          const tilt = [-8, 5, -3, 9, -6, 3, -10, 6, -4];
          const toCentre = (t: HTMLElement, axis: "x" | "y") =>
            axis === "x"
              ? grid.clientWidth / 2 - (t.offsetLeft + t.offsetWidth / 2)
              : Math.min(grid.clientHeight, innerHeight * 0.9) / 2 - (t.offsetTop + t.offsetHeight / 2);
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: grid,
              start: "top 88%",
              end: () => (grid.offsetHeight > innerHeight ? "top 2%" : grid.offsetHeight > innerHeight * 0.8 ? "top 38%" : "center 52%"),
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
          gsap.set(tiles, { zIndex: (i: number) => tiles.length - i });
          tiles.forEach((t, i) =>
            tl.fromTo(
              t,
              { x: () => toCentre(t, "x"), y: () => toCentre(t, "y"), rotation: tilt[i % tilt.length], scale: () => Math.min(1, 210 / t.offsetWidth, 240 / t.offsetHeight) },
              { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.5, ease: "power2.inOut" },
              i * 0.07,
            ),
          );
        }

        // ---- works: การ์ด repo เลื่อนแนวนอนตามการ scroll ----
        const wk = document.getElementById("works");
        let cleanupWorks = () => {};
        if (wk) {
          const stage = wk.querySelector<HTMLElement>(".wk-stage")!;
          const view = wk.querySelector<HTMLElement>(".wk-view")!;
          const track = wk.querySelector<HTMLElement>(".wk-track")!;
          wk.setAttribute("data-scrubbed", "");
          const distance = () => {
            const pad = parseFloat(getComputedStyle(view).paddingLeft) || 0;
            return Math.max(0, track.offsetWidth - (view.clientWidth - pad * 2));
          };
          const measure = () => wk.style.setProperty("--wk-height", `${stage.offsetHeight + distance()}px`);
          measure();
          ScrollTrigger.addEventListener("refreshInit", measure);
          const skewTo = gsap.quickTo(track, "skewX", { duration: 0.45, ease: "power3.out" });
          const settle = gsap.delayedCall(0.14, () => skewTo(0)).pause();
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: wk,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  skewTo(gsap.utils.clamp(-9, 9, self.getVelocity() / -260));
                  settle.restart(true);
                },
              },
            })
            .to(track, { x: () => -distance(), duration: 1 }, 0)
            .fromTo(wk.querySelector(".wk-progress span"), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
          cleanupWorks = () => {
            ScrollTrigger.removeEventListener("refreshInit", measure);
            wk.style.removeProperty("--wk-height");
            wk.removeAttribute("data-scrubbed");
          };
        }

        // ---- faq: ลูกบอลกลิ้งตามราง ----
        const fq = document.getElementById("faq");
        let cleanupFaq = () => {};
        if (fq) {
          const rail = fq.querySelector<HTMLElement>(".fq-rail")!;
          const ball = fq.querySelector<HTMLElement>(".fq-ball")!;
          const travel = () => Math.max(0, rail.clientHeight - ball.offsetHeight);
          gsap
            .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: fq.querySelector(".fq-list"), start: "top 72%", end: "bottom 72%", scrub: 0.5, invalidateOnRefresh: true } })
            .fromTo(ball, { y: 0, rotation: 0 }, { y: travel, rotation: () => (travel() / (Math.PI * ball.offsetWidth)) * 360, duration: 1 });
          const items = fq.querySelectorAll("details");
          const onToggle = () => ScrollTrigger.refresh();
          items.forEach((d) => d.addEventListener("toggle", onToggle));
          cleanupFaq = () => items.forEach((d) => d.removeEventListener("toggle", onToggle));
        }

        // ---- contact: หัวข้อวิ่งมาพร้อมเส้นใต้ ----
        const ct = document.getElementById("contact");
        if (ct) {
          const run = ct.querySelector<HTMLElement>(".ct-run")!;
          const title = ct.querySelector<HTMLElement>(".ct-title")!;
          gsap
            .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: run, start: "top 92%", end: "top 38%", scrub: true, invalidateOnRefresh: true } })
            .fromTo(ct.querySelector(".ct-line"), { scaleX: () => title.offsetWidth / run.clientWidth }, { scaleX: 1, duration: 1, ease: "power2.inOut" }, 0)
            .fromTo(title, { x: () => -(run.clientWidth - title.offsetWidth), skewX: -16 }, { x: 0, skewX: 0, duration: 1, ease: "power2.inOut" }, 0);
        }

        ScrollTrigger.sort();
        ScrollTrigger.refresh();

        return () => {
          cleanupWorks();
          cleanupFaq();
          gsap.ticker.remove(tick);
          gsap.ticker.lagSmoothing(500, 33);
          lenis.destroy();
          (window as unknown as { lenis: Lenis | null }).lenis = null;
        };
      });
    };

    // รอฟอนต์โหลดก่อน เพื่อให้วัดขนาดตัวหนังสือได้ถูก
    (document.fonts?.ready ?? Promise.resolve()).then(start);
    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);
  return null;
}
