"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { ProfileRow } from "@/lib/access";
import {
  STAGE_LABEL,
  STAGE_ORDER,
  balance,
  buildEmail,
  daysLate,
  money,
  prettyDate,
  suggestedStage,
  type Stage,
} from "@/lib/reminders";
import { addInvoice, deleteInvoice, saveSettings, sendNow, updateInvoice, type ActionResult } from "./actions";

export interface InvoiceRow {
  id: string;
  client_name: string;
  contact_name: string;
  client_email: string;
  invoice_number: string;
  amount: number;
  deposit: number;
  due_date: string;
  paid: boolean;
  auto_remind: boolean;
}

export interface SentRow {
  invoice_id: string;
  stage: Stage;
  automatic: boolean;
  sent_at: string;
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function chip(inv: InvoiceRow) {
  if (inv.paid) return { cls: "c-paid", txt: "Paid" };
  const d = daysLate(inv.due_date);
  if (d < 0) return { cls: "c-soon", txt: `Due in ${-d}d` };
  if (d === 0) return { cls: "c-soon", txt: "Due today" };
  if (d < 15) return { cls: "c-late", txt: `${d}d late` };
  return { cls: "c-very", txt: `${d}d late` };
}

export default function Dashboard({
  profile,
  invoices,
  sent,
  canSend,
}: {
  profile: ProfileRow;
  invoices: InvoiceRow[];
  sent: SentRow[];
  canSend: boolean;
}) {
  const [showPaid, setShowPaid] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const open = invoices.filter((i) => !i.paid);
  const late = open.filter((i) => daysLate(i.due_date) > 0);
  const outstanding = open.reduce((a, i) => a + balance(i), 0);
  const overdue = late.reduce((a, i) => a + balance(i), 0);
  const oldest = late.length ? Math.max(...late.map((i) => daysLate(i.due_date))) : null;

  const rows = useMemo(
    () =>
      invoices
        .filter((i) => showPaid || !i.paid)
        .sort((a, b) => Number(a.paid) - Number(b.paid) || daysLate(b.due_date) - daysLate(a.due_date)),
    [invoices, showPaid],
  );

  useEffect(() => {
    if (selected && !invoices.some((i) => i.id === selected)) setSelected(null);
  }, [invoices, selected]);

  const run = (fn: () => Promise<ActionResult>, after?: () => void) =>
    start(async () => {
      const r = await fn();
      setToast(r.ok ? (r.message ? { ok: true, text: r.message } : null) : { ok: false, text: r.error });
      if (r.ok && after) after();
    });

  const current = invoices.find((i) => i.id === selected) || null;

  return (
    <>
      <section className="stats" aria-label="Summary">
        <div className="stat"><span className="label">Outstanding</span><span className="v">{money(outstanding)}</span></div>
        <div className="stat alert"><span className="label">Overdue</span><span className="v">{money(overdue)}</span></div>
        <div className="stat"><span className="label">Invoices late</span><span className="v">{late.length}</span></div>
        <div className="stat"><span className="label">Oldest late</span><span className="v">{oldest === null ? "—" : `${oldest} days`}</span></div>
      </section>

      {toast && (
        <div className={`toastbar ${toast.ok ? "t-ok" : "t-bad"}`} role="status">
          <span>{toast.text}</span>
          <button className="ghost" onClick={() => setToast(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      <div className="main">
        <section className="panel" aria-labelledby="hInv">
          <div className="row">
            <h2 id="hInv">Invoices</h2>
            <label className="label inline">
              <input id="showPaid" type="checkbox" checked={showPaid} onChange={(e) => setShowPaid(e.target.checked)} /> Show paid
            </label>
          </div>

          <div className="list">
            {rows.length === 0 && (
              <div className="empty">No unpaid invoices yet. Add your first one below, with the client's email, and PayNudge will follow up for you.</div>
            )}
            {rows.map((inv) => {
              const s = chip(inv);
              const last = sent.find((r) => r.invoice_id === inv.id);
              return (
                <button
                  key={inv.id}
                  type="button"
                  className="inv"
                  aria-pressed={selected === inv.id}
                  onClick={() => setSelected(inv.id)}
                >
                  <div className="who">{inv.client_name}</div>
                  <div className="amt mono">{money(balance(inv))}</div>
                  <div className="meta">
                    {inv.invoice_number} · due {prettyDate(inv.due_date)}
                    {Number(inv.deposit) > 0 && ` · ${money(inv.deposit)} deposit`}
                    {last && ` · last reminder: ${STAGE_LABEL[last.stage]}`}
                  </div>
                  <span className={`chip ${s.cls}`}>{s.txt}</span>
                </button>
              );
            })}
          </div>

          <AddInvoice disabled={!canSend || pending} onAdd={(v) => run(() => addInvoice(v))} />
          <Settings profile={profile} busy={pending} onSave={(v) => run(() => saveSettings(v))} />
        </section>

        <section className="panel" aria-labelledby="hMsg">
          <h2 id="hMsg">Reminder</h2>
          {current ? (
            <Composer
              key={current.id}
              inv={current}
              profile={profile}
              history={sent.filter((r) => r.invoice_id === current.id)}
              canSend={canSend}
              busy={pending}
              onSend={(stage, subject, body) => run(() => sendNow(current.id, stage, subject, body))}
              onPaid={() => run(() => updateInvoice(current.id, { paid: !current.paid }))}
              onAuto={(v) => run(() => updateInvoice(current.id, { auto_remind: v }))}
              onEmail={(v) => run(() => updateInvoice(current.id, { client_email: v }))}
              onDelete={() => run(() => deleteInvoice(current.id), () => setSelected(null))}
            />
          ) : (
            <div className="empty">Pick an invoice to see or send its reminder. The tone is chosen for you based on how late it is.</div>
          )}
        </section>
      </div>
    </>
  );
}

function AddInvoice({ disabled, onAdd }: { disabled: boolean; onAdd: (v: Parameters<typeof addInvoice>[0]) => void }) {
  const blank = { client_name: "", contact_name: "", client_email: "", invoice_number: "", amount: "", deposit: "", due_date: todayIso() };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <details>
      <summary>Add an invoice</summary>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd({ ...f, amount: parseFloat(f.amount) || 0, deposit: parseFloat(f.deposit) || 0 });
          setF(blank);
        }}
      >
        <div className="field"><label className="label" htmlFor="fClient">Client</label><input id="fClient" required value={f.client_name} onChange={set("client_name")} placeholder="Maple Dental" /></div>
        <div className="field"><label className="label" htmlFor="fContact">Contact name</label><input id="fContact" value={f.contact_name} onChange={set("contact_name")} placeholder="Dr. Patel" /></div>
        <div className="field"><label className="label" htmlFor="fEmail">Client email</label><input id="fEmail" type="email" value={f.client_email} onChange={set("client_email")} placeholder="billing@mapledental.com" /></div>
        <div className="field"><label className="label" htmlFor="fNum">Invoice #</label><input id="fNum" required value={f.invoice_number} onChange={set("invoice_number")} placeholder="INV-1042" /></div>
        <div className="field"><label className="label" htmlFor="fAmt">Amount (USD)</label><input id="fAmt" type="number" min="0" step="0.01" required value={f.amount} onChange={set("amount")} placeholder="850" /></div>
        <div className="field"><label className="label" htmlFor="fDep">Deposit received</label><input id="fDep" type="number" min="0" step="0.01" value={f.deposit} onChange={set("deposit")} placeholder="0" /></div>
        <div className="field"><label className="label" htmlFor="fDue">Due date</label><input id="fDue" type="date" required value={f.due_date} onChange={set("due_date")} /></div>
        <div className="field end"><button className="primary" type="submit" disabled={disabled}>Add invoice</button></div>
      </form>
    </details>
  );
}

function Settings({
  profile,
  busy,
  onSave,
}: {
  profile: ProfileRow;
  busy: boolean;
  onSave: (v: { full_name: string; business_name: string; payment_link: string; auto_send: boolean }) => void;
}) {
  const [f, setF] = useState({
    full_name: profile.full_name,
    business_name: profile.business_name,
    payment_link: profile.payment_link,
    auto_send: profile.auto_send,
  });
  return (
    <details open={!profile.full_name}>
      <summary>Your details and automatic reminders</summary>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(f);
        }}
      >
        <div className="field"><label className="label" htmlFor="bName">Your name</label><input id="bName" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} placeholder="Alex Morgan" /></div>
        <div className="field"><label className="label" htmlFor="bBiz">Business</label><input id="bBiz" value={f.business_name} onChange={(e) => setF({ ...f, business_name: e.target.value })} placeholder="Morgan Web Studio" /></div>
        <div className="field wide"><label className="label" htmlFor="bLink">Payment link</label><input id="bLink" value={f.payment_link} onChange={(e) => setF({ ...f, payment_link: e.target.value })} placeholder="https://paypal.me/yourname" /></div>
        <label className="toggle wide" htmlFor="bAuto">
          <input id="bAuto" type="checkbox" checked={f.auto_send} onChange={(e) => setF({ ...f, auto_send: e.target.checked })} />
          <span>
            <b>Send reminders automatically.</b> Once a day, PayNudge emails clients 3 days before the due date, then 1, 10 and 30 days late. Replies come straight to your inbox.
          </span>
        </label>
        <div className="field end"><button className="primary" type="submit" disabled={busy}>Save</button></div>
      </form>
    </details>
  );
}

