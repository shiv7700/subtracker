// The pluggable notifier — the LAST mile of the app's core ("warn before charge").
//
// Design principle: the rest of the app (db + dates + cron) is channel-agnostic.
// It hands a DueSubscription to notify(); HOW it's delivered lives here.
//
// notify() AUTO-ROUTES:
//   - WhatsApp (Meta Cloud API) when all WHATSAPP_* env vars are set,
//   - otherwise a console stub (dev / before WhatsApp is configured).
// No code change needed to go live — just set the env vars (see .env.example).

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

/** True only when every WhatsApp env var is present. */
function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_TO &&
      process.env.WHATSAPP_TEMPLATE,
  );
}

/**
 * Dispatch a reminder for one due subscription.
 * Sends a real WhatsApp message when configured; otherwise logs (stub).
 */
export async function notify(reminder: DueSubscription): Promise<void> {
  const message = buildMessage(reminder);

  if (isWhatsAppConfigured()) {
    await sendWhatsApp(message);
  } else {
    console.log(message);
  }
}

/**
 * Send `message` as a WhatsApp message via the Meta Cloud API.
 *
 * Notes:
 * - Meta requires an approved *template* outside the 24h window, so this sends a
 *   template message and passes the reminder text as the template's first body
 *   variable ({{1}}). Your template (WHATSAPP_TEMPLATE) must have exactly one
 *   body variable, e.g. body text "{{1}}" or "SubTracker reminder: {{1}}".
 * - Template language defaults to en_US; override with WHATSAPP_TEMPLATE_LANG to
 *   match the language you created the template in.
 */
export async function sendWhatsApp(message: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.WHATSAPP_TO;
  const template = process.env.WHATSAPP_TEMPLATE;
  const lang = process.env.WHATSAPP_TEMPLATE_LANG ?? "en_US";

  if (!token || !phoneNumberId || !to || !template) {
    throw new Error("WhatsApp env not fully configured.");
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
        language: { code: lang },
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
