"use client";

import type { Subscription } from "@/lib/types";
import { formatRupees } from "@/lib/total";
import { daysUntil } from "@/lib/dates";
import { useDeleteSubscription } from "@/lib/hooks";

/** Human-readable "when is the next charge" label. */
function dueLabel(nextBillingDate: string): string {
  const days = daysUntil(nextBillingDate);
  if (days < 0) return "overdue";
  if (days === 0) return "due today";
  if (days === 1) return "due in 1 day";
  return `due in ${days} days`;
}

function SubscriptionRow({ sub }: { sub: Subscription }) {
  const deleteSubscription = useDeleteSubscription();

  return (
    <div className="card row">
      <div>
        <div style={{ fontWeight: 600 }}>{sub.name}</div>
        <div className="muted">
          {formatRupees(sub.amount)}/{sub.cycle} · {dueLabel(sub.next_billing_date)}
        </div>
      </div>
      <button
        type="button"
        className="btn btn-danger"
        disabled={deleteSubscription.isPending}
        onClick={() => deleteSubscription.mutate(sub.id)}
      >
        {deleteSubscription.isPending ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}

export default function SubscriptionList({
  subs,
}: {
  subs: Subscription[];
}) {
  if (subs.length === 0) {
    return (
      <div className="card">
        <p className="muted">
          No subscriptions yet. Add one above to start tracking.
        </p>
      </div>
    );
  }

  // Soonest charge first.
  const sorted = [...subs].sort(
    (a, b) =>
      daysUntil(a.next_billing_date) - daysUntil(b.next_billing_date),
  );

  return (
    <div>
      {sorted.map((sub) => (
        <SubscriptionRow key={sub.id} sub={sub} />
      ))}
    </div>
  );
}
