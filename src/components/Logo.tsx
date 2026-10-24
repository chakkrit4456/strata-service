// ตัว S แบบบล็อก + จุดทอง (ใช้ในพื้นที่แคบ)
export function LogoMark({ size = 32, dark = true }: { size?: number; dark?: boolean }) {
  const fg = dark ? "#ffffff" : "#1a2333";
  const bg = dark ? "#1a2333" : "#ffffff";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="flex-none rounded-md">
      <rect width="32" height="32" fill={bg} />
      <path d="M8 7h16v5H13v3h11v10H8v-5h11v-3H8z" fill={fg} />
      <rect x="26" y="26" width="3" height="3" fill="#C9AE73" />
    </svg>
  );
}

// wordmark ตัวพิมพ์เล็กแบบเทมเพลต + จุดทองแทนเครื่องหมาย ®
export function Logo({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-start text-[22px] leading-none font-semibold tracking-[-0.06em] ${dark ? "text-white" : "text-ink"} ${className}`}>
      strata
      <span className="ml-0.5 size-1.5 rounded-full bg-brand" aria-hidden />
    </span>
  );
}
