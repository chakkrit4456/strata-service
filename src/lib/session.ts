import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";

type AdminSession = { user?: string };

export async function getAdminSession() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET ต้องยาวอย่างน้อย 32 ตัวอักษร");
  return getIronSession<AdminSession>(await cookies(), {
    password: secret,
    cookieName: "strata_admin",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" && process.env.PUBLIC_URL?.startsWith("https"),
      maxAge: 60 * 60 * 12,
    },
  });
}

export async function requireAdmin() {
  const s = await getAdminSession();
  if (!s.user) redirect("/admin/login");
  return s.user;
}
