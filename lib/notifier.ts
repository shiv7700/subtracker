// The pluggable notifier — the LAST mile of the app's core ("warn before charge").
//
// Design principle: the rest of the app (db + dates + cron) is channel-agnostic.
// It just hands a DueSubscription to notify(); HOW it gets delivered lives here.
//
// v0 (active): notify() formats a human message and console.log()s it. That's
// enough to prove the brain works end-to-end without any external account.
//
// PHASE 5 SWAP: once a Meta WhatsApp Cloud API number + approved template exist,
// replace the `console.log(message)` line inside notify() with:
//     await sendWhatsApp(message);
// sendWhatsApp() is already written below — it just needs the WHATSAPP_* env vars.

import type { DueSubscription } from "@/lib/types";
import { formatRupees } from "@/lib/total";

/** Turn a due subscription into a clear, human-readable reminder line. */
function buildMessage(reminder: DueSubscription): string {
  const amount = formatRupees(reminder.amount);
  const when =
    reminder.days_until === 0
      ? "today"
      : `in ${reminder.days_until} day${reminder.days_until === 1 ? "" : "s"}`;

  return `⏰ ${reminder.name}: ${amount}/${reminder.cycle} charge ${when} (on ${reminder.next_billing_date})`;
}

/**
 * Dispatch a reminder for one due subscription.
 * Currently a console stub — see "PHASE 5 SWAP" note at the top of this file.
 */
export async function notify(reminder: DueSubscription): Promise<void> {
  const message = buildMessage(reminder);

  // --- ACTIVE (v0): console stub -------------------------------------------
  console.log(message);

  // --- PHASE 5 SWAP: comment out the console.log above and uncomment this ---
  // await sendWhatsApp(message);
}

/**
 * Send `message` as a WhatsApp message via the Meta Cloud API.
 *
 * INACTIVE in v0 — fully written and ready for Phase 5. To enable, set the
 * WHATSAPP_* env vars (see .env.example) and flip the swap inside notify().
 *
 * Notes:
 * - Meta only allows free-form text within a 24h window; outside it you must use
 *   an approved *template*. So this sends a template message and passes the
 *   reminder text as the template's first body parameter ({{1}}).
 * - Your template (named by WHATSAPP_TEMPLATE) should therefore have a body like:
 *       "{{1}}"
 *   or "SubTracker reminder: {{1}}" — i.e. exactly one body variable.
 * - Env is read INSIDE the function so a missing var never breaks the build.
 */
export async function sendWhatsApp(message: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.WHATSAPP_TO;
  const template = process.env.WHATSAPP_TEMPLATE;

  if (!token || !phoneNumberId || !to || !template) {
    // Don't throw — just log and bail so a half-configured deploy is harmless.
    console.warn(
      "[notifier] WhatsApp env not fully configured; skipping send. Message was:",
      message,
    );
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: template,
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: message }],
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "<no body>");
    throw new Error(`WhatsApp send failed (${res.status}): ${detail}`);
  }
}
