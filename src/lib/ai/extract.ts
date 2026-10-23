import { requirementSchema, type Requirement, requirementFields } from "@/lib/requirement";
import type { Message } from "@/db/schema";
import type { AppSettings } from "@/lib/settings";
import { generateStructured } from "./provider";

const ROLE: Record<string, string> = { user: "ลูกค้า", assistant: "AI", admin: "Strata" };

export function transcript(msgs: Pick<Message, "role" | "content">[]) {
  return msgs
    .filter((m) => m.role !== "system")
    .map((m) => `${ROLE[m.role]}: ${m.content.replace(/\n+/g, " ")}`)
    .join("\n");
}

export async function extractRequirement(
  settings: AppSettings,
  previous: Requirement,
  msgs: Pick<Message, "role" | "content">[],
  attachmentNames: string[],
) {
  return generateStructured<Requirement>(
    settings,
    requirementSchema,
    `สกัดข้อมูล Requirement จากบทสนทนาเป็น JSON ตาม schema
- ใช้เฉพาะข้อมูลที่ลูกค้าพูดจริง ห้ามเดา ถ้าไม่มีให้เป็น null หรือ []
- เขียนเป็นภาษาไทยกระชับ
- budget คืองบที่ลูกค้าบอกเท่านั้น ห้ามประเมินราคาเอง
- openQuestions = สิ่งที่ยังไม่ชัดและทีมควรถามเพิ่ม`,
    `Requirement เดิม:\n${JSON.stringify(previous)}\n\nไฟล์แนบ: ${attachmentNames.join(", ") || "-"}\n\nบทสนทนา:\n${transcript(msgs)}`,
  );
}

// บอก AI ว่ามีอะไรแล้ว/ยังขาดอะไร เพื่อถามต่อให้ตรงจุด
export function stateNote(r: Requirement) {
  const f = requirementFields(r);
  const have = f.filter((x) => x.value).map((x) => `- ${x.label}: ${x.value}`);
  const missing = f.filter((x) => !x.value).map((x) => x.label);
  return `\n\n## สถานะ Requirement ปัจจุบัน\n${have.join("\n") || "- (ยังไม่มี)"}\n\nยังขาด: ${
    missing.join(", ") || "ครบแล้ว — ให้ลูกค้ากด \"ดูสรุปและยืนยัน\""
  }`;
}
