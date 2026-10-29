import DodoPayments from "dodopayments";

export function dodo() {
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode";
  return new DodoPayments({ bearerToken: process.env.DODO_PAYMENTS_API_KEY!, environment: env });
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
