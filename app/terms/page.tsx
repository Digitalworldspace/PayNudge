import { COMPANY_NAME, OPERATOR_LINE, SUPPORT_EMAIL } from "@/lib/site";
import { providerName } from "@/lib/billing";

export const metadata = { title: "Terms – PayNudge" };

// Starter terms. Have them reviewed by a lawyer as you grow.
export default function Terms() {
  return (
    <div className="wrap">
      <header className="top"><a href="/" className="brand">Pay<span>Nudge</span></a></header>
      <article className="prose">
        <h1>Terms of service</h1>
        <p className="muted">Last updated: October 2026</p>
        <p>These terms cover your use of {OPERATOR_LINE} (&ldquo;PayNudge&rdquo;, &ldquo;we&rdquo;). By using PayNudge you agree to them.</p>

        <h2>The service</h2>
        <p>PayNudge is software that helps you track invoices and email payment reminders to your own clients, in your name. PayNudge is a reminder tool. It is not a collection agency, does not collect money on your behalf, and is not a party to any agreement between you and your clients.</p>

        <h2>Your responsibilities</h2>
        <ul>
          <li>You may only send reminders for genuine, unpaid invoices for work or goods you actually provided.</li>
          <li>You are responsible for the accuracy of every amount, date and email address you enter, and for the content of every reminder you send or allow PayNudge to send automatically.</li>
          <li>PayNudge is intended for invoices to businesses. If you invoice individual consumers, you are responsible for following the consumer debt-collection laws that apply where they live.</li>
          <li>You must stop sending reminders to a client who disputes an invoice or asks you to stop, until the matter is resolved.</li>
        </ul>

        <h2>Acceptable use</h2>
        <p>Do not use PayNudge for marketing, spam, threats, harassment, false or misleading claims, or to pretend that a collection agency, lawyer or government body is involved. We may suspend accounts that misuse email sending, and we may stop any reminder that appears to break these terms.</p>

        <h2>Free trial and billing</h2>
        <p>New accounts get a 14-day free trial without a card. After that, PayNudge is a monthly subscription billed by {providerName()}, our reseller and merchant of record. You can cancel any time from the Billing page; access continues until the end of the paid period. See our <a href="/refund">refund policy</a>.</p>

        <h2>No guarantee of payment</h2>
        <p>Reminders often help, but we can&apos;t guarantee that any client will pay. PayNudge is provided &ldquo;as is&rdquo;. To the extent the law allows, our total liability is limited to the amount you paid us in the three months before the claim, and you agree to cover any claims made against us that arise from reminders you sent or your breach of these terms.</p>

        <h2>Contact</h2>
        <p>{COMPANY_NAME}, <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
      </article>
    </div>
  );
}
