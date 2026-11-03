import { OPERATOR_LINE, SUPPORT_EMAIL } from "@/lib/site";

export const metadata = { title: "Contact – PayNudge" };

export default function Contact() {
  return (
    <div className="wrap">
      <header className="top"><a href="/" className="brand">Pay<span>Nudge</span></a></header>
      <article className="prose">
        <h1>Contact</h1>
        <p>Questions, billing help, or feedback: email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We reply within 1–2 business days.</p>
        <p>{OPERATOR_LINE}, based in India.</p>
        <p className="muted">Received a reminder email sent with PayNudge? It came from the business named in the email, and replying to it reaches them directly. PayNudge is a reminder tool, not a collection agency, and has no information about your invoice.</p>
      </article>
    </div>
  );
}
