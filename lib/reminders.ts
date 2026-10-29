// Pure reminder logic: no database or network. Tested in tests/reminders.test.ts.

export type Stage = "upcoming" | "friendly" | "firm" | "final";

export const STAGE_LABEL: Record<Stage, string> = {
  upcoming: "Before due",
  friendly: "Friendly",
  firm: "Firm",
  final: "Final notice",
};

export const STAGE_ORDER: Stage[] = ["upcoming", "friendly", "firm", "final"];

export interface InvoiceLike {
  invoice_number: string;
  contact_name: string;
  amount: number;
  deposit: number;
  due_date: string; // YYYY-MM-DD
}

export interface SenderLike {
  full_name: string;
  business_name: string;
  payment_link: string;
}

const DAY = 86_400_000;

/** Midnight UTC for a YYYY-MM-DD string or a Date. */
function utcDay(d: string | Date): number {
  if (typeof d === "string") {
    const [y, m, day] = d.split("-").map(Number);
    return Date.UTC(y, m - 1, day);
  }
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function isoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Positive = days late, 0 = due today, negative = days until due. */
export function daysLate(dueDate: string, today: Date = new Date()): number {
  return Math.round((utcDay(today) - utcDay(dueDate)) / DAY);
}

export function balance(inv: Pick<InvoiceLike, "amount" | "deposit">): number {
  return Math.max(0, Number(inv.amount) - Number(inv.deposit || 0));
}

/** The tone that fits how late an invoice is. Always returns a stage (for the manual composer). */
export function suggestedStage(late: number): Stage {
  if (late <= 0) return "upcoming";
  if (late < 10) return "friendly";
  if (late < 30) return "firm";
  return "final";
}

/**
 * The stage the automatic job should send today, or null for "send nothing".
 * Windows: 3 to 1 days before due, then 1, 10 and 30+ days late.
 * Each stage is sent at most once, and never after a later stage went out.
 */
export function autoStageToSend(late: number, alreadySent: Stage[]): Stage | null {
  let stage: Stage | null = null;
  if (late >= -3 && late <= -1) stage = "upcoming";
  else if (late >= 1 && late < 10) stage = "friendly";
  else if (late >= 10 && late < 30) stage = "firm";
  else if (late >= 30) stage = "final";
  if (!stage) return null;
  if (alreadySent.includes(stage)) return null;
  const idx = STAGE_ORDER.indexOf(stage);
  if (alreadySent.some((s) => STAGE_ORDER.indexOf(s) > idx)) return null;
  return stage;
}

export function money(n: number): string {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function buildEmail(
  inv: InvoiceLike,
  stage: Stage,
  me: SenderLike,
  today: Date = new Date(),
): { subject: string; body: string } {
  const hi = inv.contact_name?.trim() || "there";
  const name = me.full_name?.trim() || "[Your name]";
  const biz = me.business_name?.trim() || "";
  const link = me.payment_link?.trim() || "[payment link]";
  const owed = balance(inv);
  const amt = money(owed);
  const depositNote =
    Number(inv.deposit) > 0
      ? ` (${money(inv.amount)} total, less the ${money(inv.deposit)} deposit already received)`
      : "";
  const due = prettyDate(inv.due_date);
  const late = daysLate(inv.due_date, today);
  const inDays = (n: number) => prettyDate(isoDay(utcDay(today) + n * DAY));
  const sign = `\n\nThanks,\n${name}${biz ? "\n" + biz : ""}`;
  const num = inv.invoice_number;

  switch (stage) {
    case "upcoming":
      return {
        subject: `Upcoming: invoice ${num} due ${due}`,
        body: `Hi ${hi},\n\nJust a quick heads-up that invoice ${num} for ${amt}${depositNote} is due on ${due}.\n\nYou can pay here: ${link}\n\nLet me know if you need anything from me before then.${sign}`,
      };
    case "friendly":
      return {
        subject: `Friendly reminder: invoice ${num}`,
        body: `Hi ${hi},\n\nI hope things are going well. I wanted to check in on invoice ${num} for ${amt}${depositNote}, which was due on ${due}. It may have slipped through the cracks, so here is the payment link again:\n\n${link}\n\nIf it's already on its way, please ignore this note.${sign}`,
      };
    case "firm":
      return {
        subject: `Invoice ${num} is ${late} days past due`,
        body: `Hi ${hi},\n\nInvoice ${num} for ${amt}${depositNote} is now ${late} days past its due date of ${due}, and I haven't received payment yet.\n\nPlease pay by ${inDays(7)} using this link:\n${link}\n\nIf there's a problem with the invoice or you need a payment plan, reply and let me know so we can sort it out.${sign}`,
      };
    case "final":
      return {
        subject: `Final notice: invoice ${num} (${late} days overdue)`,
        body: `Hi ${hi},\n\nThis is a final notice for invoice ${num} for ${amt}${depositNote}, originally due on ${due}. It is now ${late} days overdue, and my earlier reminders have not received a response.\n\nPlease pay the full balance by ${inDays(5)}:\n${link}\n\nIf payment isn't received by then, I'll have to pause any ongoing work and consider next steps for collection. I'd much rather resolve this directly, so please reply if something is holding this up.${sign}`,
      };
  }
}
