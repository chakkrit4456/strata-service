import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <div className="flex flex-col">
      <div className="border-b border-[#e3eaf1] px-4 py-4.5 md:px-7">
        <h1 className="text-[28px] leading-none font-medium tracking-[-0.04em]">ตั้งค่า</h1>
        <p className="mt-1 text-[13px] text-muted">ทุกการเปลี่ยนแปลงถูกบันทึกใน Audit log (settings.changed)</p>
      </div>
      <SettingsForm settings={s} keys={{ gemini: !!process.env.GEMINI_API_KEY, groq: !!process.env.GROQ_API_KEY }} />
    </div>
  );
}
