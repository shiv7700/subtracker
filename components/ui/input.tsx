import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-lg border border-border bg-elevated px-3 text-sm text-text",
      "placeholder:text-faint",
      "transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
