import { NextResponse } from "next/server";
import { listSubscriptions, createSubscription } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import type { BillingCycle, NewSubscription } from "@/lib/types";

// Auth-gated, per-user data — never cache.
export const dynamic = "force-dynamic";

const VALID_CYCLES: BillingCycle[] = ["monthly", "yearly"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate that a string is a real calendar date in "YYYY-MM-DD" form.
 * Guards against junk like "2024-13-40" that matches the regex but isn't real.
 */
function isRealDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/**
 * Validate an arbitrary parsed body as a NewSubscription.
 * Returns the typed payload on success, or an error message string on failure.
 */
function validateNewSubscription(
  body: unknown,
): { ok: true; value: NewSubscription } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const b = body as Record<string, unknown>;

  if (typeof b.name !== "string" || b.name.trim().length === 0) {
    return { ok: false, error: "name is required and must be a non-empty string." };
  }
  if (typeof b.amount !== "number" || !Number.isFinite(b.amount) || b.amount <= 0) {
    return { ok: false, error: "amount must be a finite number greater than 0." };
  }
  if (typeof b.cycle !== "string" || !VALID_CYCLES.includes(b.cycle as BillingCycle)) {
    return { ok: false, error: "cycle must be either 'monthly' or 'yearly'." };
  }
  if (typeof b.next_billing_date !== "string" || !isRealDate(b.next_billing_date)) {
    return {
      ok: false,
      error: "next_billing_date must be a real calendar date in YYYY-MM-DD format.",
    };
  }

  return {
    ok: true,
    value: {
      name: b.name.trim(),
      amount: b.amount,
      cycle: b.cycle as BillingCycle,
      next_billing_date: b.next_billing_date,
    },
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await listSubscriptions();
  return NextResponse.json(subscriptions);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = validateNewSubscription(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const created = await createSubscription(result.value);
  return NextResponse.json(created, { status: 201 });
}
