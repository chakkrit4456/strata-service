import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono, IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const thai = IBM_Plex_Sans_Thai({ subsets: ["thai", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-thai" });
const geist = Geist({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-geist" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono-plex" });

export const metadata: Metadata = {
  title: "Strata — คุยกันก่อน แล้วค่อยเริ่มงาน",
  description:
    "strata software studio รับงาน Software ครบวงจร: เว็บไซต์ ระบบตามสั่ง Bot & AI Automation แก้ไขโค้ด งาน IT เอกสาร PowerPoint Excel วิดีโอ — เล่าโปรเจกต์ให้ AI ฟัง แล้วรับใบเสนอราคา",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${thai.variable} ${geist.variable} ${mono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
