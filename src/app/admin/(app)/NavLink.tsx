"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function NavLink({ href, label, count }: { href: string; label: string; count: number | null }) {
  const path = usePathname();
  const params = useSearchParams();
  const [p, q = ""] = href.split("?");
  const current = params.toString();
  const active = path === p && (q ? current.includes(q) : !current || p !== "/admin");
  return (
    <Link
      href={href}
      className={`flex justify-between rounded-full px-3 py-2 transition-colors duration-200 ${active ? "bg-white text-ink" : "hover:bg-white/10 hover:text-white"}`}
    >
      <span>{label}</span>
      {count !== null && <span className={`text-xs ${active ? "text-muted" : "text-stone-2"}`}>{count}</span>}
    </Link>
  );
}
