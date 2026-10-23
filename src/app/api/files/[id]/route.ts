import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getAdminSession } from "@/lib/session";
import { UPLOAD_DIR } from "@/lib/uploads";

// ดาวน์โหลดไฟล์แนบ — เฉพาะเจ้าของ
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await getAdminSession();
  if (!s.user) return new Response("unauthorized", { status: 401 });
  const [a] = await db.select().from(schema.attachments).where(eq(schema.attachments.id, Number((await params).id)));
  if (!a) return new Response("not found", { status: 404 });
  const buf = await readFile(path.join(UPLOAD_DIR, path.basename(a.storedName))).catch(() => null);
  if (!buf) return new Response("file missing", { status: 404 });
  return new Response(new Uint8Array(buf), {
    headers: {
      "content-type": "application/octet-stream",
      "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(a.fileName)}`,
    },
  });
}
