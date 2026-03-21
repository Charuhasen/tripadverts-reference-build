"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  AlertCircle,
  Tag,
  Megaphone,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { INDIVIDUAL_DRIVERS, PAYOUT_RECORDS } from "@/lib/admin-data";
import { DEMO_CAMPAIGNS } from "@/lib/demo-campaigns";

const DRIVER = INDIVIDUAL_DRIVERS.find((d) => d.id === "id1")!;
const TODAY   = "2026-03-19";

function getHour() {
  return new Date("2026-03-19T09:15:00").getHours();
}

function greeting() {
  const h = getHour();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "New payout schedule starting April",
    body: "From April 1st, payouts will be processed weekly every Friday instead of bi-weekly.",
    date: "2026-03-18",
    urgent: true,
  },
  {
    id: "a2",
    title: "Tablet firmware update required",
    body: "Please ensure your tablet is connected to Wi-Fi overnight on March 21st for an automatic update.",
    date: "2026-03-17",
    urgent: true,
  },
  {
    id: "a3",
    title: "New partner deals available",
    body: "MTN and TotalEnergies have added new perks for drivers. Check the Deals section.",
    date: "2026-03-15",
    urgent: false,
  },
];

export default function DriverHomePage() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const pending = PAYOUT_RECORDS.find(
    (p) => p.recipientId === DRIVER.id && p.status === "pending"
  );

  const todayDate = new Date(TODAY + "T00:00:00");

  const upcomingSlots = DEMO_CAMPAIGNS
    .filter(
      (c) =>
        c.status !== "completed" &&
        c.zones.some((z) => z.name === DRIVER.zone)
    )
    .flatMap((c) =>
      c.bookingSlots
        .filter((s) => new Date(s.date + "T00:00:00") >= todayDate)
        .map((s) => ({
          ...s,
          campaignName: c.name,
          campaignId:   c.id,
          status:       c.status,
        }))
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const todaySlots = upcomingSlots.filter((s) => s.date === TODAY);
  const visibleAnnouncements = ANNOUNCEMENTS.filter((a) => !dismissed.has(a.id));

  return (
    <div className="px-4 pt-8 space-y-5">

      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting()}</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {DRIVER.name.split(" ")[0]}
          </h1>
        </div>
        <Link href="/driver/profile" className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
          "bg-primary/10 text-primary active:bg-primary/20"
        )}>
          {DRIVER.name.split(" ").map((n) => n[0]).join("")}
        </Link>
      </div>

      {/* Today's schedule — most time-sensitive, shown first */}
      {todaySlots.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              Live today
            </p>
          </div>
          <div className="divide-y divide-primary/10">
            {todaySlots.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium leading-snug">{s.campaignName}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {s.status === "pending" ? "Pending approval" : "Running"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground font-medium tabular-nums">
                  {s.startTime}–{s.endTime}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending payout */}
      {pending && (
        <Link href="/driver/earnings">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 flex items-center justify-between active:opacity-80">
            <div>
              <p className="text-[11px] font-medium text-amber-700 uppercase tracking-wide">
                Pending payout
              </p>
              <p className="text-2xl font-bold text-amber-900 mt-0.5">
                GH₵ {pending.amount.toLocaleString()}
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">{pending.period}</p>
              <p className="text-[11px] text-amber-600 mt-1 font-medium">
                Expected by Mar 20, 2026
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400 shrink-0" />
          </div>
        </Link>
      )}

      {/* Deals banner — personalised with hottest deal */}
      <Link href="/driver/deals" className="block mt-3">
        <div className="rounded-xl bg-gradient-to-r from-primary to-primary/70 px-4 py-4 flex items-center justify-between active:opacity-90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                Driver perks · 8 deals
              </p>
              <p className="text-sm font-bold text-white mt-0.5">
                🔥 Free 5GB data from MTN
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/70 shrink-0" />
        </div>
      </Link>

      {/* Announcements */}
      {visibleAnnouncements.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden mt-3">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Megaphone className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              Announcements
            </p>
            <span className="ml-auto text-[11px] font-medium text-muted-foreground">
              {visibleAnnouncements.length} unread
            </span>
          </div>
          <div className="divide-y divide-border">
            {visibleAnnouncements.map((a) => (
              <div key={a.id} className={cn(
                "px-4 py-3.5 flex items-start gap-3",
                a.urgent && "bg-red-50/50"
              )}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide",
                      a.urgent
                        ? "bg-red-100 text-red-600"
                        : "bg-zinc-100 text-zinc-500"
                    )}>
                      {a.urgent ? "Urgent" : "Info"}
                    </span>
                    <p className="text-[10px] text-muted-foreground/60">
                      {new Date(a.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold leading-snug">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{a.body}</p>
                </div>
                <button
                  onClick={() => setDismissed((s) => new Set(s).add(a.id))}
                  className="shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted active:bg-muted transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tablet offline warning */}
      {!DRIVER.tabletOnline && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-red-700">Tablet offline</p>
            <p className="text-[11px] text-red-600 mt-0.5">
              Ads aren't displaying. Check your tablet's Wi-Fi connection or restart it.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
