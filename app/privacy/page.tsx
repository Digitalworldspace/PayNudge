export const metadata = { title: "Privacy – PayNudge" };

// Starter policy. Have it reviewed before you grow; replace [Your name] and [contact email].
export default function Privacy() {
  return (
    <div className="wrap">
      <header className="top"><a href="/" className="brand">Pay<span>Nudge</span></a></header>
      <article className="prose">
        <h1>Privacy policy</h1>
        <p className="muted">Last updated: October 2026</p>
        <p>PayNudge is operated by [Your name] (&ldquo;we&rdquo;). This page explains what we collect and why.</p>
        <h2>What we collect</h2>
        <ul>
          <li>Your account email, name, business name and payment link.</li>
          <li>The invoices you add: client name, contact name, client email, invoice number, amounts and dates.</li>
          <li>A log of reminders sent for each invoice.</li>
          <li>Subscription status from our payment processor. We never see or store your card details.</li>
        </ul>
        <h2>How we use it</h2>
        <p>Only to run PayNudge: to show your invoices and to email the reminders you ask for. We do not sell your data or your clients&apos; data, and we do not use client emails for anything except the reminders you set up.</p>
        <h2>Service providers</h2>
        <p>We use Supabase (database and sign-in), Vercel (hosting), Resend (sending email) and Dodo Payments (billing). They process data on our behalf under their own security and privacy terms.</p>
        <h2>Your choices</h2>
        <p>You can edit or delete any invoice at any time. To delete your account and all its data, email [contact email] and we will do it within 30 days.</p>
        <h2>Contact</h2>
        <p>[contact email]</p>
      </article>
    </div>
  );
}
