import Image from "next/image";
import "./landing.css";
import { CategoryStart, StartChat } from "@/components/StartChat";
import { CATEGORIES } from "@/lib/requirement";
import { LANG_COLOR, REPO_NOTES, SHOWCASE, getRepos } from "@/lib/projects";
import { CategoryIcon } from "@/components/fx/icons";
import { PackagesTabs } from "@/components/fx/PackagesTabs";
import { Nav } from "@/components/landing/Nav";
import { LandingMotion } from "@/components/landing/LandingMotion";

export const revalidate = 3600;

const STEPS = [
  { t: "คุยกับ AI", d: "เล่าสิ่งที่อยากได้ ไม่ต้องสมัคร ไม่ต้องรู้ศัพท์เทคนิค AI ถามทีละเรื่องจนครบ" },
  { t: "ได้ Requirement", d: "ระบบสรุปขอบเขตงาน ฟีเจอร์ งบ และกำหนดส่ง ให้ตรวจแก้ก่อนยืนยัน" },
  { t: "รับใบเสนอราคา", d: "ทีม Strata ตรวจ Requirement แล้วติดต่อกลับพร้อมราคาภายใน 24 ชม." },
  { t: "เริ่มพัฒนา", d: "อนุมัติแล้วลงมือทำ อัปเดตความคืบหน้า และดูแลหลังส่งมอบ" },
];

const FAQ = [
  ["คุยกับ AI เสียเงินไหม?", "ไม่เสียค่าใช้จ่าย และไม่ต้องสมัครสมาชิก เปิดหน้าเว็บแล้วพิมพ์เล่าโปรเจกต์ได้ทันที"],
  ["ทำไม AI ไม่บอกราคาเลย?", "ราคาขึ้นกับขอบเขตงานจริง AI จึงช่วยเก็บรายละเอียดให้ครบก่อน แล้วทีม Strata จะประเมินและส่งใบเสนอราคาให้ภายใน 24 ชั่วโมงหลังยืนยัน Requirement"],
  ["ต้องเตรียมอะไรมาบ้าง?", "ไม่ต้องเตรียมเอกสาร ถ้ามีไฟล์ ภาพ หรือลิงก์ตัวอย่าง แนบในแชทได้เลย (ไฟล์ละไม่เกิน 10 MB)"],
  ["ปิดหน้าเว็บไปแล้ว กลับมาคุยต่อได้ไหม?", "ได้ แชทแต่ละโปรเจกต์มีลิงก์ส่วนตัว กด “คัดลอกลิงก์” เก็บไว้ หรือกลับมาที่หน้านี้แล้วเลือก “กลับไปแชทเดิม”"],
  ["ข้อมูลที่คุยไว้เก็บนานแค่ไหน?", "บทสนทนาแสดงในระบบหลังบ้าน 6 เดือนนับจากคุยครั้งล่าสุด จากนั้นย้ายเข้าคลังเพื่อการตรวจสอบย้อนหลัง ข้อมูลใช้เพื่อประเมินงานและติดต่อกลับคุณ"],
  ["รับงานนอกร้อยเอ็ดไหม?", "รับงานออนไลน์ทั่วประเทศ ส่วนงาน IT ที่ต้องไปหน้างาน ให้บริการในร้อยเอ็ดและพื้นที่ใกล้เคียง"],
  ["ชำระเงินอย่างไร?", "เงื่อนไขการชำระเงินและงวดงานระบุไว้ในใบเสนอราคาของแต่ละโปรเจกต์"],
];

const TILE_ORDER = ["code", "it", "software", "video", "ai", "excel", "powerpoint", "other", "document"] as const;

