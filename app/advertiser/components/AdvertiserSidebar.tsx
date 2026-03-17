"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FilePlus, Store, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard",       href: "/advertiser/dashboard",    icon: LayoutDashboard },
  { label: "Create Ad",       href: "/advertiser/create-ad",    icon: FilePlus        },
  { label: "Ad Marketplace",  href: "/advertiser/marketplace",  icon: Store           },
  { label: "Register",        href: "/advertiser/register",     icon: UserPlus        },
];

export function AdvertiserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-border bg-background flex flex-col">
      <div className="px-3 pt-5 pb-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Advertiser
        </p>
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-2 py-2 rounded-md text-xs font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
