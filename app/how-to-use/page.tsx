import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata = {
  title: "How to use PayNudge",
  description: "Set up PayNudge in five minutes and let it follow up on your unpaid invoices.",
};

const schedule = [
  { when: "3 days before due", tone: "Before due", what: "A friendly heads-up with your payment link." },
  { when: "1 day late", tone: "Friendly", what: "A polite nudge in case it slipped through the cracks." },
  { when: "10 days late", tone: "Firm", what: "A clear pay-by date and an offer to talk about a payment plan." },
  { when: "30 days late", tone: "Final reminder", what: "Your last reminder, and a note that work is paused until it's settled." },
];

const faqs = [
  {
    q: "Will my client know the email is from me?",
    a: "Yes. The email shows your business name as the sender, starts with “This is a payment reminder from [your business]”, and is signed with your name. When your client replies, the reply goes straight to your inbox.",
  },
  {
    q: "What if my client has already paid?",
    a: "Every reminder asks them to reply if they've already paid. Open the invoice and click Mark as paid, and PayNudge stops all reminders for it.",
  },
  {
    q: "Can I stop reminders for one client?",
    a: "Yes. Open the invoice and untick “Include this invoice in automatic reminders”. You can still send a reminder by hand with Send now.",
  },
  {
    q: "Is each reminder sent more than once?",
    a: "No. Each step of the schedule goes out once per invoice. If you already sent a firmer reminder by hand, PayNudge never goes back to a softer one.",
  },
  {
    q: "I took a deposit. What does the reminder ask for?",
    a: "Only the remaining balance. The email shows the total and the deposit you received, so there's no confusion.",
  },
  {
    q: "What happens when my free trial ends?",
    a: "Nothing is charged automatically, because the trial needs no card. Your invoices stay safe but are read-only, and automatic reminders pause, until you subscribe for $9/month.",
  },
  {
    q: "How do I cancel?",
    a: "Click Billing at the top of your dashboard and cancel there. You keep access until the end of the month you paid for.",
  },
];

export default function HowToUse() {
  return (
    <div className="wrap">
      <header className="top">
        <a href="/" className="brand">Pay<span>Nudge</span></a>
        <div className="top-actions">
          <a href="/app">Open dashboard</a>
        </div>
      </header>

      <article className="prose guide">
        <h1>How to use PayNudge</h1>
        <p className="lead">Set it up once in about five minutes. After that, PayNudge follows up on every unpaid invoice for you until you mark it paid.</p>

        <ol className="steps">
          <li>
            <h2>Sign in with your email</h2>
            <p>Go to <a href="/login">Sign in</a>, enter your work email and click <b>Email me a sign-in code</b>. Type the code from the email (check spam if it&apos;s not there in a minute). There&apos;s no password, and your 14-day free trial starts now.</p>
          </li>
          <li>
            <h2>Add your details</h2>
            <p>On the dashboard, open <b>Your details and automatic reminders</b> and fill in:</p>
            <ul>
              <li><b>Your name</b>: used to sign every reminder.</li>
              <li><b>Business</b>: shown as the sender, so clients recognize you.</li>
              <li><b>Payment link</b>: where clients pay you, such as a PayPal.me, Stripe or bank payment page.</li>
            </ul>
            <p>Tick <b>Send reminders automatically</b> and click <b>Save</b>.</p>
          </li>
          <li>
            <h2>Add an unpaid invoice</h2>
            <p>Open <b>Add an invoice</b> and enter the client, the contact person&apos;s first name, the <b>client&apos;s email</b>, the invoice number, the amount, any deposit you already received, and the due date. Click <b>Add invoice</b>.</p>
            <p className="muted">Without the client&apos;s email, PayNudge can&apos;t send reminders for that invoice.</p>
          </li>
          <li>
            <h2>Check the reminder (optional)</h2>
            <p>Click the invoice in your list. The reminder on the right already has the right tone for how late it is. You can switch tone, edit the subject or message, and click <b>Send now</b> to send it right away, or <b>Copy</b> to send it from your own email.</p>
          </li>
          <li>
            <h2>Let PayNudge follow up</h2>
            <p>Once a day, PayNudge checks your unpaid invoices and sends the reminder each one is due for:</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>When</th><th>Tone</th><th>What the client gets</th></tr>
                </thead>
                <tbody>
                  {schedule.map((s) => (
                    <tr key={s.when}><td className="mono">{s.when}</td><td>{s.tone}</td><td>{s.what}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </li>
          <li>
            <h2>Mark it paid</h2>
            <p>When the money arrives, open the invoice and click <b>Mark as paid</b>. Reminders stop, and the invoice moves out of your unpaid list. Tick <b>Show paid</b> to see it again.</p>
          </li>
        </ol>

        <h2>Questions</h2>
        <div className="faq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <p>Still stuck? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and we&apos;ll help.</p>
      </article>
    </div>
  );
}
