export const STATUS_LABEL: Record<string, string> = {
  new: "ใหม่",
  chatting: "กำลังคุย",
  summarized: "สรุปแล้ว",
  quoted: "เสนอราคา",
  closed: "ปิดงาน",
};

export const SOURCE_LABEL: Record<string, string> = {
  fastwork: "Fastwork",
  facebook: "Facebook",
  google: "Google",
  line: "LINE",
  tiktok: "TikTok",
  instagram: "Instagram",
  direct: "เว็บไซต์ตรง",
  other: "อื่นๆ",
};

export function addMonths(d: Date, months: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

// วันที่บทสนทนาจะถูกซ่อนจากหน้าเว็บ (ย้ายเข้าคลัง)
export function expiresAt(c: { lastActivityAt: Date; pinnedUntil: Date | null }, months: number) {
  const byActivity = addMonths(c.lastActivityAt, months);
  return c.pinnedUntil && c.pinnedUntil > byActivity ? c.pinnedUntil : byActivity;
}

export const daysLeft = (d: Date) => Math.ceil((d.getTime() - Date.now()) / 86_400_000);

export const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit", timeZone: "Asia/Bangkok" });

export const fmtDateTime = (d: Date | string) =>
  new Date(d).toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Bangkok",
  });
