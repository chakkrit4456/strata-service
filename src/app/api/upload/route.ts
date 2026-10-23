import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { db, schema } from "@/db";
import { audit, clientInfo } from "@/lib/audit";
import { addMessage, getByToken } from "@/lib/conversations";
import { ALLOWED_EXT, MAX_UPLOAD, UPLOAD_DIR } from "@/lib/uploads";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const conv = await getByToken(String(form?.get("token") ?? ""));
  if (!conv) return NextResponse.json({ error: "ไม่พบบทสนทนา" }, { status: 404 });
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
  if (file.size > MAX_UPLOAD) return NextResponse.json({ error: "ไฟล์ใหญ่เกิน 10 MB" }, { status: 413 });
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return NextResponse.json({ error: `ไม่รองรับไฟล์ ${ext || "นี้"}` }, { status: 415 });

  const info = await clientInfo();
  if (!rateLimit(`upload:${conv.id}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "อัปโหลดบ่อยเกินไป" }, { status: 429 });
  }

  const storedName = `${conv.id}-${nanoid(12)}${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, storedName), Buffer.from(await file.arrayBuffer()));
  const fileName = file.name.slice(0, 200);
  const [a] = await db
    .insert(schema.attachments)
    .values({ conversationId: conv.id, fileName, storedName, mime: file.type || "application/octet-stream", size: file.size })
    .returning();
  const msg = await addMessage(conv.id, "user", `📎 แนบไฟล์: ${fileName} (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
  await audit("file.uploaded", "customer", { conversationId: conv.id, meta: { attachmentId: a.id, fileName, size: file.size } }, info);
  return NextResponse.json({ id: a.id, messageId: msg.id, fileName });
}
