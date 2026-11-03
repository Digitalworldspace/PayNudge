// Business details shown on the legal pages. Set NEXT_PUBLIC_COMPANY_NAME and
// NEXT_PUBLIC_SUPPORT_EMAIL in Vercel; no personal name appears anywhere on the site.
export const COMPANY_NAME =
  process.env.NEXT_PUBLIC_COMPANY_NAME || process.env.NEXT_PUBLIC_OWNER_NAME || "PayNudge";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "[contact email]";

/** "PayNudge is a product of X" when a company is set, otherwise just "PayNudge". */
export const OPERATOR_LINE =
  COMPANY_NAME === "PayNudge" ? "PayNudge" : `PayNudge, a product of ${COMPANY_NAME}`;
