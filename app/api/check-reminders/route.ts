import { NextResponse } from "next/server";
import { getDueReminders } from "@/lib/db";
import { notify } from "@/lib/notifier";

// The "brain": triggered by Vercel Cron. Must always run fresh.
export const dynamic = "force-dynamic";

/**
 * Authorize the request. Vercel Cron sends "Authorization: Bearer <CRON_SECRET>".
 * We also accept "?secret=<CRON_SECRET>" for manual/browser triggering.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  // If no secret is configured, refuse rather than run unprotected.
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const querySecret = new URL(request.url).searchParams.get("secret");
  if (querySecret === secret) return true;

  return false;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await getDueReminders();
  console.log(
    `[check-reminders] ${due.length} subscription(s) due for a reminder today.`,
  );

  let notified = 0;
  for (const d of due) {
    try {
      await notify(d);
      notified += 1;
    } catch (err) {
      // One failed notification must not abort the rest of the run.
      console.error(
        `[check-reminders] Failed to notify for "${d.name}" (${d.id}):`,
        err,
      );
    }
  }

  console.log(`[check-reminders] Notified ${notified}/${due.length}.`);

  return NextResponse.json({
    checked: due.length,
    due: due.map((d) => ({ name: d.name, days_until: d.days_until })),
    notified,
  });
}
