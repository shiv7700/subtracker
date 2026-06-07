# SubTracker — Progress Tracker 📲

> **Ye file kya hai:** Project ka living status. Har session start me ise padho → context + "abhi kaha pe hai" dono mil jaayega.
> **Source of truth (full idea):** [`idea.md`](./idea.md) — ye file uska short recap + execution status hai.
> **Last updated:** 2026-06-06

---

## 🎯 Context (30-sec recap)

- **Kya:** Personal subscription tracker. **Dil = charge hone se PEHLE WhatsApp reminder.** (Sirf list banana goal NAHI.)
- **Kiske liye:** Sirf user #1 (main). No multi-user, no public signup. **Login haan** (app Vercel public URL pe locked rahe), user **manually Supabase dashboard se** banega.
- **Stack (LOCKED):** Next.js (App Router) + React Query · Next.js API routes · Supabase (Postgres + Auth) · Vercel Cron · `lib/notifier` (stub → Meta Cloud API) · Deploy on Vercel.
- **Cost:** ₹0 (sab free tier).
- **Principle:** Notifier **pluggable** — core (data + dates + cron) channel se independent. v0 me notifier = console stub; last step me Meta Cloud API plug.

**Status legend:** ⬜ Not started · 🟡 In progress · ✅ Done · ⏸️ Parked (v2+) · ⚠️ Blocked

---

## 📍 Current status

- **Active phase:** ✅ **Running locally against real Supabase.** Backend end-to-end verified (2026-06-07).
- **Verified (curl):** `/` → 307 → /login (auth guard) · `/login` → 200 · `/api/check-reminders` bina secret → 401, secret ke saath → 200 `{checked:0,due:[],notified:0}` (table exists, Supabase connected).
- **Next up (TUM):** Browser me `localhost:3000` → login → ek subscription add (date 1–2 din aage) → reminder loop test. Phir Vercel deploy.
- **Pending:** Signup OFF confirm karna · Vercel deploy · Phase 5 WhatsApp swap.

---

## 🗺️ Build plan — step by step (status ke saath)

### Phase 0 — Tracking setup
- [x] ✅ `idea.md` se context nikaala
- [x] ✅ `PROGRESS.md` banaayi (ye file)

---

### Phase 1 — Setup 🏗️
> Goal: Khali Next.js app + Supabase connected + `subscriptions` table + Auth (apna user, signup band).

- [x] ✅ **1.1** Next.js (App Router + TS) app scaffold
- [x] ✅ **1.2** React Query setup — `app/providers.tsx` + `lib/hooks.ts`
- [x] ✅ **1.3** Supabase project + env vars (`.env.local` real keys bhare, verified)
- [x] ✅ **1.4** `lib/db.ts` wrapper (Supabase ke peeche, swappable)
- [x] ✅ **1.5** `subscriptions` schema → `supabase/migrations/` (Supabase SQL editor me paste karke apply — manual, no CLI)
- [x] ✅ **1.6** Auth wire-up code — login page only, no signup (signup OFF karna SETUP.md §3)
- [x] ✅ **1.7** Apna user manually banaya (Supabase → Authentication → Users)
- [x] ✅ **1.8** App protect — `middleware.ts` auth guard (login bina sab locked)

**Phase 1 done jab:** Login karke protected dashboard khule. (Code ✅ — sirf keys + user banana baaki.)

---

### Phase 2 — Core 🧱
> Goal: Subscriptions add/list + monthly total, sab login ke peeche.

- [x] ✅ **2.1** `POST /api/subscriptions` — add + validation (amount>0, cycle, real date)
- [x] ✅ **2.2** `GET /api/subscriptions` — list (sirf logged-in user ka, RLS-scoped)
- [x] ✅ **2.3** Monthly total calc — `lib/total.ts` (yearly ÷ 12)
- [x] ✅ **2.4** FE: add form + list view (React Query)
- [x] ✅ **2.5** FE: monthly total prominently — `components/MonthlyTotal.tsx` (`.total` big)
- [x] ✅ **2.6** Delete subscription — `DELETE /api/subscriptions/[id]` + button

**Phase 2 done jab:** Login karke add/list/delete + total dikhe. ✅ Code done.

---

### Phase 3 — Brain 🧠 (CORE!)
> Goal: Roz check ki agle 2–3 din me kya due hai.

