import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { getAdminSession } from "@/lib/session";
import { logWhere, type LogFilter } from "@/lib/audit-query";

const cell = (v: unknown) => {
  const s = v == null ? "" : typeof v === "string" ? v : v instanceof Date ? v.toISOString() : JSON.stringify(v);
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  const s = await getAdminSession();
  if (!s.user) return new Response("unauthorized", { status: 401 });
  const f = Object.fromEntries(new URL(req.url).searchParams) as LogFilter;
  const l = schema.auditLogs;
  const rows = await db.select().from(l).where(logWhere(f)).orderBy(desc(l.id)).limit(50_000);
  const head = ["id", "created_at", "actor", "event", "conversation_id", "ip", "user_agent", "before", "after", "meta"];
  const body = rows.map((r) =>
    [r.id, r.createdAt, r.actor, r.event, r.conversationId, r.ip, r.userAgent, r.before, r.after, r.meta].map(cell).join(","),
  );
  return new Response("﻿" + [head.join(","), ...body].join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="strata-audit-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
