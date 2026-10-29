import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface SubscriptionEventData {
  subscription_id?: string;
  status?: string;
  next_billing_date?: string | null;
  cancel_at_next_billing_date?: boolean;
  metadata?: Record<string, string> | null;
  customer?: { customer_id?: string; email?: string } | null;
}

// Dodo Payments calls this whenever a subscription starts, renews, fails or ends.
export async function POST(request: Request) {
  const raw = await request.text();
  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
  };

  let event: { type?: string; data?: SubscriptionEventData };
  try {
    event = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_KEY!).verify(raw, headers) as typeof event;
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (!event.type?.startsWith("subscription.") || !event.data?.subscription_id) {
    return NextResponse.json({ received: true });
  }

  const d = event.data;
  const db = createAdminClient();

  // Find the PayNudge user: by the id we put on the checkout, else by the subscription id, else by email.
  let userId: string | null = d.metadata?.user_id ?? null;
  if (!userId) {
    const { data } = await db.from("subscriptions").select("user_id").eq("dodo_subscription_id", d.subscription_id).maybeSingle();
    userId = data?.user_id ?? null;
  }
  if (!userId && d.customer?.email) {
    const { data } = await db.from("profiles").select("id").ilike("email", d.customer.email).maybeSingle();
    userId = data?.id ?? null;
  }
  if (!userId) {
    console.error("webhook: no matching user", d.subscription_id, d.customer?.email);
    return NextResponse.json({ received: true, matched: false });
  }

  const statusFromType: Record<string, string> = {
    "subscription.active": "active",
    "subscription.renewed": "active",
    "subscription.on_hold": "on_hold",
    "subscription.failed": "failed",
    "subscription.cancelled": "cancelled",
    "subscription.expired": "expired",
  };
  const status = d.status || statusFromType[event.type] || "pending";

  const { error } = await db.from("subscriptions").upsert(
    {
      user_id: userId,
      dodo_subscription_id: d.subscription_id,
      dodo_customer_id: d.customer?.customer_id ?? null,
      status,
      next_billing_date: d.next_billing_date ?? null,
      cancel_at_period_end: Boolean(d.cancel_at_next_billing_date),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.error("webhook: save failed", error);
    return NextResponse.json({ error: "save failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
