import { PRICE_LABEL } from "@/lib/access";

const steps = [
  { when: "3 days before", text: "A friendly heads-up with your payment link." },
  { when: "1 day late", text: "A polite nudge: “It may have slipped through the cracks.”" },
  { when: "10 days late", text: "A firmer note with a pay-by date and an offer to talk." },
  { when: "30 days late", text: "A final notice before you pause work." },
];

export default function Home() {
  return (
    <div className="wrap">
      <header className="top">
        <a href="/" className="brand">Pay<span>Nudge</span></a>
        <a href="/login">Sign in</a>
      </header>

      <section className="hero">
        <div style={{ display: "grid", gap: 16 }}>
          <h1>Get paid without chasing clients.</h1>
          <p>
            PayNudge sends your clients polite, then firmer, payment reminders on a schedule, from your name with replies
            going straight to your inbox. You stop writing awkward follow-ups, and late invoices stop slipping.
          </p>
          <div className="cta">
            <a className="btn" href="/login">Start 14-day free trial</a>
            <span className="muted small">No card needed to try it.</span>
          </div>
        </div>
        <div className="ladder" aria-label="Reminder schedule">
          {steps.map((s) => (
            <div className="rung" key={s.when}>
              <span className="when">{s.when}</span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cols">
        <div>
          <h2>Set it once</h2>
          <p className="muted">Add an invoice with the client&apos;s email and due date. PayNudge handles the follow-ups until you mark it paid.</p>
        </div>
        <div>
          <h2>Deposits included</h2>
          <p className="muted">Took a deposit? Reminders ask only for the remaining balance and say so clearly.</p>
        </div>
        <div>
          <h2>You stay in control</h2>
          <p className="muted">Preview any reminder, edit it, send it now, or turn off automatic reminders for a single client.</p>
        </div>
      </section>

      <section id="pricing" className="price">
        <span className="label">Pricing</span>
        <span className="amt">{PRICE_LABEL}</span>
        <ul>
          <li>Unlimited invoices and reminders</li>
          <li>Automatic daily reminder schedule</li>
          <li>Cancel any time from your billing page</li>
        </ul>
        <a className="btn" href="/login">Start free trial</a>
      </section>

      <footer>
        <span>© {new Date().getFullYear()} PayNudge</span>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </footer>
    </div>
  );
}
