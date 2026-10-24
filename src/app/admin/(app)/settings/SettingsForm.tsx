"use client";

import { useActionState } from "react";
import { saveSettings } from "../../actions";
import type { AppSettings } from "@/lib/settings";

export function SettingsForm({ settings, keys }: { settings: AppSettings; keys: { gemini: boolean; groq: boolean } }) {
  const [msg, action, pending] = useActionState(saveSettings, null);
  const input = "w-full rounded-md border border-sand px-3 py-2 font-mono text-[13px] outline-none focus:border-gold";
  const label = "flex flex-col gap-1.5 text-sm";
  const hint = "text-xs text-muted";
  return (
    <form action={action} className="grid max-w-4xl gap-6 px-4 py-6 md:px-7">
      <section className="grid gap-4 md:grid-cols-3">
        <label className={label}>
          โมเดลหลัก (Gemini) {keys.gemini ? "✓" : <span className="text-[#A13D2D]">ไม่มี key</span>}
          <input name="geminiModel" defaultValue={settings.geminiModel} className={input} />
        </label>
        <label className={label}>
          โมเดลสำรอง (Groq) {keys.groq ? "✓" : <span className="text-[#A13D2D]">ไม่มี key</span>}
          <input name="groqModel" defaultValue={settings.groqModel} className={input} />
        </label>
        <label className={label}>
          โมเดลสกัด Requirement (Gemini)
          <input name="extractModel" defaultValue={settings.extractModel} className={input} />
        </label>
      </section>
      <p className={hint}>API key ตั้งในไฟล์ .env บนเซิร์ฟเวอร์ (GEMINI_API_KEY, GROQ_API_KEY) — ถ้า Gemini เต็มโควตาจะสลับไป Groq อัตโนมัติ</p>
      <label className={label}>
        ระยะเวลาแสดงผลบนหน้าเว็บ (เดือน)
        <input name="retentionMonths" type="number" min={1} max={60} defaultValue={settings.retentionMonths} className={`${input} w-32`} />
        <span className={hint}>ครบกำหนดนับจากกิจกรรมล่าสุด → ซ่อนจาก Inbox ย้ายเข้าคลัง ข้อมูลและ log ไม่ถูกลบ</span>
      </label>
      <label className={label}>
        System prompt ของ AI
        <textarea name="systemPrompt" defaultValue={settings.systemPrompt} rows={22} className={`${input} font-sans leading-relaxed`} />
        <span className={hint}>ต้องคงกฎ “ห้ามเสนอราคา” ไว้ ระบบจะต่อท้ายสถานะ Requirement ปัจจุบันให้อัตโนมัติ</span>
      </label>
      <div className="flex items-center gap-3">
        <button disabled={pending} className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          {pending ? "กำลังบันทึก…" : "บันทึก"}
        </button>
        {msg && <span className="text-sm text-gold-dark">{msg}</span>}
      </div>
    </form>
  );
}