- [x] ✅ **3.1** `GET /api/check-reminders` — agle 3 din me due (date math via `lib/dates.ts`)
- [x] ✅ **3.2** Cron secret — `Authorization: Bearer CRON_SECRET` (secret na ho to 401)
- [x] ✅ **3.3** `vercel.json` cron — roz 03:30 UTC ≈ 09:00 IST
- [ ] ⬜ **3.4** Recurring date roll-over — **NOT done (known gap).** Charge ke baad `next_billing_date` auto aage nahi badhta; v0 me manually update. → Parked.
- [x] ✅ **3.5** Per-sub **reminder lead time** (`reminder_days_before`, dropdown: on-day/1/2/3/5/7) — cron ab `daysUntil === reminder_days_before` pe **exactly once** fire karta (pehle 3-din window roz fire karta tha). Migration `20260607101951_add_reminder_days_before.sql`.

**Phase 3 done jab:** Endpoint call pe due reminders + notifier fire. ✅ (roll-over chhod ke).

---

### Phase 4 — Notifier stub 🔌
> Goal: Reminder pipeline end-to-end chale — bas print karke.

- [x] ✅ **4.1** `lib/notifier.ts` — `notify(reminder)` channel-agnostic
- [x] ✅ **4.2** Console stub (formatted message print)
- [x] ✅ **4.3** `/api/check-reminders` → `notify()` wired (loop test ready)

**Phase 4 done jab:** Endpoint chale → console pe "X charge hone wala hai" print. ✅ Code done (live test SETUP.md §6).

---

### Phase 5 — Last step: real WhatsApp 📲
> Goal: Usi stub ke andar Meta Cloud API plug.

- [ ] ⬜ **5.1** Meta Cloud API setup — test number + app + token → **TUM (SETUP.md §8)**
- [ ] ⬜ **5.2** Approved template → **TUM (SETUP.md §8)**
- [~] 🟡 **5.3** `sendWhatsApp()` code `lib/notifier.ts` me **likha hua ready**; bas "PHASE 5 SWAP" pe `console.log` → `sendWhatsApp` uncomment (TUM)
- [ ] ⬜ **5.4** Apne number pe live test → **TUM**

**Phase 5 done jab:** Charge se 2–3 din pehle WhatsApp pe message aaye. 🎉 (Code ready, external + 1-line swap baaki.)

---

### Phase 8 — Edit subscription ✏️
> User feedback: galat amount/date theek karne ke liye edit chahiye (delete+re-add annoying tha). Bonus: date roll-over bhi manually yahin.

- [x] ✅ **8.1** Shared validation → `lib/validation.ts` (POST + PATCH dono use karte)
- [x] ✅ **8.2** `db.updateSubscription(id, input)` + `PATCH /api/subscriptions/[id]`
- [x] ✅ **8.3** `useUpdateSubscription()` hook
- [x] ✅ **8.4** Modal generalize → `SubscriptionModal` (add + edit, values prefilled incl. date) — purana `AddSubscriptionModal` hata
- [x] ✅ **8.5** Har row pe edit (✏️) button → prefilled modal; "Save changes" + toast
- [x] ✅ **8.6** Playwright se verify (prefill: Custom→name, amount, cycle, date sab sahi), `tsc`+`build` clean

**Phase 8 done jab:** Kisi sub pe ✏️ click → sab fields prefilled → change → save → list update + toast. ✅

---

### Phase 9 — Forms: react-hook-form + zod 🧾
> User feedback: form lib + FE validation chahiye. Zod schema server pe bhi share (single source of truth).

- [x] ✅ **9.1** `lib/schema.ts` — zod schemas: `newSubscriptionSchema` (API), `subscriptionFormSchema` (FE), `loginSchema`
- [x] ✅ **9.2** Server routes (POST/PATCH) ab zod `safeParse` use karte — hand-rolled `lib/validation.ts` hata
- [x] ✅ **9.3** `SubscriptionModal` → react-hook-form + `zodResolver` (register + Controller for DatePicker), inline field errors
- [x] ✅ **9.4** Login form → react-hook-form + zod, inline errors
- [x] ✅ **9.5** Playwright se inline validation verify (empty submit → per-field red errors), `tsc`+`build` clean

**Phase 9 done jab:** Forms RHF se manage ho, zod se validate (FE + server same schema), galat input pe inline error dikhe. ✅

---

### Phase 10 — Loading states ⏳
> User feedback: page load + API calls pe proper loaders.

- [x] ✅ **10.1** `components/ui/skeleton.tsx` (animate-pulse) + `DashboardSkeleton` — initial load pe plain "Loading…" ki jagah layout-matching skeleton
- [x] ✅ **10.2** `GlobalLoadingBar` — top pe slim indeterminate bar jab koi query/mutation chale (`useIsFetching`+`useIsMutating`), `--animate-progress` keyframe
- [x] ✅ **10.3** Mutations (add/edit/delete/login) pe button spinners pehle se the
- [x] ✅ **10.4** Playwright se skeleton verify, `tsc`+`build` clean

