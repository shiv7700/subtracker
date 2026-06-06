"use client";

import { useSubscriptions } from "@/lib/hooks";
import MonthlyTotal from "@/components/MonthlyTotal";
import SubscriptionForm from "@/components/SubscriptionForm";
import SubscriptionList from "@/components/SubscriptionList";

export default function DashboardPage() {
  const { data: subs, isLoading, isError, error } = useSubscriptions();

  return (
    <main className="container">
      <div className="row" style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>SubTracker</h1>
        <form method="post" action="/auth/signout">
          <button type="submit" className="btn">
            Sign out
          </button>
        </form>
      </div>

      {isLoading && <p className="muted">Loading your subscriptions…</p>}

      {isError && (
        <p className="error">
          {error instanceof Error
            ? error.message
            : "Failed to load subscriptions."}
        </p>
      )}

      {!isLoading && !isError && subs && (
        <>
          <MonthlyTotal subs={subs} />
          <SubscriptionForm />
          <SubscriptionList subs={subs} />
        </>
      )}
    </main>
  );
}
