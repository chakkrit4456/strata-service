import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { getAttachments, getByToken, getMessages, getRequirement, requirementOf, saveRequirement } from "@/lib/conversations";
import { getSettings } from "@/lib/settings";
import { extractRequirement } from "@/lib/ai/extract";
import { completeness } from "@/lib/requirement";
import { rateLimit } from "@/lib/rate-limit";

// เรียกหลัง AI ตอบจบแต่ละครั้ง เพื่ออัปเดตแผง Requirement ร่าง
export async function POST(req: Request) {
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  const conv = await getByToken(token ?? "");
  if (!conv) return NextResponse.json({ error: "not found" }, { status: 404 });
  const previous = requirementOf(await getRequirement(conv.id));
  // ยืนยันแล้วไม่สกัดทับ — เจ้าของใช้ฉบับที่ลูกค้ายืนยัน
  if (conv.status !== "new" && conv.status !== "chatting") {
    return NextResponse.json({ requirement: previous, completeness: completeness(previous) });
  }
  if (!rateLimit(`extract:${conv.id}`, 20, 60_000)) {
    return NextResponse.json({ requirement: previous, completeness: completeness(previous) });
  }
  try {
    const msgs = (await getMessages(conv.id)).slice(-80);
    const files = (await getAttachments(conv.id)).map((a) => a.fileName);
    const { object, provider, model } = await extractRequirement(await getSettings(), previous, msgs, files);
    await saveRequirement(conv.id, object);
    await audit("requirement.generated", "ai", {
      conversationId: conv.id,
      after: { completeness: completeness(object) },
      meta: { provider, model },
    });
    return NextResponse.json({ requirement: object, completeness: completeness(object) });
  } catch (e) {
    console.error("extract failed", e);
    return NextResponse.json({ requirement: previous, completeness: completeness(previous) });
  }
}
