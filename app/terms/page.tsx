import { COMPANY_NAME, OPERATOR_LINE, SUPPORT_EMAIL } from "@/lib/site";
import { providerName } from "@/lib/billing";

export const metadata = { title: "Terms – PayNudge" };

// Starter terms written to limit legal risk. Have a lawyer review them before you grow.
export default function Terms() {
  return (
    <div className="wrap">
      <header className="top"><a href="/" className="brand">Pay<span>Nudge</span></a></header>
      <article className="prose">
        <h1>Terms of service</h1>
        <p className="muted">Last updated: 3 November 2026</p>
        <p>These terms are an agreement between you and {OPERATOR_LINE} (&ldquo;PayNudge&rdquo;, &ldquo;we&rdquo;). You accept them when you sign in. If you don&apos;t agree, don&apos;t use PayNudge.</p>

        <h2>1. Who can use PayNudge</h2>
        <p>You must be at least 18 and use PayNudge only for your business, not for personal or household purposes. If you use it for a company, you confirm you&apos;re allowed to accept these terms for that company.</p>

        <h2>2. What PayNudge is, and isn&apos;t</h2>
        <p>PayNudge is software that helps you track invoices and email payment reminders to your own clients, in your name. PayNudge is not a collection agency, a law firm or a lender. We don&apos;t collect money for you, give legal or financial advice, or take part in any agreement between you and your clients. You are the sender of every reminder and you alone are responsible for it.</p>

        <h2>3. Business invoices only</h2>
        <p>You may use PayNudge only for genuine, unpaid invoices owed to you by businesses for work or goods you actually provided. You must not use it for debts owed by individuals for personal, family or household purposes, for debts you bought from someone else, or for amounts that are disputed, already paid, or not legally owed.</p>

        <h2>4. Your responsibilities</h2>
        <ul>
          <li>Every amount, date, name and email address you enter is accurate, and you have the right to email the people you send reminders to.</li>
          <li>You review the reminder wording and are responsible for every reminder you send or allow PayNudge to send automatically.</li>
          <li>You stop reminders to a client who disputes an invoice, pays it, or asks you to stop, until the matter is resolved.</li>
          <li>You follow the laws that apply to you and your clients, including laws on debt collection, email and privacy.</li>
        </ul>

        <h2>5. What you must not do</h2>
        <p>Don&apos;t use PayNudge to send marketing or spam, threats, harassment, false or misleading statements, or anything that suggests a collection agency, lawyer, court or government body is involved when it isn&apos;t. Don&apos;t try to get around sending limits or security, or use someone else&apos;s account. We may limit, pause or stop any reminder, and suspend or close any account, that we believe breaks these terms or the law, with or without notice.</p>

        <h2>6. Sending limits</h2>
        <p>To protect recipients, PayNudge sends at most one reminder per invoice in any 24 hours, limits how many reminders an account can send each day, and never sends reminders for invoices marked as paid.</p>

        <h2>7. Free trial, billing and refunds</h2>
        <p>New accounts get a 14-day free trial without a card. After that, PayNudge is a monthly subscription billed by {providerName()}, our reseller and merchant of record, whose own terms also apply to your payment. You can cancel any time from the Billing page; access continues until the end of the paid period. See our <a href="/refund">refund policy</a>. We may change prices with at least 30 days&apos; notice by email.</p>

        <h2>8. No guarantees</h2>
        <p>PayNudge is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without any warranty, to the extent the law allows. We don&apos;t promise that any client will pay, that every email will be delivered or not marked as spam, or that the service will always be available or error-free.</p>

        <h2>9. Limit of our liability</h2>
        <p>To the extent the law allows, we are not liable for any indirect or consequential loss, lost profits, lost payments or lost data, and our total liability for any claim is limited to the amount you paid us in the three months before the claim arose.</p>

        <h2>10. Your responsibility for claims</h2>
        <p>You agree to defend and cover us against any claim, loss or cost (including reasonable legal fees) that arises from the reminders you send, the information you enter, your relationship with your clients, or your breach of these terms or the law.</p>

        <h2>11. Ending your use</h2>
        <p>You can stop using PayNudge and ask us to delete your account at any time. We may end or suspend your access if you break these terms. Sections 2, 3, 8, 9, 10 and 12 continue after your use ends.</p>

        <h2>12. Governing law and disputes</h2>
        <p>These terms are governed by the laws of India. Before starting any legal claim, you agree to email us and give us 30 days to try to resolve it. Any dispute will be handled only by the courts of Gujarat, India.</p>

        <h2>13. Changes</h2>
        <p>We may update these terms. If a change is significant, we&apos;ll tell you by email or in the app before it takes effect. Continuing to use PayNudge after that means you accept the new terms.</p>

        <h2>Contact</h2>
        <p>{COMPANY_NAME}, <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
      </article>
    </div>
  );
}
