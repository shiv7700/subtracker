"use client";

import { useState } from "react";
import type { BillingCycle, NewSubscription } from "@/lib/types";
import { useAddSubscription } from "@/lib/hooks";

const EMPTY = {
  name: "",
  amount: "",
  cycle: "monthly" as BillingCycle,
  next_billing_date: "",
};

export default function SubscriptionForm() {
  const [form, setForm] = useState(EMPTY);
  const addSubscription = useAddSubscription();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: NewSubscription = {
      name: form.name.trim(),
      amount: Number(form.amount),
      cycle: form.cycle,
      next_billing_date: form.next_billing_date,
    };

    addSubscription.mutate(payload, {
      onSuccess: () => setForm(EMPTY),
    });
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Add a subscription</h2>

      <div className="field">
        <label className="label" htmlFor="sub-name">
          Name
        </label>
        <input
          id="sub-name"
          className="input"
          type="text"
          placeholder="Netflix"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="sub-amount">
          Amount (₹)
        </label>
        <input
          id="sub-amount"
          className="input"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="499"
          required
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="sub-cycle">
          Billing cycle
        </label>
        <select
          id="sub-cycle"
          className="select"
          value={form.cycle}
          onChange={(e) =>
            setForm({ ...form, cycle: e.target.value as BillingCycle })
          }
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="field">
        <label className="label" htmlFor="sub-date">
          Next billing date
        </label>
        <input
          id="sub-date"
          className="input"
          type="date"
          required
          value={form.next_billing_date}
          onChange={(e) =>
            setForm({ ...form, next_billing_date: e.target.value })
          }
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={addSubscription.isPending}
      >
        {addSubscription.isPending ? "Adding…" : "Add subscription"}
      </button>

      {addSubscription.isError && (
        <p className="error">{addSubscription.error.message}</p>
      )}
    </form>
  );
}
