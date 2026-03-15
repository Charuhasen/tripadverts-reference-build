"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FilePlus, UserPlus, Radio, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/advertiser/dashboard", icon: LayoutDashboard },
  { label: "Create Ad", href: "/advertiser/create-ad", icon: FilePlus },
  { label: "Network", href: "/advertiser/dashboard/network", icon: Radio },
  { label: "Register", href: "/advertiser/register", icon: UserPlus },
];

export default function AdvertiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 flex items-center h-14">
          {/* Logo / brand */}
          <Link
            href="/advertiser/dashboard"
            className="text-sm font-bold tracking-tight mr-8 shrink-0"
          >
            TripAdverts
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/advertiser/dashboard" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Profile button */}
          <button className="flex items-center gap-2 ml-4 shrink-0 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
              <User className="w-4 h-4 text-primary" />
            </div>
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
