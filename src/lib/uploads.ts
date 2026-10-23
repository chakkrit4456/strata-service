import path from "node:path";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./uploads");
export const MAX_UPLOAD = 10 * 1024 * 1024;

// ชนิดไฟล์ที่รับ — เอกสาร รูป วิดีโอสั้น และไฟล์โปรเจกต์
export const ALLOWED_EXT = new Set([
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".ppt", ".pptx", ".txt", ".md",
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg",
  ".mp4", ".mov", ".mp3", ".wav",
  ".zip", ".rar", ".7z", ".json", ".sql", ".aep", ".prproj",
]);
