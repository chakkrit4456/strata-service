// โมเดลจำลองสำหรับทดสอบในเครื่องโดยไม่ใช้ API key (AI_MOCK=1) — ห้ามเปิดใน production
import { MockLanguageModelV2, simulateReadableStream } from "ai/test";

function promptText(prompt: { role: string; content: unknown }[]) {
  return prompt
    .map((m) =>
      typeof m.content === "string"
        ? m.content
        : (m.content as { type: string; text?: string }[]).map((p) => p.text ?? "").join(""),
    )
    .join("\n");
}

function fakeExtract(text: string) {
  const transcript = text.split("บทสนทนา:")[1] ?? text;
  const users = transcript.split("\n").filter((l) => l.startsWith("ลูกค้า:")).map((l) => l.slice(7).trim());
  const all = users.join("\n");
  const m = (re: RegExp) => all.match(re)?.[1]?.trim() ?? null;
  return {
    title: users[0]?.slice(0, 40) ?? "",
    category: users.length ? "software" : null,
    organization: null,
    goal: users[0] ?? null,
    users: null,
    mustHave: users.length > 1 ? [users[1]] : [],
    niceToHave: [],
    references: /ไฟล์|ลิงก์|http/.test(all) ? ["ตามที่แนบในแชท"] : [],
    budget: m(/งบ\s*([^\n]+)/),
    deadline: m(/(?:ภายใน|ส่ง)\s*([^\n]+)/),
    contact: {
      name: m(/ชื่อ\s*([^\s,]+)/),
      phone: m(/(0\d{1,2}-?\d{3}-?\d{4})/),
      line: m(/line\s*:?\s*(\S+)/i),
      email: m(/([\w.+-]+@[\w-]+\.[\w.]+)/),
    },
    openQuestions: [],
  };
}

export function mockModel() {
  return new MockLanguageModelV2({
    doStream: async ({ prompt }) => {
      const t = promptText(prompt as never);
      const reply = /ราคา/.test(t.split("\n").slice(-3).join(""))
        ? "เรื่องราคาทีม Strata จะประเมินจาก Requirement แล้วติดต่อกลับพร้อมใบเสนอราคาครับ"
        : "รับทราบครับ ขอรายละเอียดเพิ่มอีกนิด — มีกำหนดส่ง งบประมาณ และช่องทางติดต่อ (ชื่อ เบอร์ LINE) ไหมครับ";
      return {
        stream: simulateReadableStream({
          chunkDelayInMs: 15,
          chunks: [
            { type: "text-start", id: "1" },
            ...reply.match(/.{1,6}/gsu)!.map((d) => ({ type: "text-delta" as const, id: "1", delta: d })),
            { type: "text-end", id: "1" },
            { type: "finish", finishReason: "stop", usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 } },
          ],
        }),
      };
    },
    doGenerate: async ({ prompt }) => ({
      content: [{ type: "text", text: JSON.stringify(fakeExtract(promptText(prompt as never))) }],
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      warnings: [],
    }),
  });
}
