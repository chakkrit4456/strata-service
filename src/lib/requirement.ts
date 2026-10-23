import { z } from "zod";

// ไม่มีช่องราคาโดยเจตนา — เจ้าของเป็นผู้ประเมินและส่งใบเสนอราคาเอง
export const requirementSchema = z.object({
  title: z.string().describe("ชื่อโปรเจกต์สั้นๆ เช่น ระบบสต็อกสินค้า 2 สาขา"),
  category: z
    .enum(["software", "ai", "code", "it", "document", "powerpoint", "excel", "video", "other"])
    .nullable()
    .describe("หมวดบริการ"),
  organization: z.string().nullable().describe("ชื่อร้าน/องค์กร/ลูกค้า"),
  goal: z.string().nullable().describe("เป้าหมายและปัญหาที่ต้องการแก้"),
  users: z.string().nullable().describe("ผู้ใช้งานและสิทธิ์ ถ้ามี"),
  mustHave: z.array(z.string()).describe("ฟีเจอร์/ขอบเขตที่ต้องมี"),
  niceToHave: z.array(z.string()).describe("ถ้ามีจะดี"),
  references: z.array(z.string()).describe("ไฟล์ ลิงก์ หรือตัวอย่างอ้างอิง"),
  budget: z.string().nullable().describe("งบประมาณตามที่ลูกค้าบอก (ไม่ใช่ราคาที่ประเมิน)"),
  deadline: z.string().nullable().describe("กำหนดส่ง/วันที่ต้องใช้งาน"),
  contact: z.object({
    name: z.string().nullable(),
    phone: z.string().nullable(),
    line: z.string().nullable(),
    email: z.string().nullable(),
  }),
  openQuestions: z.array(z.string()).describe("คำถามที่ยังค้าง ให้เจ้าของถามต่อ"),
});

export type Requirement = z.infer<typeof requirementSchema>;

export const emptyRequirement: Requirement = {
  title: "",
  category: null,
  organization: null,
  goal: null,
  users: null,
  mustHave: [],
  niceToHave: [],
  references: [],
  budget: null,
  deadline: null,
  contact: { name: null, phone: null, line: null, email: null },
  openQuestions: [],
};

export const CATEGORIES: { key: NonNullable<Requirement["category"]>; name: string; desc: string }[] = [
  { key: "software", name: "Software & Web", desc: "เว็บไซต์ ระบบหลังบ้าน ระบบบริหารงาน ฐานข้อมูล" },
  { key: "ai", name: "AI & Automation", desc: "Chatbot, workflow อัตโนมัติ, เชื่อม LINE/Sheets/API" },
  { key: "code", name: "แก้ไขโค้ด", desc: "Debug ปรับปรุง/ย้ายระบบ เพิ่มฟีเจอร์ในโค้ดเดิม" },
  { key: "it", name: "IT Service", desc: "เครือข่าย เซิร์ฟเวอร์ ติดตั้ง/ดูแลระบบ Cloud" },
  { key: "document", name: "เอกสาร", desc: "Word จัดรูปเล่ม รายงาน แบบฟอร์ม" },
  { key: "powerpoint", name: "PowerPoint", desc: "สไลด์นำเสนอ Pitch deck Template" },
  { key: "excel", name: "Excel", desc: "สูตร Dashboard Macro/VBA จัดการข้อมูล" },
  { key: "video", name: "วิดีโอ", desc: "CapCut After Effects Motion graphic ตัดต่อ" },
  { key: "other", name: "อื่นๆ", desc: "งานไอทีที่ไม่อยู่ในหมวด — ให้ AI ช่วยระบุ" },
];

export function categoryName(key: string | null | undefined) {
  return CATEGORIES.find((c) => c.key === key)?.name ?? "—";
}

export const hasContact = (r: Requirement) =>
  Boolean(r.contact.name && r.contact.phone && (r.contact.line || r.contact.email));

// 7 หัวข้อเดียวกับแผง Requirement ร่าง
export function requirementFields(r: Requirement) {
  return [
    { label: "หมวดบริการ", value: r.category ? categoryName(r.category) : null },
    { label: "เป้าหมาย", value: r.goal },
    { label: "ขอบเขต / ฟีเจอร์", value: r.mustHave.length ? r.mustHave.join(" · ") : null },
    { label: "ไฟล์ / ตัวอย่าง", value: r.references.length ? r.references.join(" · ") : null },
    { label: "งบประมาณ", value: r.budget },
    { label: "กำหนดส่ง", value: r.deadline },
    {
      label: "ข้อมูลติดต่อ",
      value: hasContact(r)
        ? [r.contact.name, r.contact.phone, r.contact.line && `LINE ${r.contact.line}`, r.contact.email]
            .filter(Boolean)
            .join(" · ")
        : null,
    },
  ];
}

export function completeness(r: Requirement) {
  const f = requirementFields(r);
  return Math.round((f.filter((x) => x.value).length / f.length) * 100);
}

export function requirementToMarkdown(r: Requirement, code: string, source: string) {
  const list = (a: string[]) => (a.length ? a.map((x) => `- ${x}`).join("\n") : "-");
  return `# ${r.title || "Requirement"} (${code})

**ช่องทางที่มา:** ${source}

## 1. ข้อมูลติดต่อ
- ชื่อ: ${r.contact.name ?? "-"}
- เบอร์โทร: ${r.contact.phone ?? "-"}
- LINE: ${r.contact.line ?? "-"}
- อีเมล: ${r.contact.email ?? "-"}
- ร้าน/องค์กร: ${r.organization ?? "-"}

## 2. หมวดบริการ
${categoryName(r.category)}

## 3. เป้าหมาย
${r.goal ?? "-"}

## 4. ผู้ใช้งาน
${r.users ?? "-"}

## 5. ขอบเขตงาน
### ต้องมี
${list(r.mustHave)}
### ถ้ามีจะดี
${list(r.niceToHave)}

## 6. ไฟล์และตัวอย่างอ้างอิง
${list(r.references)}

## 7. งบประมาณและกำหนดส่ง
- งบ: ${r.budget ?? "-"}
- กำหนดส่ง: ${r.deadline ?? "-"}

## 8. สถานะใบเสนอราคา
รอ Strata ประเมินและติดต่อกลับ

## 9. คำถามที่ยังค้าง
${list(r.openQuestions)}
`;
}
