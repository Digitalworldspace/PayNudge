# PayNudge

Automatic, escalating invoice reminders for freelancers and small businesses.

Stack: Next.js 15 (Vercel) · Supabase (auth + Postgres with row-level security) · Resend (email) · Dodo Payments (subscriptions, merchant of record).

## Setup
1. Supabase: create a project, run `supabase/schema.sql` in the SQL Editor. Auth > URL Configuration: set Site URL to your site and add `https://YOUR-SITE/auth/callback` to Redirect URLs.
2. Resend: verify a sending domain, create an API key.
3. Dodo Payments: create a monthly subscription product, an API key, and a webhook pointing to `https://YOUR-SITE/api/webhooks/dodo` (subscription events).
4. Vercel: import the repo, add every variable from `.env.example`, deploy. `vercel.json` runs `/api/cron/reminders` daily at 14:00 UTC (morning in the US).

## Reminder schedule
3–1 days before due (upcoming) · 1 day late (friendly) · 10 days (firm) · 30 days (final). Each stage is sent once per invoice; logic is in `lib/reminders.ts`, tests in `tests/` (`npm test`).

## Notes
- Users get a 14-day trial without a card (`profiles.trial_ends_at`); after that, sending needs an active subscription.
- Subscriptions are written only by the signed webhook (users can read but not edit them).
- Vercel's free Hobby plan is for non-commercial use; move to Pro before charging customers, or host elsewhere.
