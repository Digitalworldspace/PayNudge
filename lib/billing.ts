import { createPolar } from "@polar-sh/sdk/2026-10";
import { dodo } from "@/lib/dodo";

/**
 * Which payment provider runs checkout and billing.
 * PAYMENT_PROVIDER=polar or dodo picks one; if it's not set, Polar is used once
 * POLAR_ACCESS_TOKEN exists, otherwise Dodo.
 */
export type Provider = "polar" | "dodo";

export function provider(): Provider {
  const p = (process.env.PAYMENT_PROVIDER || "").toLowerCase();
  if (p === "polar" || p === "dodo") return p;
  return process.env.POLAR_ACCESS_TOKEN ? "polar" : "dodo";
}

export function providerName(): string {
  return provider() === "polar" ? "Polar" : "Dodo Payments";
}

export function polar() {
  return createPolar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    environment: process.env.POLAR_ENVIRONMENT === "sandbox" ? "sandbox" : "production",
  });
}

/** Starts a subscription checkout and returns the page to send the customer to. */
export async function createCheckoutUrl(opts: {
  userId: string;
  email: string;
  name: string;
  returnUrl: string;
}): Promise<string> {
  if (provider() === "polar") {
    const checkout = await polar().checkouts.create({
      products: [process.env.POLAR_PRODUCT_ID!],
      customer_email: opts.email,
      // Ties the Polar customer to this PayNudge account, so webhooks and the billing page find it.
      external_customer_id: opts.userId,
      success_url: opts.returnUrl,
      metadata: { user_id: opts.userId },
    });
    if (!checkout.url) throw new Error("Polar returned a checkout without a URL");
    return checkout.url;
  }
  const session = await dodo().checkoutSessions.create({
    product_cart: [{ product_id: process.env.DODO_PRODUCT_ID!, quantity: 1 }],
    customer: { email: opts.email, name: opts.name },
    return_url: opts.returnUrl,
    metadata: { user_id: opts.userId },
  });
  return session.checkout_url;
}

/** Returns the provider's billing page (change card, cancel, receipts) for this customer. */
export async function createPortalUrl(opts: { userId: string; providerCustomerId: string | null }): Promise<string | null> {
  if (provider() === "polar") {
    const session = await polar().customerSessions.create({ external_customer_id: opts.userId });
    return session.customer_portal_url;
  }
  if (!opts.providerCustomerId) return null;
  const portal = await dodo().customers.customerPortal.create(opts.providerCustomerId);
  return portal.link;
}

export { mapPolarStatus } from "@/lib/billing-status";
