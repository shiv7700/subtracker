"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { cn } from "@/lib/cn";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/** react-day-picker, themed dark, with month + year dropdowns for fast navigation. */
export function Calendar({ className, ...props }: CalendarProps) {
  const currentYear = new Date().getFullYear();

  return (
    <DayPicker
      showOutsideDays
      captionLayout="dropdown"
      startMonth={new Date(currentYear - 1, 0)}
      endMonth={new Date(currentYear + 12, 11)}
      className={cn("text-text", className)}
      style={
        {
          "--rdp-accent-color": "var(--color-accent)",
          "--rdp-accent-background-color":
            "color-mix(in oklab, var(--color-accent) 22%, transparent)",
          "--rdp-today-color": "var(--color-accent)",
          "--rdp-outside-opacity": "0.4",
          "--rdp-disabled-opacity": "0.4",
          "--rdp-day-width": "2.25rem",
          "--rdp-day-height": "2.25rem",
        } as React.CSSProperties
      }
      classNames={{
        day_button:
          "rounded-lg hover:bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        weekday: "text-faint text-xs font-normal",
        button_previous:
          "rounded-md text-muted hover:bg-elevated hover:text-text transition-colors",
        button_next:
          "rounded-md text-muted hover:bg-elevated hover:text-text transition-colors",
        dropdowns: "flex items-center gap-1.5",
        dropdown_root: "relative inline-flex items-center",
        dropdown:
          "rounded-md border border-border bg-elevated px-2 py-1 text-sm font-medium text-text cursor-pointer hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent/40",
        caption_label: "hidden",
      }}
      {...props}
    />
  );
}
