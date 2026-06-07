"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { cn } from "@/lib/cn";

/** A slim indeterminate bar at the top of the screen while any query/mutation runs. */
export default function GlobalLoadingBar() {
  const active = useIsFetching() + useIsMutating() > 0;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden transition-opacity duration-300",
        active ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="h-full w-1/3 animate-progress bg-accent" />
    </div>
  );
}
