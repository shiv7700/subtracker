import { NextResponse } from "next/server";
import { listSubscriptions, createSubscription } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { newSubscriptionSchema } from "@/lib/schema";

// Auth-gated, per-user data — never cache.
export const dynamic = "force-dynamic";

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

  const parsed = newSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const created = await createSubscription(parsed.data);
  return NextResponse.json(created, { status: 201 });
}
