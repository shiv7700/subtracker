-- Migration: create subscriptions table with per-user RLS.
-- Applied via `supabase db push` (or paste into the Supabase SQL editor).
-- Each authenticated user can only touch their own rows.

create table if not exists public.subscriptions (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users (id) on delete cascade,
  name              text        not null,
  amount            numeric     not null check (amount > 0),
  cycle             text        not null check (cycle in ('monthly', 'yearly')),
  next_billing_date date        not null,
  created_at        timestamptz not null default now()
);

-- Speeds up the per-user, soonest-first listing.
create index if not exists subscriptions_user_next_billing_idx
  on public.subscriptions (user_id, next_billing_date);

-- Lock the table down: no access unless a policy allows it.
alter table public.subscriptions enable row level security;

-- Per-user policies: a row is visible/mutable only when it belongs to the
-- currently authenticated user (auth.uid()).

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
  on public.subscriptions
  for select
  using (user_id = auth.uid());

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own"
  on public.subscriptions
  for insert
  with check (user_id = auth.uid());

drop policy if exists "subscriptions_update_own" on public.subscriptions;
create policy "subscriptions_update_own"
  on public.subscriptions
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "subscriptions_delete_own" on public.subscriptions;
create policy "subscriptions_delete_own"
  on public.subscriptions
  for delete
  using (user_id = auth.uid());
