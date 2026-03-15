"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, UserPlus, FilePlus, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const routes = [
    {
      label: "Home",
      icon: Home,
      href: "/",
    },
    {
      label: "Advertiser",
      icon: LayoutDashboard,
      href: "/advertiser/dashboard",
    },
    {
      label: "Create Ad",
      icon: FilePlus,
      href: "/advertiser/create-ad",
    },
    {
      label: "Register",
      icon: UserPlus,
      href: "/advertiser/register",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8, transition: { duration: 0.2 } }}
            className="flex flex-col gap-3"
          >
            {routes.map((route, i) => {
              const active = pathname === route.href;
              const Icon = route.icon;

              return (
                <Link key={route.href} href={route.href} onClick={() => setIsOpen(false)}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (routes.length - i - 1) * 0.05 }}
                    className="flex items-center gap-3 group"
                  >
                    <span className="text-xs font-medium px-2 py-1 rounded bg-card/90 backdrop-blur border border-border opacity-0 group-hover:opacity-100 transition-opacity">
                      {route.label}
                    </span>
                    <button
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:bg-muted"
                      }`}
                      title={route.label}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl text-primary-foreground transition-all duration-300 ${
          isOpen ? "bg-muted-foreground rotate-90" : "bg-primary hover:bg-primary/90 hover:scale-105"
        }`}
      >
        <AnimatePresence mode="popLayout">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