**Phase 10 done jab:** Load pe skeleton, API call pe top bar + button spinner. ✅

---

### Phase 11 — Account page 👤
> User chahta tha: apni info dekhe + name/phone edit + created/last-updated dekhe.

- [x] ✅ **11.1** `/account` page — email (read-only), **name + phone editable**, account created + last updated
- [x] ✅ **11.2** Name/phone Supabase Auth **user_metadata** me store (`useUpdateProfile`) — no migration; `useUser` se load
- [x] ✅ **11.3** Dashboard header me 👤 link → `/account`; account pe back arrow → `/dashboard`
- [x] ✅ **11.4** Phone abhi **display-only** (helper note); RHF+zod (`profileSchema`)
- [x] ✅ **11.5** Playwright se layout verify, `tsc` clean

**Phase 11 done jab:** Account pe apni details dikhe, name/phone save ho, dates dikhe. ✅ (Phone reminders me wire karna v2.)

---

### Phase 6 — Deploy 🚀
- [ ] ⬜ **6.1** Vercel pe project connect + env vars
- [ ] ⬜ **6.2** Cron live verify (DB roz touch → Supabase pause na ho)
- [ ] ⬜ **6.3** Public URL pe login test (locked confirm)

---

### Phase 7 — UI Revamp 🎨 (sleek dark)
> Plain CSS hata ke proper Tailwind v4 design system. Decision: dark Linear/Vercel vibe + sonner + Radix.

- [x] ✅ **7.1** Tailwind v4 + postcss + dark theme tokens (`globals.css` se custom CSS hata)
- [x] ✅ **7.2** `lib/cn.ts` (clsx + tailwind-merge) + Inter font
- [x] ✅ **7.3** UI primitives — `components/ui/`: button, input, select, field, card, badge, dialog
- [x] ✅ **7.4** `sonner` toasts (Providers me Toaster) + `@radix-ui/react-dialog` modals
- [x] ✅ **7.5** Add subscription → **modal** (`AddSubscriptionModal`); delete → **confirm modal** (`dialog-confirm`) + toasts
- [x] ✅ **7.6** Screens rebuild — login, dashboard (hero total + color-coded due badges), empty state
- [x] ✅ **7.7** `tsc` + `next build` clean; login page Playwright se visually verified
- [x] ✅ **7.8** Modal glitch fix — centering ab `inset-0 + m-auto` (transform-free), enter/exit `tw-animate-css` se smooth
- [x] ✅ **7.9** Name → **service dropdown** (`Custom…` first; Custom chunne pe hi text field) — `lib/services.ts`
- [x] ✅ **7.10** Date → **shadcn-style calendar** (`react-day-picker` v10 + Radix Popover, dark themed; month+year **dropdowns** for fast nav, range 2025–2038) — native date input hata
- [x] ✅ **7.11** Sab Playwright se verified (temp `/preview` page se — ab hata diya)
- [ ] ⬜ **7.12** Dashboard browser pe final verify — **TUM (login karke)**

**Phase 7 done jab:** Login + dashboard dono sleek dikhe, modal/dropdown/calendar/toasts kaam karein. (Code ✅ + Playwright verified, dashboard tum login karke dekho.)

---

## ⏸️ Parked (v2+ — abhi nahi)
- Public signup + multi-user
- WhatsApp production (paid template, per-message cost)
- "Cancel/pause" mark karna + direct cancel link
- Spend trends / category breakdown
- Multi-currency
- Bank/UPI auto-detect, OCR/statement scan

---

## 📝 Decision log
- **2026-06-06** — Stack LOCKED: Next.js + React Query + Supabase + Vercel + Meta Cloud API.
- **2026-06-06** — Login only, no public signup (user Supabase dashboard se banega).
- **2026-06-06** — Notifier pluggable; v0 stub, real WhatsApp last step me.
- **2026-06-06** — `PROGRESS.md` ko single living tracker banaya (alag context.md nahi, drift se bachne ke liye).
- **2026-06-06** — Recurring `next_billing_date` auto roll-over v0 me NAHI (manual update). Parked — reminder ke saath roll-over baad me.
- **2026-06-07** — UI: plain CSS → **Tailwind v4 + sonner + Radix**, sleek **dark** theme (accent violet `#7c6cff`). Add/delete ab modal-based, feedback toasts se. (Phase 7)

