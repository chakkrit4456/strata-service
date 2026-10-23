import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { audit } from "@/lib/audit";
import { addMessage, getByToken, getRequirement, requirementOf, saveRequirement } from "@/lib/conversations";
import { ACK_MESSAGE } from "@/lib/ai/prompt";
import { categoryName, hasContact, requirementSchema } from "@/lib/requirement";
import { notifyOwner } from "@/lib/notify";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { token?: string; requirement?: unknown };
  const conv = await getByToken(body.token ?? "");
  if (!conv) return NextResponse.json({ error: "ไม่พบบทสนทนา" }, { status: 404 });

  const current = requirementOf(await getRequirement(conv.id));
  // ลูกค้าแก้ไขได้จากหน้าสรุป
  const parsed = body.requirement ? requirementSchema.safeParse(body.requirement) : null;
  if (parsed && !parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const data = parsed?.data ?? current;
  if (!hasContact(data)) {
    return NextResponse.json({ error: "กรุณากรอกชื่อ เบอร์โทร และ LINE หรืออีเมล ก่อนยืนยัน" }, { status: 400 });
  }

  if (parsed) await saveRequirement(conv.id, data);
  await db
    .update(schema.requirements)
    .set({ confirmedAt: new Date() })
    .where(eq(schema.requirements.conversationId, conv.id));
  const alreadyConfirmed = conv.status !== "new" && conv.status !== "chatting";
  if (!alreadyConfirmed) {
    await db.update(schema.conversations).set({ status: "summarized" }).where(eq(schema.conversations.id, conv.id));
    await audit("status.changed", "customer", { conversationId: conv.id, before: { status: conv.status }, after: { status: "summarized" } });
  }
  await audit("requirement.confirmed", "customer", {
    conversationId: conv.id,
    before: parsed ? current : undefined,
    after: data,
  });
  await addMessage(conv.id, "assistant", ACK_MESSAGE, { provider: "system" });

  const url = `${process.env.PUBLIC_URL ?? ""}/admin/c/${conv.id}`;
  notifyOwner(
    `Strata: Requirement ใหม่ ${conv.code}`,
    [
      data.title,
      `หมวด: ${categoryName(data.category)} · ช่องทาง: ${conv.source}`,
      `ลูกค้า: ${data.contact.name} · ${data.contact.phone}${data.contact.line ? ` · LINE ${data.contact.line}` : ""}${data.contact.email ? ` · ${data.contact.email}` : ""}`,
      `งบ: ${data.budget ?? "-"} · กำหนด: ${data.deadline ?? "-"}`,
      url,
    ].join("\n"),
  ).catch(() => {});

  return NextResponse.json({ ok: true, message: ACK_MESSAGE });
}
