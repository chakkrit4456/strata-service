import bcrypt from "bcryptjs";

const pw = process.argv[2];
if (!pw) {
  console.error('usage: npm run hash-password -- "your-password"');
  process.exit(1);
}
// Next.js ขยาย $ ใน .env เป็นตัวแปร จึงต้อง escape เป็น \$
console.log(`ADMIN_PASSWORD_HASH=${bcrypt.hashSync(pw, 12).replaceAll("$", "\\$")}`);
