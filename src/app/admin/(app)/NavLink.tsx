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
      className={`flex justify-between rounded-md px-2.5 py-2 ${active ? "bg-ink-line text-cream" : "hover:bg-ink-line/60"}`}
    >
      <span>{label}</span>
      {count !== null && <span className={`font-mono text-xs ${active ? "text-gold" : "text-stone-3"}`}>{count}</span>}
    </Link>
  );
}
