import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/ai/prompt";

export type AppSettings = {
  geminiModel: string;
  groqModel: string;
  extractModel: string;
  systemPrompt: string;
  retentionMonths: number;
};

export const DEFAULT_SETTINGS: AppSettings = {
  geminiModel: "gemini-2.5-flash",
  groqModel: "llama-3.3-70b-versatile",
  // ใช้สกัด Requirement ทุกข้อความ — รุ่น lite มีโควตาฟรีต่อวันสูงกว่า
  extractModel: "gemini-2.5-flash-lite",
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  retentionMonths: 6,
};

export async function getSettings(): Promise<AppSettings> {
  const rows = await db.select().from(schema.settings);
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULT_SETTINGS, ...stored } as AppSettings;
}

export async function saveSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
  const [row] = await db.select().from(schema.settings).where(eq(schema.settings.key, key));
  if (row) {
    await db.update(schema.settings).set({ value, updatedAt: new Date() }).where(eq(schema.settings.key, key));
  } else {
    await db.insert(schema.settings).values({ key, value });
  }
  return row?.value;
}
