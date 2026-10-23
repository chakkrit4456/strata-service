"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink px-4 text-cream">
      <form action={action} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-ink-line-2 bg-ink-2 p-7">
        <Logo />
        <h1 className="mt-2 text-lg font-semibold">เข้าสู่ระบบหลังบ้าน</h1>
        <input
          name="user"
          placeholder="ชื่อผู้ใช้"
          autoComplete="username"
          required
          className="rounded-md border border-ink-line-2 bg-ink px-3 py-2.5 outline-none focus:border-gold"
        />
        <input
          name="password"
          type="password"
          placeholder="รหัสผ่าน"
          autoComplete="current-password"
          required
          className="rounded-md border border-ink-line-2 bg-ink px-3 py-2.5 outline-none focus:border-gold"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={pending} className="rounded-md bg-gold py-2.5 font-semibold text-ink hover:bg-cream disabled:opacity-50">
          {pending ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ"}
        </button>
      </form>
    </main>
  );
}
