import { type Requirement, completeness, requirementFields } from "@/lib/requirement";

export function RequirementPanel({ requirement, footer, updating }: { requirement: Requirement; footer?: React.ReactNode; updating?: boolean }) {
  const fields = requirementFields(requirement);
  const pct = completeness(requirement);
  const filled = fields.filter((f) => f.value).length;
  return (
    <aside className="flex min-h-0 flex-col bg-white">
      <div className="flex flex-col gap-3.5 border-b border-[#EEEBE4] px-7 pt-6 pb-5">
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold">Requirement ร่าง</span>
          <span className="font-mono text-[13px] font-medium">{pct}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-sm bg-[#EEEBE4]">
          <div className="h-1 bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-muted">
          {updating ? "กำลังอัปเดต…" : "อัปเดตอัตโนมัติระหว่างคุย"} · {filled}/{fields.length} หัวข้อ
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-7 py-2">
        {requirement.title && (
          <div className="border-b border-[#F1EEE8] py-3.5">
            <span className="text-xs text-muted">โปรเจกต์</span>
            <div className="text-sm font-semibold">{requirement.title}</div>
          </div>
        )}
        {fields.map((f) => (
          <div key={f.label} className="flex gap-3 border-b border-[#F1EEE8] py-3.5">
            {f.value ? (
              <span className="mt-0.5 flex size-4 flex-none items-center justify-center rounded-[3px] bg-ink text-[11px] text-gold">✓</span>
            ) : (
              <span className="mt-0.5 size-4 flex-none rounded-[3px] border-[1.5px] border-dashed border-[#C4C0B6]" />
            )}
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-xs text-muted">{f.label}</span>
              {f.value ? (
                <span className="text-sm leading-normal break-words">{f.value}</span>
              ) : (
                <span className="text-sm text-[#A9A59C]">รอข้อมูลจากแชท</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {footer && <div className="flex gap-2.5 border-t border-[#EEEBE4] px-7 py-5">{footer}</div>}
    </aside>
  );
}
