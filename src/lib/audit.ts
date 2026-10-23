import { headers } from "next/headers";
import { db, schema } from "@/db";

export type AuditEvent =
  | "chat.started"
  | "message.sent"
  | "ai.replied"
  | "ai.failed"
  | "file.uploaded"
  | "requirement.generated"
  | "requirement.confirmed"
  | "admin.viewed"
  | "admin.takeover"
  | "admin.replied"
  | "admin.note"
  | "status.changed"
  | "chat.pinned"
  | "chat.archived"
  | "settings.changed"
  | "login.success"
  | "login.failed"
  | "logout";

export async function clientInfo() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || null;
  return { ip, userAgent: h.get("user-agent") };
}

// helper เดียวที่ทุก route เรียก — ไม่มีทางแก้/ลบ log ย้อนหลัง
export async function audit(
  event: AuditEvent,
  actor: string,
  data: { conversationId?: number | null; before?: unknown; after?: unknown; meta?: unknown } = {},
  info?: { ip: string | null; userAgent: string | null },
) {
  const { ip, userAgent } = info ?? (await clientInfo().catch(() => ({ ip: null, userAgent: null })));
  await db.insert(schema.auditLogs).values({
    event,
    actor,
    conversationId: data.conversationId ?? null,
    ip,
    userAgent,
    before: data.before ?? null,
    after: data.after ?? null,
    meta: data.meta ?? null,
  });
}
