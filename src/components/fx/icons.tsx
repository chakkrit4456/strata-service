// ไอคอนเส้นบาง ต่อหมวดบริการ (key ตาม CATEGORIES)
const P: Record<string, React.ReactNode> = {
  software: (<><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 8h18M8 21h8M12 18v3" /></>),
  ai: (<><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M10 10h4v4h-4zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>),
  code: (<><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></>),
  it: (<><rect x="3" y="3" width="18" height="7" rx="1.5" /><rect x="3" y="14" width="18" height="7" rx="1.5" /><path d="M7 6.5h.01M7 17.5h.01" /></>),
  document: (<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>),
  powerpoint: (<><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M12 16v4M8 20h8M7 12l3-3 2 2 4-4" /></>),
  excel: (<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" /></>),
  video: (<><rect x="2" y="5" width="15" height="14" rx="2" /><path d="m17 10 5-3v10l-5-3z" /></>),
  other: (<><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01" /></>),
};

export function CategoryIcon({ name, className = "size-5" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {P[name] ?? P.other}
    </svg>
  );
}
