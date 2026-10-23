import { NextResponse } from "next/server";
import { getByToken, getMessages, getRequirement, requirementOf } from "@/lib/conversations";
import { completeness } from "@/lib/requirement";

// ลูกค้า poll ข้อความใหม่ (เช่น เจ้าของตอบเอง) และ Requirement ล่าสุด
export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const conv = await getByToken((await params).token);
  if (!conv) return NextResponse.json({ error: "not found" }, { status: 404 });
  const after = Number(new URL(req.url).searchParams.get("after") || 0);
  const msgs = await getMessages(conv.id, after);
  const requirement = requirementOf(await getRequirement(conv.id));
  return NextResponse.json({
    status: conv.status,
    aiEnabled: conv.aiEnabled,
    messages: msgs
      .filter((m) => m.role !== "system")
      .map((m) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt })),
    requirement,
    completeness: completeness(requirement),
  });
}
