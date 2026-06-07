"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogContent({
  className,
  children,
  title,
  description,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Content> & {
  title?: string;
  description?: string;
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      {/* Centered via inset-0 + m-auto (NOT transform) so the zoom animation never fights the centering. */}
      <RadixDialog.Content
        className={cn(
          "fixed inset-0 z-50 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto",
          "rounded-2xl border border-border bg-surface p-6 shadow-2xl outline-none",
          "duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className,
        )}
        {...props}
      >
        {(title || description) && (
          <div className="mb-5 pr-6">
            {title && (
              <RadixDialog.Title className="text-lg font-semibold tracking-tight text-text">
                {title}
              </RadixDialog.Title>
            )}
            {description && (
              <RadixDialog.Description className="mt-1 text-sm text-muted">
                {description}
              </RadixDialog.Description>
            )}
          </div>
        )}
        {children}
        <RadixDialog.Close
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1 text-muted transition-colors hover:bg-elevated hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <X className="size-4" />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
