// Shared domain types — the contract every layer (db, api, fe) codes against.

export type BillingCycle = "monthly" | "yearly";

/** A subscription row as stored in Supabase. */
export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  /** Charge amount in rupees. Always > 0. */
  amount: number;
  cycle: BillingCycle;
  /** Next charge date, ISO calendar date: "YYYY-MM-DD". */
  next_billing_date: string;
  /** Days before the charge to send the reminder (fires once). 0–30. */
  reminder_days_before: number;
  /** Row creation timestamp, ISO. */
  created_at: string;
}

/** Payload to create a subscription (client → POST /api/subscriptions). */
export interface NewSubscription {
  name: string;
  amount: number;
  cycle: BillingCycle;
  next_billing_date: string; // "YYYY-MM-DD"
  reminder_days_before: number; // 0–30
}

/** A subscription that is due soon, returned by /api/check-reminders. */
export interface DueSubscription extends Subscription {
  /** Whole calendar days until the charge (0 = today). */
  days_until: number;
}
