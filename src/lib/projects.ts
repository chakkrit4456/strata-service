import cosmostock from "@/assets/product/cosmostock.PNG";
import eportfolio from "@/assets/product/e-portfolio.PNG";
import network from "@/assets/product/network.PNG";
import portfolio from "@/assets/product/portfolio.PNG";

const GH = "https://github.com/chakkrit4456";

// ผลงานที่มีภาพตัวอย่าง (src/assets/product)
export const SHOWCASE = [
  {
    title: "CosmoStock",
    desc: "ระบบคลังสินค้าร้านเครื่องสำอาง หลายสาขา แจ้งเตือนสต็อกต่ำ/ใกล้หมดอายุ",
    tags: ["ระบบงาน", "Dashboard", "สต็อก"],
    image: cosmostock,
    repo: `${GH}/Cosmo-stock`,
  },
  {
    title: "E-Portfolio System",
    desc: "ระบบแฟ้มสะสมผลงานออนไลน์สำหรับนักเรียนและครู",
    tags: ["เว็บไซต์", "สถานศึกษา"],
    image: eportfolio,
    repo: `${GH}/e-portfolio-system-design`,
  },
  {
    title: "Network Learning",
    desc: "เว็บบทเรียนรายวิชาเครือข่ายคอมพิวเตอร์เบื้องต้น",
    tags: ["เว็บการเรียนรู้", "Network"],
    image: network,
    repo: `${GH}/network`,
  },
  {
    title: "Portfolio",
    desc: "เว็บพอร์ตโฟลิโอส่วนตัว ดีไซน์โมเดิร์น พร้อมอนิเมชัน",
    tags: ["เว็บไซต์", "Personal brand"],
    image: portfolio,
    repo: `${GH}/portfolio-chakkrit`,
  },
];

// คำอธิบายภาษาไทยของ repo (GitHub ยังไม่ได้ใส่ description)
export const REPO_NOTES: Record<string, { th: string; kind: string }> = {
  "strata-service": { th: "เว็บรับงานผ่าน AI สรุป Requirement อัตโนมัติ (เว็บนี้)", kind: "AI & Web" },
  "strata-ai": { th: "ผู้ช่วย AI ของ Strata", kind: "AI" },
  automation: { th: "สคริปต์และ workflow อัตโนมัติ ลดงานซ้ำ", kind: "Automation" },
  "Cosmo-stock": { th: "ระบบคลังสินค้าหลายสาขา พร้อม Dashboard", kind: "ระบบงาน" },
  "portfolio-roman": { th: "เว็บพอร์ตโฟลิโอสำหรับลูกค้า", kind: "เว็บไซต์" },
  "skin-care-shop": { th: "แอปมือถือร้านสกินแคร์ (Flutter)", kind: "Mobile App" },
  "E-commerce_nodejs": { th: "เว็บอีคอมเมิร์ซ ระบบตะกร้าและคำสั่งซื้อ", kind: "E-commerce" },
  "ai-hub": { th: "ศูนย์รวมเครื่องมือ AI", kind: "AI" },
  "e-portfolio-system-design": { th: "ระบบแฟ้มสะสมผลงานออนไลน์", kind: "เว็บไซต์" },
  "MongDee-Project": { th: "โปรเจกต์ MongDee (Python) พร้อมเดโมออนไลน์", kind: "Web App" },
  "3d-game": { th: "เกม 3D บนเว็บ Mission Zero Bribe", kind: "Game" },
  "portfolio-chakkrit": { th: "เว็บพอร์ตโฟลิโอส่วนตัว", kind: "เว็บไซต์" },
  network: { th: "เว็บบทเรียนเครือข่ายคอมพิวเตอร์", kind: "เว็บการเรียนรู้" },
};

export const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  PHP: "#4F5D95",
};

export type Repo = {
  name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  fork: boolean;
};

// ดึง repo สาธารณะ — cache 1 ชม. (GitHub จำกัด 60 ครั้ง/ชม. ต่อ IP)
export async function getRepos(): Promise<Repo[]> {
  try {
    const res = await fetch("https://api.github.com/users/chakkrit4456/repos?per_page=100&sort=updated", {
      headers: { accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Repo[];
    return data.filter((r) => !r.fork);
  } catch {
    return [];
  }
}
