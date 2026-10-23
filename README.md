# Strata — ระบบรับงานผ่าน AI

เว็บของ strata software studio ให้ลูกค้าจาก Fastwork / Facebook / ช่องทางอื่น "คุยกันก่อน" กับ AI (Gemini ฟรี + Groq สำรอง)
จนได้ Requirement ครบ + ข้อมูลติดต่อ — AI ไม่เสนอราคา เจ้าของติดต่อกลับพร้อมใบเสนอราคาเอง

- รายละเอียดโปรเจกต์: [Strata-Brief.md](Strata-Brief.md)
- ติดตั้งบนเซิร์ฟเวอร์: [deploy/README.md](deploy/README.md)

## พัฒนาในเครื่อง
```bash
cp .env.example .env   # ใส่ DATABASE_URL และ API key (หรือ AI_MOCK=1 เพื่อทดสอบโดยไม่ใช้ key)
npm install
npm run db:migrate
npm run dev
```
หน้าลูกค้า `/` · แชท `/c/<token>` · หลังบ้าน `/admin`
