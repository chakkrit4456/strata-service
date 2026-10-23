// ตัว S แบบบล็อก + จุดทอง
export function LogoMark({ size = 32, dark = true }: { size?: number; dark?: boolean }) {
  const fg = dark ? "#EFECE5" : "#0D0F11";
  const bg = dark ? "#0D0F11" : "#EFECE5";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="flex-none rounded-md">
      <rect width="32" height="32" fill={bg} />
      <path d="M8 7h16v5H13v3h11v10H8v-5h11v-3H8z" fill={fg} />
      <rect x="26" y="26" width="3" height="3" fill="#C9AE73" />
    </svg>
  );
}

export function Logo({ dark = true }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark dark={dark} />
      <span className="text-lg font-semibold tracking-tight">strata</span>
      <span className={`font-mono text-[11px] ${dark ? "text-stone-2" : "text-muted"}`}>software studio</span>
    </span>
  );
}
