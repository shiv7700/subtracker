import { Skeleton } from "@/components/ui/skeleton";

/** Loading placeholder that mirrors the dashboard layout. */
export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-52" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-10 w-44 rounded-lg" />
      </section>

      <section className="flex flex-col gap-3">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="size-8 rounded-md" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
