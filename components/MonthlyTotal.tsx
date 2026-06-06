"use client";

import type { Subscription } from "@/lib/types";
import { monthlyTotal, formatRupees } from "@/lib/total";

export default function MonthlyTotal({ subs }: { subs: Subscription[] }) {
  return (
    <div className="card">
      <div className="total">{formatRupees(monthlyTotal(subs))}</div>
      <div className="muted">/month going out</div>
    </div>
  );
}
