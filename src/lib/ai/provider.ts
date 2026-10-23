import { streamText, generateObject, type ModelMessage, type LanguageModel } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import type { z } from "zod";
import type { AppSettings } from "@/lib/settings";

type Candidate = { provider: string; model: string; lm: LanguageModel };

async function candidates(s: AppSettings, geminiModel = s.geminiModel): Promise<Candidate[]> {
  if (process.env.AI_MOCK === "1") {
    const { mockModel } = await import("./mock");
    return [{ provider: "mock", model: "mock", lm: mockModel() }];
  }
  const list: Candidate[] = [];
  if (process.env.GEMINI_API_KEY) {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
    list.push({ provider: "gemini", model: geminiModel, lm: google(geminiModel) });
  }
  if (process.env.GROQ_API_KEY) {
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    list.push({ provider: "groq", model: s.groqModel, lm: groq(s.groqModel) });
  }
  if (!list.length) throw new Error("ยังไม่ได้ตั้งค่า GEMINI_API_KEY หรือ GROQ_API_KEY");
  return list;
}

export type StreamResult = {
  provider: string;
  model: string;
  stream: ReadableStream<Uint8Array>;
  done: Promise<{ text: string; tokens?: number }>;
};

// ลองทีละ provider: ถ้า error ก่อนได้ข้อความแรก (เช่น 429 โควตาเต็ม) จะสลับไปตัวถัดไป
export async function streamReply(
  settings: AppSettings,
  system: string,
  messages: ModelMessage[],
): Promise<StreamResult> {
  const errors: string[] = [];
  for (const c of await candidates(settings)) {
    const result = streamText({ model: c.lm, system, messages, maxRetries: 0, temperature: 0.5 });
    const it = result.fullStream[Symbol.asyncIterator]();
    let first: string | null = null;
    let failed: unknown = null;
    while (true) {
      const { value, done } = await it.next().catch((e) => ({ value: { type: "error", error: e } as const, done: false }));
      if (done) break;
      if (value.type === "error") {
        failed = value.error;
        break;
      }
      if (value.type === "text-delta" && value.text) {
        first = value.text;
        break;
      }
    }
    if (failed || first === null) {
      errors.push(`${c.provider}: ${failed instanceof Error ? failed.message : String(failed ?? "empty")}`);
      continue;
    }

    const enc = new TextEncoder();
    let full = first;
    let resolveDone!: (v: { text: string; tokens?: number }) => void;
    const done = new Promise<{ text: string; tokens?: number }>((r) => (resolveDone = r));
    const stream = new ReadableStream<Uint8Array>({
      start(ctrl) {
        ctrl.enqueue(enc.encode(first!));
      },
      async pull(ctrl) {
        try {
          // วนจนกว่าจะได้ข้อความหรือจบ — ถ้า pull คืนค่าโดยไม่ enqueue สตรีมจะค้าง
          while (true) {
            const { value, done: end } = await it.next();
            if (end || value.type === "finish") {
              ctrl.close();
              const tokens = !end && value.type === "finish" ? value.totalUsage?.totalTokens : undefined;
              resolveDone({ text: full, tokens });
              return;
            }
            if (value.type === "error") throw value.error;
            if (value.type === "text-delta" && value.text) {
              full += value.text;
              ctrl.enqueue(enc.encode(value.text));
              return;
            }
          }
        } catch (e) {
          console.error("stream error", e);
          resolveDone({ text: full });
          ctrl.close();
        }
      },
      cancel() {
        resolveDone({ text: full });
      },
    });
    return { provider: c.provider, model: c.model, stream, done };
  }
  throw new Error(errors.join(" | "));
}

export async function generateStructured<T>(settings: AppSettings, schema: z.ZodType<T>, system: string, prompt: string) {
  const errors: string[] = [];
  for (const c of await candidates(settings, settings.extractModel)) {
    try {
      const { object } = await generateObject({
        model: c.lm,
        schema,
        system,
        prompt,
        maxRetries: 1,
        temperature: 0,
        providerOptions: { groq: { structuredOutputs: false } },
      });
      return { object, provider: c.provider, model: c.model };
    } catch (e) {
      errors.push(`${c.provider}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(errors.join(" | "));
}
