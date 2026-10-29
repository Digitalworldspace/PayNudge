import DodoPayments from "dodopayments";

export function dodo() {
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode";
  return new DodoPayments({ bearerToken: process.env.DODO_PAYMENTS_API_KEY!, environment: env });
}

/** The site's address: NEXT_PUBLIC_SITE_URL if set, otherwise the address the request came in on. */
export function siteUrl(request?: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (request) return new URL(request.url).origin;
  return "http://localhost:3000";
}
