import { and, eq, gte, ilike, like, lte, or, type SQL } from "drizzle-orm";
import { schema } from "@/db";

export type LogFilter = { event?: string; actor?: string; conv?: string; from?: string; to?: string; q?: string; tab?: string };

export function logWhere(f: LogFilter) {
  const l = schema.auditLogs;
  const where: SQL[] = [];
  if (f.tab === "login") where.push(or(like(l.event, "login.%"), eq(l.event, "logout"))!);
  if (f.event) where.push(eq(l.event, f.event));
  if (f.actor) where.push(like(l.actor, `${f.actor}%`));
  if (f.conv && Number(f.conv)) where.push(eq(l.conversationId, Number(f.conv)));
  if (f.from) where.push(gte(l.createdAt, new Date(`${f.from}T00:00:00+07:00`)));
  if (f.to) where.push(lte(l.createdAt, new Date(`${f.to}T23:59:59+07:00`)));
  if (f.q) where.push(or(ilike(l.ip, `%${f.q}%`), ilike(l.actor, `%${f.q}%`), ilike(l.event, `%${f.q}%`))!);
  return where.length ? and(...where) : undefined;
}

export function logDetail(l: { before: unknown; after: unknown; meta: unknown }) {
  const parts: string[] = [];
  if (l.before != null) parts.push(`ก่อน ${JSON.stringify(l.before)}`);
  if (l.after != null) parts.push(`หลัง ${JSON.stringify(l.after)}`);
  if (l.meta != null) parts.push(JSON.stringify(l.meta));
  return parts.join(" → ");
}
