import { Resend } from "resend";

export interface OutgoingReminder {
  to: string;
  replyTo: string;
  senderName: string;
  subject: string;
  body: string;
}

/** Sends one reminder as a plain-text email from the PayNudge sending address, with replies going to the user. */
export async function sendReminder(m: OutgoingReminder): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) return { ok: false, error: "Email sending isn't set up yet (missing RESEND_API_KEY or RESEND_FROM)." };
  const resend = new Resend(key);
  const display = (m.senderName || "PayNudge").replace(/["<>]/g, "").slice(0, 60);
  const footer = `\n\n--\nSent on behalf of ${display} with PayNudge. Reply to this email to reach them directly.`;
  const { error } = await resend.emails.send({
    from: `${display} <${from}>`,
    to: [m.to],
    replyTo: m.replyTo,
    subject: m.subject,
    text: m.body + footer,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}
