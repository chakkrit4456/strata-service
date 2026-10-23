import { Logo } from "@/components/Logo";
import { CategoryStart, StartChat } from "@/components/StartChat";
import { CATEGORIES } from "@/lib/requirement";

const STEPS = ["คุยกับ AI เล่าความต้องการ", "ได้ Requirement สรุปทันที", "รับใบเสนอราคาใน 24 ชม.", "อนุมัติแบบ แล้วเริ่มพัฒนา"];

const WORKS = {
  เว็บร้านค้า: ["ร้านกาแฟ", "ร้านน้ำหอม", "ร้านอะไหล่คอมพิวเตอร์", "ร้านเติมเกม", "ตลาดซื้อขายการ์ด"],
  ระบบงาน: ["ระบบสต็อกสินค้า", "ระบบหอพัก", "ระบบโรงแรม", "ระบบรับเรื่องร้องเรียน", "บริหารโครงการและงบประมาณ"],
};

const PACKAGES = [
  { name: "เว็บร้านค้า / ธุรกิจ", price: "1,500", scope: "3–5 หน้า · แก้ไข 2 ครั้ง", time: "5–7 วัน", care: "ดูแล 15 วัน" },
  { name: "เว็บ + ระบบหลังบ้าน", price: "5,000", scope: "สูงสุด 8 หน้า · แก้ไข 3 ครั้ง", time: "2–3 สัปดาห์", care: "ดูแล 30 วัน" },
  { name: "ระบบบริหารงานเต็มรูปแบบ", price: "10,000", scope: "ระบบตามสั่ง · ตามขอบเขต", time: "1–2 เดือน", care: "ดูแล 60 วัน" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-ink text-cream">
      <header className="flex items-center justify-between border-b border-ink-line px-4 py-5 md:px-14">
        <Logo />
        <nav className="flex items-center gap-6 text-sm text-stone-1 md:gap-9">
          <a href="#services" className="hidden hover:text-cream md:inline">บริการ</a>
          <a href="#works" className="hidden hover:text-cream md:inline">ผลงาน</a>
          <a href="#steps" className="hidden hover:text-cream md:inline">ขั้นตอน</a>
          <a href="#packages" className="hidden hover:text-cream md:inline">แพ็กเกจ</a>
          <a href="#start" className="rounded-md bg-gold px-4 py-2.5 font-semibold text-ink hover:bg-cream">
            เริ่มคุยโปรเจกต์
          </a>
        </nav>
      </header>

      <section className="grid gap-12 px-4 py-12 md:px-14 md:py-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <div id="start" className="flex flex-col gap-7">
          <div className="flex items-center gap-2.5 font-mono text-xs font-medium tracking-[.06em] text-gold">
            <span className="size-2 bg-gold" />
            SOFTWARE · AI AUTOMATION · IT SERVICE
          </div>
          <h1 className="text-5xl leading-[1.12] font-semibold tracking-tight md:text-7xl">
            คุยกันก่อน
            <br />
            <span className="text-stone-2">แล้วค่อยเริ่มงาน</span>
          </h1>
          <p className="max-w-[540px] text-lg leading-relaxed text-pretty text-stone-1">
            เล่าโปรเจกต์ให้ AI ของเราฟัง ระบบจะถามรายละเอียดจนครบและสรุปเป็น Requirement ให้ — ฟรี ไม่ต้องสมัคร
            ทีมงานติดต่อกลับพร้อมใบเสนอราคาภายใน 24 ชม.
          </p>
          <StartChat />
        </div>

        <div id="services" className="flex flex-col gap-3.5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold">บริการทั้งหมด</h2>
            <span className="font-mono text-xs text-stone-3">09 หมวด</span>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-ink-line bg-ink-line sm:grid-cols-2">
            {CATEGORIES.filter((c) => c.key !== "other").map((c, i) => (
              <CategoryStart
                key={c.key}
                category={c.key}
                className="flex min-h-16 flex-col gap-1.5 bg-ink px-5 py-4 text-left transition hover:bg-ink-2"
              >
                <span className="flex items-baseline justify-between">
                  <span className="text-[15px] font-semibold">{c.name}</span>
                  <span className="font-mono text-[11px] text-stone-3">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <span className="text-[13px] leading-normal text-stone-2">{c.desc}</span>
              </CategoryStart>
            ))}
            <CategoryStart
              category="other"
              className="flex flex-col justify-center gap-1 bg-ink-2 px-5 py-4 text-left transition hover:bg-ink-line"
            >
              <span className="text-[15px] font-semibold text-gold">ไม่แน่ใจว่าอยู่หมวดไหน?</span>
              <span className="text-[13px] text-stone-2">พิมพ์เล่าได้เลย AI ช่วยจัดให้</span>
            </CategoryStart>
          </div>
        </div>
      </section>

      <section id="steps" className="grid border-y border-ink-line sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex gap-3.5 border-ink-line px-4 py-5 md:px-14 lg:border-r lg:last:border-r-0">
            <span className="font-mono text-xs font-medium text-gold">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-sm text-stone-1">{s}</span>
          </div>
        ))}
      </section>

      <section id="works" className="grid gap-10 px-4 py-14 md:px-14 lg:grid-cols-[.6fr_1.4fr]">
        <div>
          <h2 className="text-2xl font-semibold">ผลงานที่ผ่านมา</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-2">
            ประสบการณ์ IT ในสถานศึกษา — ดูแลเครือข่าย เซิร์ฟเวอร์ และพัฒนาระบบที่ใช้งานจริง
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {Object.entries(WORKS).map(([group, items]) => (
            <div key={group} className="rounded-xl border border-ink-line p-5">
              <div className="font-mono text-xs text-gold">{group}</div>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-stone-1">
                {items.map((w) => (
                  <li key={w} className="flex gap-2">
                    <span className="mt-2 size-1.5 flex-none bg-stone-3" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="packages" className="border-t border-ink-line px-4 py-14 md:px-14">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-2xl font-semibold">แพ็กเกจเว็บไซต์</h2>
          <span className="text-sm text-stone-2">ราคาจริงประเมินจาก Requirement — คุยกับ AI ก่อนได้ฟรี</span>
        </div>
        <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-ink-line bg-ink-line md:grid-cols-3">
          {PACKAGES.map((p) => (
            <div key={p.name} className="flex flex-col gap-3 bg-ink p-6">
              <span className="font-semibold">{p.name}</span>
              <span className="text-sm text-stone-2">
                เริ่มต้น <span className="font-mono text-2xl text-cream">฿{p.price}</span>
              </span>
              <span className="text-sm text-stone-1">{p.scope}</span>
              <span className="font-mono text-xs text-stone-3">
                {p.time} · {p.care}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-stone-3">
          ทุกแพ็กเกจ: ออกแบบตามแบรนด์ · Responsive · ผูกโดเมน + SSL · คู่มือภาษาไทย
        </p>
      </section>

      <footer className="flex flex-col gap-2 border-t border-ink-line px-4 py-8 text-sm text-stone-2 md:flex-row md:justify-between md:px-14">
        <span>strata software studio · ร้อยเอ็ด</span>
        <span className="font-mono text-xs">
          091 047 4405 · chakkritnb4456@gmail.com ·{" "}
          <a href="https://fastwork.com/th/user/x66pf6" className="hover:text-cream">Fastwork</a> ·{" "}
          <a href="https://www.facebook.com/profile.php?id=61595991591177" className="hover:text-cream">Facebook</a>
        </span>
      </footer>
    </main>
  );
}
