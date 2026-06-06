# SubTracker 📲

A personal, single-user subscription tracker. Its **core feature** is reminding
you **before** a subscription charges — not just keeping a pretty list.

> The real pain isn't "I have no list." It's: *"I don't find out before the
> money leaves."* So the heart of this app is the **warn-before-charge**
> reminder; everything else (list, monthly total) is supporting cast.

## What it does

- **Login only** — deployed on a public URL, so it's password-protected. There
  is **no public signup**; the single user is created by hand in the Supabase
  dashboard.
- **Add / list subscriptions** — name, amount, cycle (monthly/yearly), next
  billing date.
- **Monthly total** — sums everything into a single "₹X/month" headline (yearly
  costs are divided by 12).
- **Reminders** — a daily cron checks for charges due in the next few days and
  dispatches a reminder. v0 logs to the server console; Phase 5 swaps in
  WhatsApp via the Meta Cloud API (the notifier is pluggable).

## Tech stack

- **Next.js 15** (App Router) + **TypeScript** (strict)
- **React Query** for client data fetching
- **Supabase** — Postgres + Auth (with Row Level Security)
- **Vercel** for hosting + **Vercel Cron** for the daily reminder check
- Pluggable notifier (`lib/notifier.ts`): console stub → Meta WhatsApp Cloud API

## Run it locally

External setup (Supabase project, your user, env vars, deploy) is documented
step by step in **[SETUP.md](./SETUP.md)**. The short version once that's done:

```bash
cp .env.example .env.local   # then fill in the values (see SETUP.md)
npm run dev                  # http://localhost:3000
```

## More docs

- **[idea.md](./idea.md)** — the original idea / scope / why.
- **[PROGRESS.md](./PROGRESS.md)** — living build status and phase plan.
- **[SETUP.md](./SETUP.md)** — external setup checklist.
