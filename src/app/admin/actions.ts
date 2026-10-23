"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema } from "@/db";
import { STATUSES, type Status } from "@/db/schema";
import { audit, clientInfo } from "@/lib/audit";
import { getAdminSession, requireAdmin } from "@/lib/session";
import { addMessage } from "@/lib/conversations";
import { getSettings, saveSetting, type AppSettings } from "@/lib/settings";
import { addMonths } from "@/lib/retention";
import { rateLimit } from "@/lib/rate-limit";

export async function login(_prev: string | null, form: FormData) {
  const info = await clientInfo();
  if (!rateLimit(`login:${info.ip}`, 10, 15 * 60_000)) return "พยายามเข้าสู่ระบบบ่อยเกินไป ลองใหม่ใน 15 นาที";
  const user = String(form.get("user") ?? "");
  const pass = String(form.get("password") ?? "");
  const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
  const ok = !!hash && user === (process.env.ADMIN_USER ?? "admin") && (await bcrypt.compare(pass, hash));
  if (!ok) {
    await audit("login.failed", `admin:${user.slice(0, 50) || "?"}`, {}, info);
    return "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
  }
  const s = await getAdminSession();
  s.user = user;
  await s.save();
  await audit("login.success", `admin:${user}`, {}, info);
  redirect("/admin");
}

export async function logout() {
  const s = await getAdminSession();
  if (s.user) await audit("logout", `admin:${s.user}`);
  s.destroy();
  redirect("/admin/login");
}

async function conv(id: number) {
  const [c] = await db.select().from(schema.conversations).where(eq(schema.conversations.id, id));
  if (!c) throw new Error("not found");
  return c;
}

export async function setStatus(id: number, status: Status) {
  const user = await requireAdmin();
  if (!STATUSES.includes(status)) return;
  const c = await conv(id);
  if (c.status === status) return;
  await db.update(schema.conversations).set({ status }).where(eq(schema.conversations.id, id));
  await audit("status.changed", `admin:${user}`, { conversationId: id, before: { status: c.status }, after: { status } });
  revalidatePath(`/admin/c/${id}`);
}

export async function setTakeover(id: number, takeover: boolean) {
  const user = await requireAdmin();
  const c = await conv(id);
  await db.update(schema.conversations).set({ aiEnabled: !takeover }).where(eq(schema.conversations.id, id));
  await audit("admin.takeover", `admin:${user}`, {
    conversationId: id,
    before: { aiEnabled: c.aiEnabled },
    after: { aiEnabled: !takeover },
  });
  revalidatePath(`/admin/c/${id}`);
}

export async function adminReply(id: number, form: FormData) {
  const user = await requireAdmin();
  const text = String(form.get("message") ?? "").trim().slice(0, 4000);
  if (!text) return;
  const c = await conv(id);
  // ตอบเองแล้ว AI หยุดตอบในแชทนี้
  if (c.aiEnabled) await setTakeover(id, true);
  const m = await addMessage(id, "admin", text);
  await audit("admin.replied", `admin:${user}`, { conversationId: id, meta: { messageId: m.id, length: text.length } });
  revalidatePath(`/admin/c/${id}`);
}

export async function addNote(id: number, form: FormData) {
  const user = await requireAdmin();
  const text = String(form.get("note") ?? "").trim().slice(0, 4000);
  if (!text) return;
  await db.insert(schema.adminNotes).values({ conversationId: id, content: text });
  await audit("admin.note", `admin:${user}`, { conversationId: id, after: { note: text } });
  revalidatePath(`/admin/c/${id}`);
}

// ปักหมุด = ขยายเวลาแสดงผลอีก N เดือนนับจากวันนี้ (0 = ยกเลิก)
export async function pin(id: number, months: number) {
  const user = await requireAdmin();
  const c = await conv(id);
  const pinnedUntil = months > 0 ? addMonths(new Date(), months) : null;
  await db.update(schema.conversations).set({ pinnedUntil, archivedAt: null }).where(eq(schema.conversations.id, id));
  await audit("chat.pinned", `admin:${user}`, {
    conversationId: id,
    before: { pinnedUntil: c.pinnedUntil, archivedAt: c.archivedAt },
    after: { pinnedUntil },
  });
  revalidatePath("/admin");
  revalidatePath(`/admin/c/${id}`);
}

export async function saveSettings(_prev: string | null, form: FormData) {
  const user = await requireAdmin();
  const current = await getSettings();
  const next: AppSettings = {
    geminiModel: String(form.get("geminiModel") || current.geminiModel).trim(),
    groqModel: String(form.get("groqModel") || current.groqModel).trim(),
    extractModel: String(form.get("extractModel") || current.extractModel).trim(),
    systemPrompt: String(form.get("systemPrompt") || current.systemPrompt),
    retentionMonths: Math.min(60, Math.max(1, Number(form.get("retentionMonths")) || current.retentionMonths)),
  };
  for (const key of Object.keys(next) as (keyof AppSettings)[]) {
    if (next[key] === current[key]) continue;
    await saveSetting(key, next[key] as never);
    await audit("settings.changed", `admin:${user}`, { before: { [key]: current[key] }, after: { [key]: next[key] } });
  }
  revalidatePath("/admin/settings");
  return "บันทึกแล้ว";
}
