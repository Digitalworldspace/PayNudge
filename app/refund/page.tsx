import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata = { title: "Refund policy – PayNudge" };

export default function Refund() {
  return (
    <div className="wrap">
      <header className="top"><a href="/" className="brand">Pay<span>Nudge</span></a></header>
      <article className="prose">
        <h1>Refund policy</h1>
        <p className="muted">Last updated: October 2026</p>
        <p>Every account starts with a 14-day free trial that needs no card, so you can try PayNudge fully before paying anything.</p>
        <h2>Cancelling</h2>
        <p>You can cancel your subscription at any time from the Billing page in the app. You won&apos;t be charged again, and you keep access until the end of the period you already paid for.</p>
        <h2>Refunds</h2>
        <p>If you were charged by mistake or PayNudge didn&apos;t work for you, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> within 14 days of the charge and we will refund that payment in full. Refunds are issued to the original payment method by Dodo Payments, our payment provider, and usually appear within 5–10 business days.</p>
      </article>
    </div>
  );
}
