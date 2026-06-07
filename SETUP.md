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

## 8. Phase 5 — switch reminders to WhatsApp

Reminders **auto-route**: set the `WHATSAPP_*` env vars and `notify()` sends
WhatsApp; leave them blank and it logs to the console. **No code change needed.**

1. **Meta for Developers** (<https://developers.facebook.com>) → create an app
   (Business) → add the **WhatsApp** product. You get a free **test number**.
2. In **WhatsApp → API Setup**: add your own number under **recipients** and
   verify it (the test number can message ~5 verified numbers). Copy the
   **temporary access token** and the **Phone number ID** shown there.
   - (For a token that won't expire in 24h, later create a System User token.)
3. Create a **message template** (**WhatsApp Manager → Templates**), category
   **Utility**, language **English (US)**, body = exactly one variable: `{{1}}`
   (or `SubTracker reminder: {{1}}`). Submit — utility templates usually approve
   within minutes.
4. Set these env vars in **`.env.local`** and on **Vercel** (Project Settings →
   Environment Variables):
   - `WHATSAPP_TOKEN` — the access token
   - `WHATSAPP_PHONE_NUMBER_ID` — the Phone number ID (NOT the phone number)
   - `WHATSAPP_TO` — your number, international digits only (e.g. `9198XXXXXXXX`)
   - `WHATSAPP_TEMPLATE` — the approved template name
   - `WHATSAPP_TEMPLATE_LANG` — `en_US` (match the template's language)
5. Redeploy. The next daily cron messages you on WhatsApp. To test immediately,
   make sure a subscription's days-until-charge equals its "remind X days before"
   (e.g. reminder = "On the day" + date = today), then hit the endpoint:
   ```bash
   curl https://<your-app>.vercel.app/api/check-reminders \
     -H "Authorization: Bearer $CRON_SECRET"
   ```
