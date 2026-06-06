# SubTracker 📲 — Idea Doc

## Ek line me
Personal subscription tracker jo **paise kat-ne se PEHLE** WhatsApp pe reminder bhejta hai.

---

## Problem (asli wala)
- Subscriptions ka track nahi rehta → paise chupke se kat jaate hai
- Free trials convert ho jaate hai, bhool jaata hu
- Pata hi nahi chalta ki har mahine **total kitna** ja raha hai

**Asli dard "list nahi hai" wala NAHI hai.** Asli dard:
> "Charge hone se PEHLE pata nahi chalta."

Isliye is app ka **dil = charge se pehle warning.**
Sirf ek sundar list (jaise 100 apps karte hai) mera problem solve nahi karti.

---

## Kiske liye
- **Sirf mere liye** — user #1, abhi sirf yahi.
- Matlab: no multi-user, no sharing, no business setup ki tension. Life easy.

### Login haan, Signup nahi
- App Vercel pe **public URL** pe rahega → koi bhi link khol sakta hai → isliye **login chahiye** (app protected rahe).
- Par **public signup NAHI.** Apna ek user **manually Supabase me bana lunga** (dashboard se). Registration form banane ki zaroorat hi nahi.
- Result: single-user app, par dunya se locked. 🔒

---

## v0 scope (weekend me shippable)
1. **Login** — Supabase Auth, sirf mera user. App andar se protected.
2. **Add / list subscription** — naam, amount, cycle (monthly/yearly), next billing date
3. **Monthly total** — sab jod ke "₹X/month ja raha hai" (yearly ko ÷12) → ye number dekhna hi aadha motivation
4. **Reminder** — charge se 2–3 din pehle alert → **YE CORE HAI**, baaki sab decoration

## v0 me NAHI (warna phir atak jaunga)
- ❌ Public signup / registration (apna user haath se banaunga)
- ❌ Multi-user / sharing
- ❌ Bank / UPI auto-detection
- ❌ Statement scan / OCR
- ❌ Categories, analytics, fancy charts

---

## Tech stack (LOCKED)
- **Frontend:** Next.js (App Router) + **React Query** — simple FE, no extra state lib
- **Backend:** Next.js **API routes** (`/api/*`) — serverless, koi alag server nahi
- **DB:** **Supabase** (hosted Postgres) — zero setup, `lib/db` ke peeche swappable
- **Auth:** Supabase Auth — **login only, signup band**
- **Scheduler:** **Vercel Cron Jobs** — roz subah ~9 baje `/api/check-reminders` hit karega (node-cron ki zaroorat nahi)
- **Notifier:** `lib/notifier` — stub → Meta Cloud API
- **Deploy:** **Vercel** — single project, ek hi jagah sab

### Server lena padhega? → NAHI 🎉
- CRUD + monthly total → serverless API routes (Vercel khud chalata hai)
- Daily check → Vercel Cron (alag cron server nahi)
- WhatsApp → **Meta Cloud API = sirf ek HTTP call** → serverless route se ho jaata hai
- Isliye `whatsapp-web.js` (jo always-on process maangta tha) ki zaroorat **nahi** → koi alag box nahi.

---

## Paisa? → ₹0 (personal use)
| Service | Free tier | Fit? |
|---|---|---|
| Vercel (Hobby) | hosting + serverless + 100GB bandwidth | ✅ personal = free |
| Vercel Cron | Hobby pe 1 cron/din | ✅ humein bas roz 1 baar |
| Supabase | 500MB Postgres free | ✅ rows toh chand KB |
| WhatsApp (Meta Cloud API) | test number → free, ~5 recipients | ✅ sirf khud ko |
| Domain | `*.vercel.app` free | ✅ kharidna nahi |

**Gotchas (taaki surprise na ho):**
- Supabase free project 7 din inactive → pause. **Par daily cron roz DB touch karega → kabhi pause nahi.** ✅
- WhatsApp test number: ~5 numbers + ek **approved template** se message jaata hai (Meta ka sample template ya apna utility template, jaldi approve). Personal ke liye kaafi.

Paisa **tab** lagega jab doosre log use karein (multi-user) — woh v2+, abhi PARK.

---

## Reminder channel — WhatsApp (Meta Cloud API)

**Kyun WhatsApp:** email koi nahi dekhta (promotions tab me dab jaata hai). Aaj ki generation WhatsApp dekhti hai → reminder wahi dikhna chahiye jahan aankh sach me jaati hai.

**Kyun Meta Cloud API (whatsapp-web.js nahi):**
- Official + free **test number** se apne number pe bhej sakta hu
- Sirf ek HTTP `fetch` → serverless route me fit, koi 24/7 process nahi
- Tradeoff: pehle ek baar template approval ka setup → set-and-forget

---

## Architecture principle (IMPORTANT)
**Notifier pluggable hoga.** Core (data + dates + cron) channel se bilkul independent.
- v0 me notifier = **console stub** (sirf print karega)
- Loop chalte dekh ke, **last step** me usi function ke andar Meta Cloud API ka `fetch` plug
- Isliye notifier ka decision build ko **kabhi block nahi karega**

```
Browser (React Query)
      │  (login: Supabase Auth)
      ▼
Next.js API routes  ──►  Supabase (Postgres)
      ▲
      │ (roz ~9 baje)
Vercel Cron ──► /api/check-reminders ──► notifier (stub → Meta Cloud API HTTP)
```

---

## Build plan (order)
1. **Setup** — Next.js app + Supabase project + `subscriptions` table + Auth (apna user banao, signup band)
2. **Core** — `/api/subscriptions` (add/list) + monthly total + simple FE (React Query), sab login ke peeche
3. **Brain** — `/api/check-reminders` (agle 3 din me kya due) + Vercel cron config
4. **Notifier stub** — console pe reminder print (loop test)
5. **Last step** — usi stub me Meta Cloud API plug → asli WhatsApp 📲

---

## Baad ke liye (v2+ — abhi PARK karo)
- Public signup + multi-user (agar doosre log use karein)
- WhatsApp production (Cloud API + approved template, per-message paisa)
- "Cancel kar diya" / pause mark karna
- Reminder ke saath direct cancel link
- Spend trends / category breakdown
- Multi-currency

---
_Decided: 2026-06-06. Stack locked: Next.js + React Query + Supabase + Vercel + Meta Cloud API. Ab sochna band — banana shuru._
