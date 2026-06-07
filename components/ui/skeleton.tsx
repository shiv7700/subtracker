import * as React from "react";
import { cn } from "@/lib/cn";

/** A shimmering placeholder block, sized via className. */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-elevated", className)}
      {...props}
    />
  );
}
