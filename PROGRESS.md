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

- **Active phase:** ✅ **All v0 code DONE & building** (Phase 1–5 code complete). Ab sirf **external setup** baaki (tumhare haath ka kaam).
- **Build:** `tsc --noEmit` clean + `npm run build` clean (6 routes + middleware generate). Ek benign Supabase edge-runtime warning, fatal nahi.
- **Next up (TUM):** `SETUP.md` follow karo — Supabase project + schema + apna user + env vars → `npm run dev` → login → subscription add. (~10–15 min)
- **Blockers:** Supabase/Vercel/Meta keys — by design tumhare credentials chahiye.

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
- [ ] ⬜ **1.3** Supabase project + env vars — **TUM (SETUP.md §1,4)**. `.env.example` ready.
- [x] ✅ **1.4** `lib/db.ts` wrapper (Supabase ke peeche, swappable)
- [x] ✅ **1.5** `subscriptions` schema → `supabase/schema.sql` (RLS + policies ready, paste karna baaki)
- [x] ✅ **1.6** Auth wire-up code — login page only, no signup (signup OFF karna SETUP.md §3)
- [ ] ⬜ **1.7** Apna user manually banao — **TUM (SETUP.md §3)**
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

**Phase 3 done jab:** Endpoint call pe "due in 3 days" list + notifier fire. ✅ Code done (roll-over chhod ke).

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

### Phase 6 — Deploy 🚀
- [ ] ⬜ **6.1** Vercel pe project connect + env vars
- [ ] ⬜ **6.2** Cron live verify (DB roz touch → Supabase pause na ho)
- [ ] ⬜ **6.3** Public URL pe login test (locked confirm)

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

## 🧵 Session log
- **2026-06-06** — idea.md padhi, context liya, `PROGRESS.md` banayi.
- **2026-06-06** — Bootstrap (Next 15 + TS + React Query + Supabase deps) + shared contract files. Multi-agent workflow (5 build + 1 verify) se poora v0 code generate. `tsc` + `next build` clean. Files: `app/` (dashboard, login, api, signout), `lib/` (db, supabase, notifier, hooks), `middleware.ts`, `supabase/schema.sql`, `vercel.json`, `.env.example`, `SETUP.md`, `README.md`. **Bacha:** external setup (tum) + WhatsApp swap.
