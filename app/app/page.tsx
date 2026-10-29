import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { accessState, PRICE_LABEL, type ProfileRow, type SubscriptionRow } from "@/lib/access";
import Dashboard, { type InvoiceRow, type SentRow } from "./Dashboard";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

export default async function AppPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: sub }, { data: invoices }, { data: sent }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("invoices").select("*").order("due_date", { ascending: true }),
    supabase.from("reminders_sent").select("invoice_id, stage, automatic, sent_at").order("sent_at", { ascending: false }),
  ]);

  const state = accessState(profile as ProfileRow | null, sub as SubscriptionRow | null);

  let banner: { tone: "info" | "warn" | "bad"; text: string; action?: "subscribe" | "billing" } | null = null;
  if (params.checkout === "done" && state.kind !== "subscribed")
    banner = { tone: "info", text: "Thanks! Your payment is being confirmed. Refresh in a minute if this message stays." };
  else if (params.checkout === "error") banner = { tone: "bad", text: "Checkout couldn't start. Try again in a moment." };
  else if (state.kind === "trial")
    banner = { tone: "info", text: `Free trial: ${state.daysLeft} day${state.daysLeft === 1 ? "" : "s"} left.`, action: "subscribe" };
  else if (state.kind === "payment_problem")
    banner = { tone: "warn", text: "Your last payment didn't go through, so automatic reminders are paused. Update your card to resume.", action: "billing" };
  else if (state.kind === "expired")
    banner = { tone: "bad", text: "Your free trial has ended. Your invoices are safe, and you can subscribe to keep sending reminders.", action: "subscribe" };

  return (
    <div className="wrap">
      <header className="top">
        <a href="/app" className="brand">
          Pay<span>Nudge</span>
        </a>
        <div className="top-actions">
          <span className="muted small">{user.email}</span>
          {state.kind === "subscribed" && (
            <form action="/api/portal" method="post">
              <button className="ghost" type="submit">Billing</button>
            </form>
          )}
          <form action={signOut}>
            <button className="ghost" type="submit">Sign out</button>
          </form>
        </div>
      </header>

      {banner && (
        <div className={`banner b-${banner.tone}`} role="status">
          <span>{banner.text}</span>
          {banner.action === "subscribe" && (
            <form action="/api/checkout" method="post">
              <button className="primary" type="submit">Subscribe for {PRICE_LABEL}</button>
            </form>
          )}
          {banner.action === "billing" && (
            <form action="/api/portal" method="post">
              <button className="primary" type="submit">Update card</button>
            </form>
          )}
        </div>
      )}

      <Dashboard
        profile={profile as ProfileRow}
        invoices={(invoices ?? []) as InvoiceRow[]}
        sent={(sent ?? []) as SentRow[]}
        canSend={state.kind === "subscribed" || state.kind === "trial"}
      />
    </div>
  );
}
