import type { Subscription } from "@/lib/types";
import { monthlyTotal, formatRupees } from "@/lib/total";

export default function MonthlyTotal({ subs }: { subs: Subscription[] }) {
  const total = monthlyTotal(subs);

  return (
    <div>
      <p className="text-sm text-muted">Total going out</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
          {formatRupees(total)}
        </span>
        <span className="text-base text-muted">/month</span>
      </div>
      <p className="mt-2 text-sm text-faint">
        {subs.length} active{" "}
        {subs.length === 1 ? "subscription" : "subscriptions"}
      </p>
    </div>
  );
}
