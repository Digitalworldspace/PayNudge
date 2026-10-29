-- PayNudge database. Paste this whole file into Supabase > SQL Editor and click Run.

-- ---------- Profiles (one per user) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null default '',
  full_name text not null default '',
  business_name text not null default '',
  payment_link text not null default '',
  auto_send boolean not null default false,
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

-- ---------- Subscriptions (written only by the payment webhook) ----------
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users on delete cascade,
  dodo_subscription_id text unique,
  dodo_customer_id text,
  status text not null default 'pending',
  next_billing_date timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------- Invoices ----------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  client_name text not null,
  contact_name text not null default '',
  client_email text not null default '',
  invoice_number text not null,
  amount numeric(12,2) not null check (amount >= 0),
  deposit numeric(12,2) not null default 0 check (deposit >= 0),
  due_date date not null,
  paid boolean not null default false,
  paid_at timestamptz,
  auto_remind boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists invoices_user_idx on public.invoices (user_id);

-- ---------- Reminder log ----------
create table if not exists public.reminders_sent (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  stage text not null,
  automatic boolean not null default false,
  sent_at timestamptz not null default now()
);
create index if not exists reminders_invoice_idx on public.reminders_sent (invoice_id);

-- ---------- Security: every user sees only their own rows ----------
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.reminders_sent enable row level security;

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select using (id = auth.uid());
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Users may edit only these profile columns (not their trial date).
revoke update on public.profiles from authenticated, anon;
grant update (full_name, business_name, payment_link, auto_send) on public.profiles to authenticated;

drop policy if exists "own subscription read" on public.subscriptions;
create policy "own subscription read" on public.subscriptions for select using (user_id = auth.uid());

drop policy if exists "own invoices" on public.invoices;
create policy "own invoices" on public.invoices for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own reminders read" on public.reminders_sent;
create policy "own reminders read" on public.reminders_sent for select using (user_id = auth.uid());

-- ---------- Create a profile automatically when someone signs up ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
