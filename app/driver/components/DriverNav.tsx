"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, CalendarDays, User, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home",     href: "/driver/home",     icon: Home         },
  { label: "Earnings", href: "/driver/earnings",  icon: Wallet       },
  { label: "Schedule", href: "/driver/schedule",  icon: CalendarDays },
  { label: "Deals",    href: "/driver/deals",     icon: Tag          },
  { label: "Profile",  href: "/driver/profile",   icon: User         },
];

export default function DriverNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
      <div className="max-w-lg mx-auto flex">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "fill-primary/15")} />
              <span className="leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
