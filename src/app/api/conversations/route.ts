import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db, schema } from "@/db";
import { audit, clientInfo } from "@/lib/audit";
import { addMessage } from "@/lib/conversations";
import { GREETING } from "@/lib/ai/prompt";
import { CATEGORIES } from "@/lib/requirement";
import { rateLimit } from "@/lib/rate-limit";

const SOURCES = ["fastwork", "facebook", "google", "line", "tiktok", "instagram", "direct"];

export async function POST(req: Request) {
  const info = await clientInfo();
  if (!rateLimit(`new:${info.ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "สร้างแชทใหม่บ่อยเกินไป ลองใหม่ภายหลังครับ" }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    source?: string;
    utm?: Record<string, string>;
    referrer?: string;
    category?: string;
  };
  const utm = Object.fromEntries(
    Object.entries(body.utm ?? {})
      .filter(([k, v]) => k.startsWith("utm_") && typeof v === "string")
      .map(([k, v]) => [k, v.slice(0, 100)]),
  );
  const raw = (body.source || utm.utm_source || "").toLowerCase().slice(0, 50);
  const source = SOURCES.includes(raw) ? raw : raw ? "other" : "direct";
  const category = CATEGORIES.some((c) => c.key === body.category) ? body.category! : null;

  const [conv] = await db
    .insert(schema.conversations)
    .values({
      publicToken: nanoid(24),
      source,
      utm: source === "other" ? { ...utm, src: raw } : utm,
      referrer: body.referrer?.slice(0, 500) || null,
      category,
      ip: info.ip,
      userAgent: info.userAgent,
    })
    .returning();
  await addMessage(conv.id, "assistant", GREETING, { provider: "system" });
  await audit("chat.started", "customer", { conversationId: conv.id, after: { source, utm, category } }, info);
  return NextResponse.json({ token: conv.publicToken, code: conv.code });
}
