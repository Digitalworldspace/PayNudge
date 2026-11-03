import { NextResponse } from "next/server";
import { webhooks } from "@polar-sh/sdk/2026-10";
import { createAdminClient } from "@/lib/supabase/server";
import { mapPolarStatus } from "@/lib/billing";

export const runtime = "nodejs";

// Polar calls this whenever a subscription starts, renews, fails, is cancelled or ends.
// The subscriptions table's dodo_* columns hold the provider's ids for either provider.
export async function POST(request: Request) {
  const raw = await request.text();
  let event;
  try {
    event = await webhooks.validateEvent(
      raw,
      {
        "webhook-id": request.headers.get("webhook-id") ?? "",
        "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
        "webhook-signature": request.headers.get("webhook-signature") ?? "",
      },
      process.env.POLAR_WEBHOOK_SECRET!,
    );
  } catch (e) {
    if (e instanceof webhooks.PolarWebhookVerificationError) {
      return NextResponse.json({ error: "invalid signature" }, { status: 403 });
    }
    // A valid but unsupported event type: acknowledge so Polar doesn't retry it.
    return NextResponse.json({ received: true, ignored: true });
  }

  if (!event.type.startsWith("subscription.")) return NextResponse.json({ received: true });

  const d = (event as unknown as { data: unknown }).data as {
    id: string;
    status: string;
    customer_id: string;
    customer?: { external_id?: string | null; email?: string | null } | null;
    current_period_end?: string | Date | null;
    cancel_at_period_end?: boolean | null;
    metadata?: Record<string, unknown> | null;
  };

  const db = createAdminClient();

  // Find the PayNudge user: external customer id, then checkout metadata, then a stored subscription, then email.
  let userId: string | null = d.customer?.external_id || (typeof d.metadata?.user_id === "string" ? d.metadata.user_id : null);
  if (!userId) {
    const { data } = await db.from("subscriptions").select("user_id").eq("dodo_subscription_id", d.id).maybeSingle();
    userId = data?.user_id ?? null;
  }
  if (!userId && d.customer?.email) {
    const { data } = await db.from("profiles").select("id").ilike("email", d.customer.email).maybeSingle();
    userId = data?.id ?? null;
  }
  if (!userId) {
    console.error("polar webhook: no matching user", d.id, d.customer?.email);
    return NextResponse.json({ received: true, matched: false });
  }

  const status = event.type === "subscription.revoked" ? "cancelled" : mapPolarStatus(d.status);
  const periodEnd = d.current_period_end ? new Date(d.current_period_end).toISOString() : null;

  const { error } = await db.from("subscriptions").upsert(
    {
      user_id: userId,
      dodo_subscription_id: d.id,
      dodo_customer_id: d.customer_id,
      status,
      next_billing_date: periodEnd,
      cancel_at_period_end: Boolean(d.cancel_at_period_end),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.error("polar webhook: save failed", error);
    return NextResponse.json({ error: "save failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
