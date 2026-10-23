import { and, asc, eq, gt } from "drizzle-orm";
import { db, schema } from "@/db";
import { emptyRequirement, type Requirement, completeness, hasContact } from "@/lib/requirement";

export async function getByToken(token: string) {
  if (!token || token.length > 64) return null;
  const [c] = await db.select().from(schema.conversations).where(eq(schema.conversations.publicToken, token));
  return c ?? null;
}

export async function getMessages(conversationId: number, afterId = 0) {
  return db
    .select()
    .from(schema.messages)
    .where(and(eq(schema.messages.conversationId, conversationId), gt(schema.messages.id, afterId)))
    .orderBy(asc(schema.messages.id));
}

export async function getRequirement(conversationId: number) {
  const [r] = await db.select().from(schema.requirements).where(eq(schema.requirements.conversationId, conversationId));
  return r ?? null;
}

export async function getAttachments(conversationId: number) {
  return db
    .select()
    .from(schema.attachments)
    .where(eq(schema.attachments.conversationId, conversationId))
    .orderBy(asc(schema.attachments.id));
}

export async function addMessage(
  conversationId: number,
  role: Role,
  content: string,
  extra: { provider?: string; model?: string; tokens?: number } = {},
) {
  const [m] = await db.insert(schema.messages).values({ conversationId, role, content, ...extra }).returning();
  await db
    .update(schema.conversations)
    .set({ lastActivityAt: new Date() })
    .where(eq(schema.conversations.id, conversationId));
  return m;
}
type Role = "user" | "assistant" | "admin" | "system";

// บันทึก Requirement และ sync ช่องที่ใช้กรอง/แสดงใน Inbox
export async function saveRequirement(conversationId: number, data: Requirement) {
  const existing = await getRequirement(conversationId);
  if (existing) {
    await db
      .update(schema.requirements)
      .set({ data, version: existing.version + 1, updatedAt: new Date() })
      .where(eq(schema.requirements.id, existing.id));
  } else {
    await db.insert(schema.requirements).values({ conversationId, data });
  }
  const [conv] = await db.select().from(schema.conversations).where(eq(schema.conversations.id, conversationId));
  await db
    .update(schema.conversations)
    .set({
      title: data.title || null,
      category: data.category,
      budget: data.budget,
      completeness: completeness(data),
      contactName: data.contact.name,
      contactPhone: data.contact.phone,
      contactLine: data.contact.line,
      contactEmail: data.contact.email,
      status: conv?.status === "new" ? "chatting" : conv?.status,
    })
    .where(eq(schema.conversations.id, conversationId));
  return existing?.data ?? null;
}

export function requirementOf(r: { data: Requirement } | null) {
  return r?.data ?? emptyRequirement;
}

export { hasContact };
