"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { accessState, hasAccess, type ProfileRow, type SubscriptionRow } from "@/lib/access";
import { STAGE_ORDER, type Stage } from "@/lib/reminders";
import { isEmail, sendReminder } from "@/lib/mailer";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

async function requireAccess() {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { data: sub }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
  ]);
  const ok = hasAccess(accessState(profile as ProfileRow | null, sub as SubscriptionRow | null));
  return { supabase, user, profile: profile as ProfileRow, ok };
}

const NOPE: ActionResult = { ok: false, error: "Your free trial has ended. Subscribe to keep adding and sending reminders." };

export async function addInvoice(input: {
  client_name: string;
  contact_name: string;
  client_email: string;
  invoice_number: string;
  amount: number;
  deposit: number;
  due_date: string;
}): Promise<ActionResult> {
  const { supabase, ok } = await requireAccess();
  if (!ok) return NOPE;
  const client_name = input.client_name.trim();
  const invoice_number = input.invoice_number.trim();
  const client_email = input.client_email.trim();
  if (!client_name || !invoice_number) return { ok: false, error: "Add a client name and an invoice number." };
  if (!(input.amount >= 0)) return { ok: false, error: "Enter the invoice amount as a number." };
  if (input.deposit > input.amount) return { ok: false, error: "The deposit can't be larger than the invoice amount." };
  if (client_email && !isEmail(client_email)) return { ok: false, error: "That client email doesn't look right. Check for typos." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.due_date)) return { ok: false, error: "Pick a due date." };

  const { error } = await supabase.from("invoices").insert({
    client_name,
    contact_name: input.contact_name.trim(),
    client_email,
    invoice_number,
    amount: input.amount,
    deposit: input.deposit || 0,
    due_date: input.due_date,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  return { ok: true, message: "Invoice added." };
}

export async function updateInvoice(
  id: string,
  patch: Partial<{ paid: boolean; auto_remind: boolean; deposit: number; client_email: string }>,
): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const clean: Record<string, unknown> = {};
  if (typeof patch.paid === "boolean") {
    clean.paid = patch.paid;
    clean.paid_at = patch.paid ? new Date().toISOString() : null;
  }
  if (typeof patch.auto_remind === "boolean") clean.auto_remind = patch.auto_remind;
  if (typeof patch.deposit === "number" && patch.deposit >= 0) clean.deposit = patch.deposit;
  if (typeof patch.client_email === "string") {
    const e = patch.client_email.trim();
    if (e && !isEmail(e)) return { ok: false, error: "That client email doesn't look right." };
    clean.client_email = e;
  }
  const { error } = await supabase.from("invoices").update(clean).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  return { ok: true };
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  return { ok: true };
}

export async function saveSettings(input: {
  full_name: string;
  business_name: string;
  payment_link: string;
  auto_send: boolean;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const link = input.payment_link.trim();
  if (link && !/^https?:\/\//i.test(link)) return { ok: false, error: "The payment link should start with https://" };
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name.trim(),
      business_name: input.business_name.trim(),
      payment_link: link,
      auto_send: input.auto_send,
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  return { ok: true, message: "Settings saved." };
}

/** Sends the reminder the user reviewed in the composer, right now. */
export async function sendNow(invoiceId: string, stage: Stage, subject: string, body: string): Promise<ActionResult> {
  const { supabase, user, profile, ok } = await requireAccess();
  if (!ok) return NOPE;
  if (!STAGE_ORDER.includes(stage)) return { ok: false, error: "Unknown reminder type." };
  const { data: inv } = await supabase.from("invoices").select("*").eq("id", invoiceId).single();
  if (!inv) return { ok: false, error: "Invoice not found." };
  if (!isEmail(inv.client_email)) return { ok: false, error: "Add the client's email to this invoice first." };
  if (!subject.trim() || !body.trim()) return { ok: false, error: "The subject and message can't be empty." };

  const res = await sendReminder({
    to: inv.client_email,
    replyTo: profile.email || user.email!,
    senderName: profile.business_name || profile.full_name,
    subject: subject.slice(0, 200),
    body: body.slice(0, 5000),
  });
  if (!res.ok) return { ok: false, error: res.error };

  await createAdminClient()
    .from("reminders_sent")
    .insert({ invoice_id: inv.id, user_id: user.id, stage, automatic: false });
  revalidatePath("/app");
  return { ok: true, message: `Sent to ${inv.client_email}.` };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
