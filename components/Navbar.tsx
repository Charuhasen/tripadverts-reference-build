"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ScanFace, Truck, ShieldCheck, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 flex items-center h-14">
        {/* Logo / brand */}
        <Link
          href="/advertiser/dashboard"
          className="text-sm font-bold tracking-tight mr-8 shrink-0"
        >
          TripAdverts
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
              pathname.startsWith("/admin")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </Link>

          <Link
            href="/fleet"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
              pathname.startsWith("/fleet")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Truck className="w-3.5 h-3.5" />
            Fleet
          </Link>

          <Link
            href="/advertiser/dashboard"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
              pathname.startsWith("/advertiser")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Megaphone className="w-3.5 h-3.5" />
            Advertiser
          </Link>

          <Link
            href="/"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
              pathname === "/"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <ScanFace className="w-3.5 h-3.5" />
            Face Detection
          </Link>
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
  );
}
