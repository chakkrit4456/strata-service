import nodemailer from "nodemailer";

export async function notifyOwner(subject: string, body: string) {
  const jobs: Promise<unknown>[] = [];
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SMTP_HOST, NOTIFY_EMAIL } = process.env;

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    jobs.push(
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: `${subject}\n\n${body}` }),
      }),
    );
  }
  if (SMTP_HOST && NOTIFY_EMAIL) {
    const t = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    jobs.push(t.sendMail({ from: process.env.SMTP_USER, to: NOTIFY_EMAIL, subject, text: body }));
  }
  const results = await Promise.allSettled(jobs);
  for (const r of results) if (r.status === "rejected") console.error("notify failed", r.reason);
}
