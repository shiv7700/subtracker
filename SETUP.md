# SubTracker — Setup Checklist

The code is done. These are the **external** steps only you can do (creating
accounts, pasting keys, deploying). Do them in order.

> Reminder: this is a **single-user, login-only** app. There is **no signup
> page** by design — you create your one user by hand in Supabase.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> → **New project**.
2. Pick a name, a strong DB password, and a region close to you.
3. Wait for it to finish provisioning (~2 min).

## 2. Create the database table (run the migration)

Migrations live in [`supabase/migrations/`](./supabase/migrations) as timestamped
SQL files. Apply them **by hand in the Supabase SQL editor**:

1. Open **SQL Editor → New query** in your Supabase project.
2. Apply **each** file in [`supabase/migrations/`](./supabase/migrations) in
   **filename order (oldest first)** — paste its contents and **Run**. Currently:
   - `20260606200615_create_subscriptions.sql` (table + RLS)
   - `20260607101951_add_reminder_days_before.sql` (per-sub reminder lead time)
3. You should see "Success". Verify the `subscriptions` table under **Table Editor**.

> **Convention going forward:** every schema change is a **new** timestamped file in
> `supabase/migrations/` (e.g. `YYYYMMDDHHmmss_what_changed.sql`). Apply them in
> filename order (oldest → newest) by pasting each into the SQL editor. The SQL is
> written to be safely re-runnable.

## 3. Create your single user (and turn off public signups)

1. Go to **Authentication → Users → Add user → Create new user**.
   - Enter your email + a password. Tick "Auto Confirm User" so you can log in
     immediately.
2. Go to **Authentication → Providers / Sign In → Email** (or
   **Authentication → Settings**) and **disable "Allow new users to sign up"**.
   This keeps the public URL locked to just you.

## 4. Fill in environment variables

1. In the repo root: `cp .env.example .env.local`
2. From Supabase **Project Settings → API**, copy into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` ← Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ← `anon` `public` key
   - `SUPABASE_SERVICE_ROLE_KEY` ← `service_role` `secret` key (keep private!)

## 5. Set a CRON secret

1. Generate a strong random string: `openssl rand -hex 32`
2. Put it in `.env.local` as `CRON_SECRET=...`. This protects the reminder
   endpoint so only Vercel Cron (which sends this secret) can trigger it.

## 6. Run locally and log in

```bash
npm run dev
```

Open <http://localhost:3000>, log in with the user you created in step 3. Add a
subscription with a `next_billing_date` 1–2 days away. You can test reminders
locally by hitting the cron endpoint with your secret:

```bash
curl http://localhost:3000/api/check-reminders \
  -H "Authorization: Bearer $CRON_SECRET"
```

Due reminders will print to the **terminal running `npm run dev`** (console
stub). That's expected in v0.

## 7. Deploy to Vercel

1. Push the repo to GitHub and import it at <https://vercel.com>.
2. In **Project Settings → Environment Variables**, add the **same** vars from
   `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, and `CRON_SECRET`.
3. Deploy. Vercel reads [`vercel.json`](./vercel.json) and registers the cron,
   which calls `/api/check-reminders` **daily at 03:30 UTC ≈ 09:00 IST** and
   passes your `CRON_SECRET` automatically.

That's it — the core loop (warn before a charge) is live.

---

## 8. Phase 5 (later) — switch reminders to WhatsApp

Until now reminders only print to the server logs. To get them on WhatsApp:

1. In **Meta for Developers** (<https://developers.facebook.com>), create an app
   with the **WhatsApp** product. Use the free test number to start.
2. Create and get **approved** a message **template** with a body of a single
   variable, e.g. body text `{{1}}` (or `SubTracker reminder: {{1}}`).
3. From **WhatsApp → API Setup**, collect the access token and the **Phone
   Number ID**, and add your own number as a recipient.
4. Fill the `WHATSAPP_*` vars in `.env.local` (and in Vercel):
   `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TO` (your number,
   digits only), `WHATSAPP_TEMPLATE` (the approved template name).
5. In [`lib/notifier.ts`](./lib/notifier.ts), inside `notify()`, comment out the
   `console.log(message)` line and uncomment `await sendWhatsApp(message);`
   (the "PHASE 5 SWAP" note marks the exact spot).
6. Redeploy. The next daily cron run will message you on WhatsApp.
