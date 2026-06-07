"use client";

import { Plus } from "lucide-react";
import { useSubscriptions } from "@/lib/hooks";
import AppHeader from "@/components/AppHeader";
import MonthlyTotal from "@/components/MonthlyTotal";
import SubscriptionList from "@/components/SubscriptionList";
import SubscriptionModal from "@/components/SubscriptionModal";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: subs, isLoading, isError, error } = useSubscriptions();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <AppHeader />

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <p className="text-sm text-danger">
          {error instanceof Error ? error.message : "Failed to load."}
        </p>
      )}

      {!isLoading && !isError && subs && (
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6">
            <MonthlyTotal subs={subs} />
            <div>
              <SubscriptionModal
                trigger={
                  <Button>
                    <Plus className="size-4" />
                    Add subscription
                  </Button>
                }
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted">
              Your subscriptions
            </h2>
            <SubscriptionList subs={subs} />
          </section>
        </div>
      )}
    </main>
  );
}
