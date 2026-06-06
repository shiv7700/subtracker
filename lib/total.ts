import type { Subscription } from "./types";

type CostShape = Pick<Subscription, "amount" | "cycle">;

/** Normalize a single subscription's cost to a per-month rupee figure (yearly ÷ 12). */
export function monthlyCost(sub: CostShape): number {
  return sub.cycle === "yearly" ? sub.amount / 12 : sub.amount;
}

/** Total monthly spend across all subscriptions. This is the headline "₹X/month" number. */
export function monthlyTotal(subs: CostShape[]): number {
  return subs.reduce((sum, s) => sum + monthlyCost(s), 0);
}

/** Format a rupee amount for display, e.g. 1234.5 → "₹1,234.50". */
export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
