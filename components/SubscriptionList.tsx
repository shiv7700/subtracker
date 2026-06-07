"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Subscription } from "@/lib/types";
import { formatRupees } from "@/lib/total";
import { daysUntil } from "@/lib/dates";
import { useDeleteSubscription } from "@/lib/hooks";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog-confirm";
import SubscriptionModal from "@/components/SubscriptionModal";

type Tone = "neutral" | "warning" | "danger" | "success";

/** Color-coded "when is the next charge" label. */
function dueMeta(nextBillingDate: string): { label: string; tone: Tone } {
  const days = daysUntil(nextBillingDate);
  if (days < 0) return { label: "Overdue", tone: "danger" };
  if (days === 0) return { label: "Due today", tone: "danger" };
  if (days <= 3) return { label: `Due in ${days} day${days === 1 ? "" : "s"}`, tone: "warning" };
  return { label: `Due in ${days} days`, tone: "neutral" };
}

function SubscriptionRow({ sub }: { sub: Subscription }) {
  const deleteSubscription = useDeleteSubscription();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const due = dueMeta(sub.next_billing_date);

  function handleConfirm() {
    deleteSubscription.mutate(sub.id, {
      onSuccess: () => {
        toast.success(`${sub.name} removed`);
        setConfirmOpen(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Failed to delete"),
    });
  }

  return (
    <Card className="flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{sub.name}</span>
          <Badge tone={due.tone}>{due.label}</Badge>
        </div>
        <p className="mt-0.5 text-sm tabular-nums text-muted">
          {formatRupees(sub.amount)} / {sub.cycle === "yearly" ? "year" : "month"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <SubscriptionModal
          subscription={sub}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Edit ${sub.name}`}
              className="hover:text-text"
            >
              <Pencil className="size-4" />
            </Button>
          }
        />
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Delete ${sub.name}`}
          className="hover:text-danger"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${sub.name}?`}
        description="This removes it from your tracker. You can add it again anytime."
        confirmLabel="Delete"
        onConfirm={handleConfirm}
        loading={deleteSubscription.isPending}
      />
    </Card>
  );
}

export default function SubscriptionList({ subs }: { subs: Subscription[] }) {
  if (subs.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-1 px-6 py-12 text-center">
        <p className="font-medium">No subscriptions yet</p>
        <p className="text-sm text-muted">
          Add one to start tracking what you spend.
        </p>
      </Card>
    );
  }

  // Soonest charge first.
  const sorted = [...subs].sort(
    (a, b) => daysUntil(a.next_billing_date) - daysUntil(b.next_billing_date),
  );

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((sub) => (
        <SubscriptionRow key={sub.id} sub={sub} />
      ))}
    </div>
  );
}
