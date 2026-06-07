-- Migration: per-subscription reminder lead time.
-- How many days before next_billing_date to send the WhatsApp alert (fires once).
-- Bounded 0..30; existing rows default to 3.

alter table public.subscriptions
  add column if not exists reminder_days_before integer not null default 3
  check (reminder_days_before >= 0 and reminder_days_before <= 30);