## 🧵 Session log
- **2026-06-06** — idea.md padhi, context liya, `PROGRESS.md` banayi.
- **2026-06-06** — Bootstrap (Next 15 + TS + React Query + Supabase deps) + shared contract files. Multi-agent workflow (5 build + 1 verify) se poora v0 code generate. `tsc` + `next build` clean. Files: `app/` (dashboard, login, api, signout), `lib/` (db, supabase, notifier, hooks), `middleware.ts`, `vercel.json`, `.env.example`, `SETUP.md`, `README.md`. **Bacha:** external setup (tum) + WhatsApp swap.
- **2026-06-07** — GitHub pe push. Supabase setup chalu. Standalone `supabase/schema.sql` → proper **`supabase/migrations/20260606200615_create_subscriptions.sql`**. CLI/`config.toml` drop — migrations hamesha **Supabase SQL editor me manually** apply honge (user preference). SETUP.md §2 update.
- **2026-06-07** — Supabase project + user banaye, migration apply, `.env.local` real keys. `npm run dev` chala ke **end-to-end verify**: auth-guard redirect, login 200, cron 401-without/200-with-secret, Supabase connected (`checked:0`). Backend live.
- **2026-06-07** — **UI revamp (Phase 7):** Tailwind v4 dark design system + UI primitives (`components/ui/*`) + sonner toasts + Radix modals. Add/delete modal-based. `SubscriptionForm.tsx` hata (modal me move). `tsc`+`build` clean. Login Playwright se verified — sleek dark.
- **2026-06-07** — **UI refinements (user feedback):** (1) modal glitch fix — `inset-0 + m-auto` centering + `tw-animate-css` smooth enter/exit; (2) name → service dropdown (`lib/services.ts`, Custom→text field); (3) date → shadcn calendar (`react-day-picker` v10 + Radix Popover, `components/ui/{popover,calendar,date-picker}`). Temp `/preview` page se Playwright pe sab verify, phir hata diya. `tsc`+`build` clean.
- **2026-06-07** — **Edit feature (Phase 8):** `PATCH /api/subscriptions/[id]` + `updateSubscription` + `useUpdateSubscription`; modal generalize → `SubscriptionModal` (add+edit, prefill incl. date); row pe ✏️ button; shared `lib/validation.ts`. Playwright se prefill verify.
- **2026-06-07** — Calendar me month+year **dropdowns** add (year directly chuno, 2025–2038).
- **2026-06-07** — **Forms refactor (Phase 9):** react-hook-form + zod. `lib/schema.ts` (FE form + API payload + login schemas), server routes zod `safeParse`, `lib/validation.ts` hata. Inline field errors. Playwright se verify.
- **2026-06-07** — **Loaders (Phase 10):** `Skeleton` + `DashboardSkeleton` (initial load), `GlobalLoadingBar` (top bar on fetch/mutate). Playwright se skeleton verify.
- **2026-06-07** — **Routing restructure:** `/` ab **login home**, dashboard `/dashboard` pe (pehle `/`=dashboard, `/login`=login — confusing tha). Middleware: logged-out→`/`, logged-in on `/`→`/dashboard`; signout→`/`; login success→`/dashboard`. `app/login` hata. curl se redirects verify.
- **2026-06-07** — **Account page (Phase 11):** `/account` — email (read-only) + name/phone editable (Supabase `user_metadata`) + created/last-updated. `useUser`/`useUpdateProfile`, `profileSchema`. Phone display-only. Playwright se verify.
- **2026-06-07** — **Shared nav:** `components/AppHeader` (logo + Dashboard · Account · Sign out, active highlight via `usePathname`) — dono pages pe consistent, inline headers hata. Playwright se verify.
- **2026-06-07** — **fetch → axios:** `lib/api.ts` central instance (baseURL `/api` + error-normalize interceptor); subscription hooks ab `api.get/post/patch/delete` use karte; `errorFromResponse` helper hata (auth hooks supabase SDK pe hi). `tsc`+`build` clean.
- **2026-06-07** — **Per-sub reminder lead time:** naya column `reminder_days_before` (migration `20260607101951`), "Remind me" dropdown (on-day/1/2/3/5/7, bounded 0–30 in API+DB), cron ab exactly us din ek baar fire karta (`getDueSubscriptions`→`getDueReminders`). ⚠️ **Migration run karni hogi warna add/edit fail (column missing).** Playwright se dropdown verify. **Bacha:** migration apply (TUM), Vercel deploy, Phase 5 WhatsApp.
