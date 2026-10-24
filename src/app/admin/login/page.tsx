"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  const field = "w-full border border-white/25 bg-white/5 px-3.5 py-3 text-white outline-none transition placeholder:text-stone-2 focus:border-white";
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[linear-gradient(180deg,#9db1c4,#dbe4ec_70%)] p-3">
      <div className="slide-navy corners anim-fade-up relative w-full max-w-md overflow-hidden p-8 md:p-10">
        <span aria-hidden className="anim-orbit pointer-events-none absolute -right-48 -bottom-64 size-[420px] rounded-full border border-white/20">
          <span className="orb absolute top-0 left-1/2 size-9 -translate-x-1/2 -translate-y-1/2" />
        </span>
        <form action={action} className="relative flex flex-col gap-4">
          <Logo dark />
          <h1 className="mt-6 text-[40px] leading-none font-medium tracking-[-0.05em]">หลังบ้าน</h1>
          <p className="-mt-1 text-sm text-stone-2">บทสนทนา Requirement และ Audit log</p>
          <input name="user" placeholder="ชื่อผู้ใช้" autoComplete="username" required className={`${field} mt-2`} />
          <input name="password" type="password" placeholder="รหัสผ่าน" autoComplete="current-password" required className={field} />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button disabled={pending} className="btn-pill-light mt-2 self-start disabled:opacity-50">
            <span>{pending ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ"}</span>
          </button>
        </form>
      </div>
    </main>
  );
}