function Composer({
  inv,
  profile,
  history,
  canSend,
  busy,
  onSend,
  onPaid,
  onAuto,
  onEmail,
  onDelete,
}: {
  inv: InvoiceRow;
  profile: ProfileRow;
  history: SentRow[];
  canSend: boolean;
  busy: boolean;
  onSend: (stage: Stage, subject: string, body: string) => void;
  onPaid: () => void;
  onAuto: (v: boolean) => void;
  onEmail: (v: string) => void;
  onDelete: () => void;
}) {
  const late = daysLate(inv.due_date);
  const suggested = suggestedStage(late);
  const [stage, setStage] = useState<Stage>(suggested);
  const draft = buildEmail(inv, stage, profile);
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [email, setEmail] = useState(inv.client_email);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState("");

  const pick = (s: Stage) => {
    setStage(s);
    const d = buildEmail(inv, s, profile);
    setSubject(d.subject);
    setBody(d.body);
  };

  const copy = async () => {
    const text = `Subject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied("Copied. Paste it into your email.");
    } catch {
      setCopied("Select the message and press Ctrl+C to copy.");
    }
  };

  return (
    <div className="composer">
      <div className="tones" role="group" aria-label="Tone">
        {STAGE_ORDER.map((s) => (
          <button key={s} type="button" aria-pressed={s === stage} onClick={() => pick(s)}>
            {STAGE_LABEL[s]}
          </button>
        ))}
      </div>
      <p className="hint">
        Suggested for {late > 0 ? `${late} days late` : "not yet due"}: <b>{STAGE_LABEL[suggested]}</b>
        {history.length > 0 && <> · Sent so far: {history.map((h) => STAGE_LABEL[h.stage]).join(", ")}</>}
      </p>

      <div className="field">
        <label className="label" htmlFor="mTo">To</label>
        <div className="inline-row">
          <input id="mTo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" />
          {email !== inv.client_email && (
            <button type="button" onClick={() => onEmail(email)} disabled={busy}>Save email</button>
          )}
        </div>
      </div>
      <div className="field"><label className="label" htmlFor="mSub">Subject</label><input id="mSub" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
      <div className="field"><label className="label" htmlFor="mBody">Message</label><textarea id="mBody" rows={13} value={body} onChange={(e) => setBody(e.target.value)} /></div>

      <div className="row">
        <div className="btns">
          <button
            className="primary"
            type="button"
            disabled={!canSend || busy || !inv.client_email || email !== inv.client_email}
            onClick={() => onSend(stage, subject, body)}
            title={!inv.client_email ? "Add and save the client's email first" : undefined}
          >
            {busy ? "Sending…" : "Send now"}
          </button>
          <button type="button" onClick={copy}>Copy</button>
          <button type="button" onClick={onPaid} disabled={busy}>{inv.paid ? "Mark unpaid" : "Mark as paid"}</button>
        </div>
        {confirmDelete ? (
          <span className="btns">
            <button type="button" className="danger" onClick={onDelete} disabled={busy}>Delete invoice</button>
            <button type="button" className="ghost" onClick={() => setConfirmDelete(false)}>Keep</button>
          </span>
        ) : (
          <button type="button" className="ghost" onClick={() => setConfirmDelete(true)}>Delete</button>
        )}
      </div>
      {copied && <p className="hint">{copied}</p>}

      <label className="toggle" htmlFor="mAuto">
        <input id="mAuto" type="checkbox" checked={inv.auto_remind} onChange={(e) => onAuto(e.target.checked)} disabled={busy} />
        <span>Include this invoice in automatic reminders{profile.auto_send ? "" : " (automatic reminders are off in your settings)"}</span>
      </label>
    </div>
  );
}
