import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  index,
  bigserial,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { Requirement } from "@/lib/requirement";

export const STATUSES = ["new", "chatting", "summarized", "quoted", "closed"] as const;
export type Status = (typeof STATUSES)[number];

export const conversations = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    code: text("code")
      .notNull()
      .generatedAlwaysAs(sql`'S-' || lpad(id::text, 4, '0')`),
    publicToken: text("public_token").notNull().unique(),
    source: text("source").notNull().default("direct"),
    utm: jsonb("utm").$type<Record<string, string>>().notNull().default({}),
    referrer: text("referrer"),
    category: text("category"),
    title: text("title"),
    status: text("status").$type<Status>().notNull().default("new"),
    completeness: integer("completeness").notNull().default(0),
    contactName: text("contact_name"),
    contactPhone: text("contact_phone"),
    contactLine: text("contact_line"),
    contactEmail: text("contact_email"),
    budget: text("budget"),
    aiEnabled: boolean("ai_enabled").notNull().default(true),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
    pinnedUntil: timestamp("pinned_until", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [index("conversations_activity_idx").on(t.archivedAt, t.lastActivityAt)],
);

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id),
    role: text("role").$type<"user" | "assistant" | "admin" | "system">().notNull(),
    content: text("content").notNull(),
    provider: text("provider"),
    model: text("model"),
    tokens: integer("tokens"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_conv_idx").on(t.conversationId, t.id)],
);

export const requirements = pgTable("requirements", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .unique()
    .references(() => conversations.id),
  data: jsonb("data").$type<Requirement>().notNull(),
  version: integer("version").notNull().default(1),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id),
  fileName: text("file_name").notNull(),
  storedName: text("stored_name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminNotes = pgTable("admin_notes", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// append-only: UPDATE/DELETE ถูกบล็อกด้วย trigger ใน migration
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    event: text("event").notNull(),
    actor: text("actor").notNull(), // customer | admin:<user> | ai | system
    conversationId: integer("conversation_id"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    before: jsonb("before"),
    after: jsonb("after"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_created_idx").on(t.createdAt),
    index("audit_event_idx").on(t.event),
    index("audit_conv_idx").on(t.conversationId),
  ],
);

export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
