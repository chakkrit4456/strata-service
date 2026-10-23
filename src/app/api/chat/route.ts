import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { audit, clientInfo } from "@/lib/audit";
import { addMessage, getByToken, getMessages, getRequirement, requirementOf } from "@/lib/conversations";
import { getSettings } from "@/lib/settings";
import { streamReply } from "@/lib/ai/provider";
import { stateNote } from "@/lib/ai/extract";
import { rateLimit } from "@/lib/rate-limit";

const MAX_LEN = 4000;
const HISTORY = 40;

export async function POST(req: Request) {
  const { token, message } = (await req.json().catch(() => ({}))) as { token?: string; message?: string };
  const conv = await getByToken(token ?? "");
  if (!conv) return NextResponse.json({ error: "ไม่พบบทสนทนา" }, { status: 404 });
  const text = (message ?? "").trim().slice(0, MAX_LEN);
  if (!text) return NextResponse.json({ error: "ข้อความว่าง" }, { status: 400 });

  const info = await clientInfo();
  if (!rateLimit(`chat:${conv.id}`, 20, 60_000) || !rateLimit(`chatip:${info.ip}`, 60, 60_000)) {
    return NextResponse.json({ error: "ส่งข้อความเร็วเกินไป รอสักครู่นะครับ" }, { status: 429 });
  }

  const userMsg = await addMessage(conv.id, "user", text);
  await audit("message.sent", "customer", { conversationId: conv.id, meta: { messageId: userMsg.id, length: text.length } }, info);
  if (conv.archivedAt) {
    // ลูกค้ากลับมาคุยต่อ → นำกลับขึ้นหน้า Inbox
    await db.update(schema.conversations).set({ archivedAt: null }).where(eq(schema.conversations.id, conv.id));
  }

  // เจ้าของรับช่วงต่อแล้ว — AI เงียบ รอเจ้าของตอบ
  if (!conv.aiEnabled) return new Response(null, { status: 204 });

  const settings = await getSettings();
  const history = (await getMessages(conv.id)).filter((m) => m.role !== "system").slice(-HISTORY);
  const requirement = requirementOf(await getRequirement(conv.id));
  const confirmed = conv.status === "summarized" || conv.status === "quoted";
  const system =
    settings.systemPrompt +
    stateNote(requirement) +
    (confirmed ? "\n\nลูกค้ายืนยัน Requirement แล้ว ให้รับทราบข้อมูลเพิ่มเติม และย้ำว่าทีมจะติดต่อกลับพร้อมใบเสนอราคา" : "");

  try {
    const r = await streamReply(
      settings,
      system,
      history.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.role === "admin" ? `[ทีม Strata ตอบเอง] ${m.content}` : m.content,
      })),
    );
    r.done
      .then(async ({ text: reply, tokens }) => {
        if (!reply) return;
        const m = await addMessage(conv.id, "assistant", reply, { provider: r.provider, model: r.model, tokens });
        await audit(
          "ai.replied",
          "ai",
          { conversationId: conv.id, meta: { messageId: m.id, provider: r.provider, model: r.model, tokens } },
          info,
        );
      })
      .catch((e) => console.error("save reply failed", e));
    return new Response(r.stream, {
      headers: { "content-type": "text/plain; charset=utf-8", "x-ai-provider": r.provider, "cache-control": "no-store" },
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error("ai failed", err);
    await audit("ai.failed", "system", { conversationId: conv.id, meta: { error: err.slice(0, 1000) } }, info);
    const fallback =
      "ขออภัยครับ ตอนนี้ระบบ AI ใช้งานไม่ได้ชั่วคราว ข้อความของคุณถูกบันทึกแล้ว ทีม Strata จะเข้ามาตอบโดยเร็ว — ฝากชื่อและเบอร์โทร/LINE ไว้ได้เลยครับ";
    await addMessage(conv.id, "assistant", fallback, { provider: "system" });
    return new Response(fallback, { headers: { "content-type": "text/plain; charset=utf-8", "x-ai-provider": "none" } });
  }
}