export default async function Home() {
  const repos = await getRepos();
  const cat = (k: string) => CATEGORIES.find((c) => c.key === k)!;

  return (
    <div className="lp">
      <Nav />
      <LandingMotion />
      <main>
        {/* opening */}
        <section id="opening" aria-labelledby="opening-title">
          <div className="op-s1">
            <div className="op-ground" aria-hidden />
            <div className="op-frame">
              <div className="op-slide slide-navy corners rounded-[2px]">
                <div className="op-photo">
                  <Image src={SHOWCASE[0].image} alt="ตัวอย่างผลงาน ระบบคลังสินค้า CosmoStock" priority sizes="60vw" />
                </div>
                <div className="op-ring" aria-hidden>
                  <span className="op-ring__orb orb" />
                </div>
                <h1 className="op-title t-2" id="opening-title">
                  <span className="op-line op-line--1" style={{ "--len": 7 } as React.CSSProperties}>
                    <span className="op-line__in">คุยกันก่อน</span>
                  </span>
                  <span className="op-line op-line--2" style={{ "--len": 6 } as React.CSSProperties}>
                    <span className="op-line__in">แล้วค่อย</span>
                  </span>
                  <span className="op-line op-line--3" style={{ "--len": 6 } as React.CSSProperties}>
                    <span className="op-line__in">เริ่มงาน</span>
                  </span>
                </h1>
                <div className="op-meta">
                  <p className="t-5">
                    รับงาน Software ครบวงจร — เว็บไซต์ ระบบตามสั่ง AI Automation แก้โค้ด และงาน IT เล่าโปรเจกต์ให้ AI ฟัง แล้วรับใบเสนอราคาภายใน 24 ชม.
                  </p>
                  <StartChat tone="dark" />
                  <a className="link-line self-start text-[15px] text-white" href="#packages">
                    ดูแพ็กเกจและราคาเริ่มต้น
                  </a>
                </div>
                <div className="op-dim" aria-hidden />
              </div>
            </div>
          </div>
          <div className="op-s2">
            <div className="op-card slide-pale corners">
              <h2 className="op-title2 t-2" style={{ "--len": 18 } as React.CSSProperties}>
                Software · AI · IT
              </h2>
              <span className="op-orb orb" aria-hidden />
              <div className="op-works" aria-label="ตัวอย่างผลงาน">
                {SHOWCASE.map((s, i) => (
                  <div key={s.title} className={`op-slot op-slot--${i + 1}`}>
                    <a href="#showcase" className="op-work">
                      <span className="op-work__bar" aria-hidden>
                        <i />
                        <i />
                        <i />
                      </span>
                      <Image src={s.image} alt={`ผลงาน ${s.title}`} sizes="(max-width: 767px) 60vw, 30vw" />
                      <span className="op-work__name">{s.title}</span>
                    </a>
                  </div>
                ))}
              </div>
              <div className="op-cols">
                <p className="t-body muted">ทุกโปรเจกต์เริ่มจากการคุย AI ช่วยเก็บรายละเอียดจนครบเป็น Requirement ทีมจึงเสนอราคาได้ตรงงาน ไม่ต้องเดา</p>
                <p className="t-body muted">เว็บ ระบบ แชทบอท งานเอกสาร สไลด์ Excel ไปจนถึงวิดีโอ — ทีมเดียวดูแลครบ ด้วยประสบการณ์ IT ในสถานศึกษา</p>
                <a className="link-line" href="#method">
                  ดูขั้นตอนการทำงาน
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* method */}
        <section id="method" className="sec" aria-labelledby="method-title">
          <div className="mt-slide slide corners">
            <div className="mt-side">
              <span className="mt-orb orb" aria-hidden />
              <ol className="mt-steps" data-motion="rise">
                {STEPS.map((s, i) => (
                  <li key={s.t}>
                    <span className="mt-num t-4">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="t-6">{s.t}</h3>
                    <p>{s.d}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-main">
              <h2 className="mt-title t-3" id="method-title">
                <span className="mt-row">
                  คุยวันนี้{" "}
                  <span className="mt-gap">
                    <span className="mt-chip chip-dot bg-ink-2" />
                  </span>{" "}
                  <span className="mt-after">ได้สรุป</span>
                </span>
                <span className="mt-row">
                  ใบเสนอราคา{" "}
                  <span className="mt-gap">
                    <span className="mt-chip chip-dot bg-gold" />
                  </span>{" "}
                  <span className="mt-after">ใน</span>
                </span>
                <span className="mt-row">
                  24 ชม.{" "}
                  <span className="mt-gap">
                    <span className="mt-chip chip-dot bg-brand" />
                  </span>
                </span>
              </h2>
              <div className="mt-foot">
                <p className="t-5 muted">ไม่ต้องนัดประชุม ไม่ต้องอธิบายซ้ำหลายรอบ ทุกอย่างที่คุยถูกสรุปเป็นเอกสารเดียว ทีมอ่านแล้วเริ่มประเมินได้ทันที</p>
                <a className="btn-pill" href="#services">
                  <span>ดูบริการทั้งหมด</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* services */}
        <section id="services" className="sec" aria-labelledby="services-title">
          <div className="ds-slide slide corners">
            <h2 className="ds-title t-3" id="services-title" style={{ "--len": 13 } as React.CSSProperties} data-motion="streak">
              <span>คุย.</span> <span>สรุป.</span> <span>ส่งมอบ.</span>
            </h2>
            <div className="ds-grid">
              {TILE_ORDER.map((k) => {
                const c = cat(k);
                if (k === "software")
                  return (
                    <CategoryStart key={k} category={k} className={`ds-tile ds-tile--img area-${k}`}>
                      <Image src={SHOWCASE[0].image} alt="ตัวอย่างระบบที่พัฒนา" sizes="(max-width: 860px) 100vw, 33vw" />
                      <span className="ds-cap">
                        <span className="ds-badge">{c.name}</span>
                        <span className="ds-desc mt-2 block">{c.desc}</span>
                      </span>
                    </CategoryStart>
                  );
                if (k === "other")
                  return (
                    <CategoryStart key={k} category={k} className={`ds-tile ds-tile--link area-${k}`}>
                      <svg aria-hidden viewBox="0 0 52 52" className="size-12" fill="none" stroke="currentColor" strokeWidth="1">
                        <circle cx="26" cy="26" r="25" />
                        <path d="M18 26h16M28 20l6 6-6 6" />
                      </svg>
                      <span className="t-4">ไม่แน่ใจหมวดไหน? ให้ AI ช่วยจัด</span>
                    </CategoryStart>
                  );
                return (
                  <CategoryStart key={k} category={k} className={`ds-tile area-${k}`}>
                    <CategoryIcon name={k} className="size-6" />
                    <span>
                      <span className="ds-name block">{c.name}</span>
                      <span className="ds-desc mt-1 block">{c.desc}</span>
                    </span>
                  </CategoryStart>
                );
              })}
              <div className="ds-copy">
                <p>เว็บ ระบบ แชทบอท แก้โค้ด เครือข่าย เอกสาร สไลด์ Excel วิดีโอ — งานเปลี่ยน แต่วิธีเริ่มเหมือนเดิม: คุยให้ชัดก่อน</p>
                <p>กดหมวดที่ตรงที่สุด AI จะเริ่มถามในเรื่องนั้นทันที</p>
              </div>
              <p className="ds-note t-6">งานไอทีทุกแบบ เริ่มจากบทสนทนาเดียว</p>
            </div>
          </div>
        </section>

        {/* showcase */}
        <section id="showcase" className="sec" aria-labelledby="showcase-title">
          <div className="co-slide slide corners mx-auto">
            <svg className="co-ring" data-motion="orbit" viewBox="0 0 400 400" aria-hidden>
              <circle cx="200" cy="200" r="199" pathLength="1" />
              <circle cx="200" cy="200" r="140" pathLength="1" />
            </svg>
            <div className="co-head">
              <h2 className="t-3" id="showcase-title" data-motion="streak">
                ผลงานจริง ที่ใช้งานอยู่
              </h2>
              <p className="t-5 muted">ระบบคลังสินค้า เว็บการเรียนรู้ ระบบแฟ้มสะสมผลงาน และพอร์ตโฟลิโอ — ออกแบบและเขียนโค้ดเองทั้งหมด</p>
            </div>
            <ul className="co-list">
              {SHOWCASE.map((s) => (
                <li key={s.title} className="co-item">
                  <a href={s.repo} target="_blank" rel="noreferrer">
                    <figure>
                      <div className="co-photo">
                        <Image data-motion="focus" src={s.image} alt={`ตัวอย่างผลงาน ${s.title}`} sizes="(max-width: 860px) 50vw, 25vw" />
                      </div>
                      <figcaption>
                        <strong className="t-6">{s.title}</strong>
                        <span className="t-4 muted">{s.desc}</span>
                      </figcaption>
                    </figure>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* works — GitHub */}
        <section id="works" className="sec" aria-labelledby="works-title">
          <div className="wk-stage">
            <div className="wk-head">
              <h2 className="t-3" id="works-title" data-motion="streak">
                ผลงานบน GitHub
              </h2>
              <p className="t-5 muted">
                ดึงล่าสุดจาก github.com/chakkrit4456 — {repos.length} โปรเจกต์ ทั้งเว็บ ระบบ AI แอปมือถือ และเกม
              </p>
            </div>
            <div className="wk-view">
              <ul className="wk-track">
                {repos.map((r, i) => {
                  const note = REPO_NOTES[r.name];
                  return (
                    <li key={r.name} className={`wk-card slide ${i % 3 === 1 ? "wk-card--alt" : ""}`}>
                      <span className="t-4 muted">{note?.kind ?? "Project"}</span>
                      <a href={r.html_url} target="_blank" rel="noreferrer" className="t-6 break-all hover:underline">
                        {r.name}
                      </a>
                      <p className="text-[15px] leading-relaxed text-muted">{r.description || note?.th || "โปรเจกต์บน GitHub"}</p>
                      <div className="mt-auto flex items-center gap-4 border-t border-sand pt-3 text-[13px]">
                        {r.language && (
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-full" style={{ background: LANG_COLOR[r.language] ?? "#9db1c4" }} />
                            {r.language}
                          </span>
                        )}
                        <span className="text-muted">
                          {new Date(r.updated_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                        </span>
                        {r.homepage && (
                          <a href={r.homepage} target="_blank" rel="noreferrer" className="link-line ml-auto">
                            Live demo
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
                <li className="wk-card wk-card--navy slide justify-between">
                  <span className="t-4 text-stone-2">GitHub</span>
                  <p className="t-6">ดูโค้ดและโปรเจกต์ทั้งหมด</p>
                  <a className="btn-pill-light self-start" href="https://github.com/chakkrit4456?tab=repositories" target="_blank" rel="noreferrer">
                    <span>เปิด GitHub ↗</span>
                  </a>
                </li>
              </ul>
            </div>
            <div className="wk-progress" aria-hidden>
              <span />
            </div>
          </div>
        </section>

        {/* packages */}
        <section id="packages" className="sec" aria-labelledby="packages-title">
          <div className="mb-slide slide corners">
            <svg className="mb-ring" data-motion="orbit" viewBox="0 0 400 400" aria-hidden>
              <circle cx="200" cy="200" r="199" pathLength="1" />
              <circle cx="200" cy="200" r="150" pathLength="1" />
            </svg>
            <div className="mb-head">
              <h2 className="t-3" id="packages-title" data-motion="streak">
                แพ็กเกจบริการ
              </h2>
              <p className="t-5 muted">8 หมวดบริการ ราคาเริ่มต้นชัดเจน ราคาจริงประเมินจาก Requirement — คุยกับ AI ก่อนได้ฟรี ไม่มีข้อผูกมัด</p>
            </div>
            <PackagesTabs />
          </div>
        </section>

        {/* faq */}
        <section id="faq" className="sec" aria-labelledby="faq-title">
          <div className="fq-slide slide corners mx-auto">
            <div className="fq-head">
              <h2 className="t-3" id="faq-title" data-motion="streak">
                คำถามที่พบบ่อย
              </h2>
              <p className="t-body muted">ไม่เจอคำตอบที่ต้องการ? ถาม AI ในแชทได้เลย หรือโทรหาเราโดยตรง</p>
            </div>
            <div className="fq-body">
              <div className="fq-rail" aria-hidden>
                <span className="fq-ball orb" />
              </div>
              <div className="fq-list">
                {FAQ.map(([q, a]) => (
                  <details key={q} className="fq-item">
                    <summary className="t-6">{q}</summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* contact */}
        <section id="contact" className="sec" aria-labelledby="contact-title">
          <div className="ct-slide slide corners">
            <div className="ct-run">
              <h2 className="ct-title t-3" id="contact-title">
                เล่าโปรเจกต์ของคุณ
              </h2>
              <span className="ct-line" aria-hidden />
            </div>
            <div className="ct-grid">
              <dl className="ct-info" data-motion="rise">
                <div>
                  <dt className="t-4">โทร</dt>
                  <dd className="t-6">
                    <a href="tel:0910474405">091 047 4405</a>
                  </dd>
                </div>
                <div>
                  <dt className="t-4">อีเมล</dt>
                  <dd className="text-[17px] font-medium break-all">
                    <a href="mailto:chakkritnb4456@gmail.com">chakkritnb4456@gmail.com</a>
                  </dd>
                </div>
                <div>
                  <dt className="t-4">ช่องทางเดิม</dt>
                  <dd className="flex flex-col gap-1">
                    <a className="link-line self-start" href="https://fastwork.com/th/user/x66pf6" target="_blank" rel="noreferrer">
                      Fastwork
                    </a>
                    <a className="link-line self-start" href="https://www.facebook.com/profile.php?id=61595991591177" target="_blank" rel="noreferrer">
                      Facebook Page
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="t-4">ที่ตั้ง</dt>
                  <dd>ร้อยเอ็ด · รับงานออนไลน์ทั่วประเทศ</dd>
                </div>
              </dl>
              <div className="flex flex-col gap-3" data-motion="rise">
                <p className="t-5 muted">พิมพ์เล่าสั้นๆ AI จะถามต่อจนได้ Requirement แล้วทีมติดต่อกลับพร้อมใบเสนอราคา</p>
                <StartChat />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="ft-slide slide-navy corners">
          <p className="ft-word" style={{ "--len": 6 } as React.CSSProperties} data-motion="streak" data-from="left">
            strata
          </p>
          <div className="ft-cols">
            <p>strata software studio — รับงาน Software ครบวงจร: เว็บไซต์ ระบบตามสั่ง Bot & Automation เชื่อมต่อ API แก้ไขโค้ด และงานไอทีอื่นๆ</p>
            <ul>
              {["#method", "#services", "#showcase", "#packages", "#faq"].map((h, i) => (
                <li key={h}>
                  <a href={h} className="hover:text-white">
                    {["ขั้นตอน", "บริการ", "ผลงาน", "แพ็กเกจ", "คำถามที่พบบ่อย"][i]}
                  </a>
                </li>
              ))}
            </ul>
            <ul>
              <li><a href="tel:0910474405" className="hover:text-white">091 047 4405</a></li>
              <li><a href="https://fastwork.com/th/user/x66pf6" className="hover:text-white">Fastwork</a></li>
              <li><a href="https://www.facebook.com/profile.php?id=61595991591177" className="hover:text-white">Facebook</a></li>
              <li><a href="https://github.com/chakkrit4456" className="hover:text-white">GitHub</a></li>
            </ul>
            <ul className="self-end">
              <li>© {new Date().getFullYear()} strata software studio</li>
              <li>
                Design: <a href="https://8b.com" className="hover:text-white">8B</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
