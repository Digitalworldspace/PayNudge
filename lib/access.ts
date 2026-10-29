export interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  business_name: string;
  payment_link: string;
  auto_send: boolean;
  trial_ends_at: string;
}

export interface SubscriptionRow {
  user_id: string;
  dodo_subscription_id: string | null;
  dodo_customer_id: string | null;
  status: string;
  next_billing_date: string | null;
  cancel_at_period_end: boolean;
}

export type AccessState =
  | { kind: "subscribed"; sub: SubscriptionRow }
  | { kind: "trial"; daysLeft: number }
  | { kind: "payment_problem"; sub: SubscriptionRow }
  | { kind: "expired" };

export function accessState(profile: ProfileRow | null, sub: SubscriptionRow | null, now = new Date()): AccessState {
  if (sub && sub.status === "active") return { kind: "subscribed", sub };
  if (sub && (sub.status === "on_hold" || sub.status === "failed")) return { kind: "payment_problem", sub };
  if (profile) {
    const ms = new Date(profile.trial_ends_at).getTime() - now.getTime();
    if (ms > 0) return { kind: "trial", daysLeft: Math.ceil(ms / 86_400_000) };
  }
  return { kind: "expired" };
}

export function hasAccess(s: AccessState): boolean {
  return s.kind === "subscribed" || s.kind === "trial";
}

export const PRICE_LABEL = process.env.NEXT_PUBLIC_PRICE_LABEL || "$9/month";
