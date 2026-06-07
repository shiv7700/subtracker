// Data-access layer. All Supabase reads/writes go through here so the rest of
// the app codes against plain typed functions, not the Supabase SDK.

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { daysUntil } from "@/lib/dates";
import type {
  Subscription,
  NewSubscription,
  DueSubscription,
} from "@/lib/types";

/**
 * List the current user's subscriptions, soonest charge first.
 * RLS limits rows to user_id = auth.uid().
 */
export async function listSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("next_billing_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to list subscriptions: ${error.message}`);
  }
  return (data ?? []) as Subscription[];
}

/**
 * Create a subscription for the current user. Reads the user from the session
 * and sets user_id (RLS also enforces user_id = auth.uid() on insert).
 */
export async function createSubscription(
  input: NewSubscription,
): Promise<Subscription> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(`Failed to read session: ${userError.message}`);
  }
  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      name: input.name,
      amount: input.amount,
      cycle: input.cycle,
      next_billing_date: input.next_billing_date,
      reminder_days_before: input.reminder_days_before,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create subscription: ${error.message}`);
  }
  return data as Subscription;
}

/**
 * Update one of the current user's subscriptions by id.
 * RLS ensures a user can only update their own rows.
 */
export async function updateSubscription(
  id: string,
  input: NewSubscription,
): Promise<Subscription> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      name: input.name,
      amount: input.amount,
      cycle: input.cycle,
      next_billing_date: input.next_billing_date,
      reminder_days_before: input.reminder_days_before,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
  return data as Subscription;
}

/**
 * Delete one of the current user's subscriptions by id.
 * RLS ensures a user can only delete their own rows.
 */
export async function deleteSubscription(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("subscriptions").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete subscription: ${error.message}`);
  }
}

/**
 * Find every subscription (across ALL users) that should be reminded TODAY —
 * i.e. days-until-charge exactly equals its per-subscription reminder lead time.
 * This fires once (on the matching day), not every day in a window.
 * Used by the daily cron, so it uses the admin client to bypass RLS.
 */
export async function getDueReminders(): Promise<DueSubscription[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("next_billing_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to read due reminders: ${error.message}`);
  }

  const rows = (data ?? []) as Subscription[];
  return rows
    .map((sub) => ({ ...sub, days_until: daysUntil(sub.next_billing_date) }))
    .filter((sub) => sub.days_until === sub.reminder_days_before);
}
