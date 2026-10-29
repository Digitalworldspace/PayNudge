import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { accessState, hasAccess, type ProfileRow, type SubscriptionRow } from "@/lib/access";
import { autoStageToSend, balance, buildEmail, daysLate, type Stage } from "@/lib/reminders";
import { isEmail, sendReminder } from "@/lib/mailer";

export const runtime = "nodejs";
export const maxDuration = 60;

// Runs once a day (see vercel.json). Sends the reminder each unpaid invoice is due for.
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();
  const { data: profiles, error } = await db.from("profiles").select("*").eq("auto_send", true);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const today = new Date();
  let sent = 0;
  const failures: string[] = [];

  for (const profile of (profiles ?? []) as ProfileRow[]) {
    const { data: sub } = await db.from("subscriptions").select("*").eq("user_id", profile.id).maybeSingle();
    if (!hasAccess(accessState(profile, sub as SubscriptionRow | null, today))) continue;

    const { data: invoices } = await db
      .from("invoices")
      .select("*")
      .eq("user_id", profile.id)
      .eq("paid", false)
      .eq("auto_remind", true);

    for (const inv of invoices ?? []) {
      if (!isEmail(inv.client_email) || balance(inv) <= 0) continue;

      const { data: log } = await db.from("reminders_sent").select("stage").eq("invoice_id", inv.id);
      const stage = autoStageToSend(daysLate(inv.due_date, today), (log ?? []).map((r) => r.stage as Stage));
      if (!stage) continue;

      const email = buildEmail(inv, stage, profile, today);
      const res = await sendReminder({
        to: inv.client_email,
        replyTo: profile.email,
        senderName: profile.business_name || profile.full_name,
        subject: email.subject,
        body: email.body,
      });
      if (!res.ok) {
        failures.push(`${inv.id}: ${res.error}`);
        continue;
      }
      await db.from("reminders_sent").insert({ invoice_id: inv.id, user_id: profile.id, stage, automatic: true });
      sent++;
    }
  }

  return NextResponse.json({ sent, failures });
}
