"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ScanFace, Truck, ShieldCheck, Megaphone, Menu, X, CarFront } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/admin",                label: "Admin",          icon: ShieldCheck, match: (p: string) => p.startsWith("/admin")      },
  { href: "/fleet",                label: "Fleet",          icon: Truck,       match: (p: string) => p.startsWith("/fleet")      },
  { href: "/advertiser/dashboard", label: "Advertiser",     icon: Megaphone,   match: (p: string) => p.startsWith("/advertiser") },
  { href: "/driver",               label: "Driver",         icon: CarFront,    match: (p: string) => p.startsWith("/driver")     },
  { href: "/",                     label: "Face Detection", icon: ScanFace,    match: (p: string) => p === "/"                   },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center h-14">
          {/* Logo */}
          <Link
            href="/advertiser/dashboard"
            className="text-sm font-bold tracking-tight shrink-0"
          >
            TripAdverts
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-8">
            {NAV_LINKS.map(({ href, label, icon: Icon, match }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  match(pathname)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Profile button */}
          <Link
            href={pathname.startsWith("/driver") ? "/driver/profile" : "#"}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors text-xs font-bold text-primary">
              {pathname.startsWith("/driver") ? "KA" : <User className="w-4 h-4 text-primary" />}
            </div>
          </Link>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="ml-2 flex md:hidden w-8 h-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer — outside <header> to avoid backdrop-filter stacking context */}
      <div className="md:hidden">
        {/* Backdrop */}
        <div
          onClick={() => setIsOpen(false)}
          className={cn(
            "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        />
        {/* Drawer panel */}
        <nav
          className={cn(
            "fixed top-0 right-0 z-50 h-full w-64 bg-background border-l border-border shadow-xl flex flex-col pt-14 px-4 py-4 transition-transform duration-300",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {NAV_LINKS.map(({ href, label, icon: Icon, match }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                match(pathname)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
