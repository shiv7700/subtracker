"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LayoutDashboard, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account", label: "Account", icon: User },
] as const;

/** Shared top navigation — same on every signed-in page. */
export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="mb-8 flex items-center justify-between gap-3">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <Bell className="size-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">SubTracker</span>
      </Link>

      <nav className="flex items-center gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-elevated text-text"
                  : "text-muted hover:bg-elevated hover:text-text",
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}

        <form method="post" action="/auth/signout">
          <Button type="submit" variant="ghost" size="sm" aria-label="Sign out">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </form>
      </nav>
    </header>
  );
}
