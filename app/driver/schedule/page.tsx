"use client";

import Link from "next/link";
import { ChevronLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { INDIVIDUAL_DRIVERS } from "@/lib/admin-data";
import { DEMO_CAMPAIGNS } from "@/lib/demo-campaigns";
import { getDayType, getHourRate, TIER_BG, TIER_LABELS, type RateTier } from "@/lib/pricing";

const DRIVER = INDIVIDUAL_DRIVERS.find((d) => d.id === "id1")!;
const TODAY   = "2026-03-19";

/** Dominant (highest-value) tier across a slot's hours */
function slotPrimaryTier(date: string, startTime: string, endTime: string): RateTier {
  const dayType = getDayType(date);
  const startH  = parseInt(startTime.split(":")[0], 10);
  let endH      = parseInt(endTime.split(":")[0], 10);
  if (endTime === "23:59" || endTime === "24:00") endH = 24;

  const tierOrder: RateTier[] = ["sat-night", "fri-night", "peak", "off-peak"];
  let best: RateTier = "off-peak";
  for (let h = startH; h < endH; h++) {
    const { tier } = getHourRate(h, dayType);
    if (tierOrder.indexOf(tier) < tierOrder.indexOf(best)) best = tier;
  }
  return best;
}

export default function DriverSchedulePage() {
  const todayDate = new Date(TODAY + "T00:00:00");

  // All upcoming slots in driver's zone
  const slots = DEMO_CAMPAIGNS
    .filter((c) => c.status !== "completed" && c.zones.some((z) => z.name === DRIVER.zone))
    .flatMap((c) =>
      c.bookingSlots
        .filter((s) => new Date(s.date + "T00:00:00") >= todayDate)
        .map((s) => ({
          ...s,
          campaignName: c.name,
          campaignId:   c.id,
          campaignStatus: c.status,
          tier: slotPrimaryTier(s.date, s.startTime, s.endTime),
        }))
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  // Group by date
  const byDate = slots.reduce<Record<string, typeof slots>>((acc, s) => {
    acc[s.date] = acc[s.date] ?? [];
    acc[s.date].push(s);
    return acc;
  }, {});
  const sortedDates = Object.keys(byDate).sort();

  function friendlyDate(iso: string) {
    const d    = new Date(iso + "T00:00:00");
    const diff = Math.round((d.getTime() - todayDate.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" });
  }

  function dayLabel(iso: string) {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase();
  }

  return (
    <div className="px-4 pt-8 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/driver/home" className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center active:bg-zinc-200">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Schedule</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">{DRIVER.zone} · upcoming campaigns</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {(["peak", "off-peak", "fri-night", "sat-night"] as RateTier[]).map((tier) => (
          <div key={tier} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", TIER_BG[tier])} />
            <span className="text-[11px] text-muted-foreground">{TIER_LABELS[tier]}</span>
          </div>
        ))}
      </div>

      {/* Schedule list */}
      {sortedDates.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-4 py-8 text-center">
          <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium">No upcoming slots</p>
          <p className="text-xs text-muted-foreground mt-1">
            Check back soon — we'll notify you when new campaigns are booked in your zone.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Date header */}
              <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{friendlyDate(date)}</p>
                  <p className="text-[11px] text-muted-foreground">{date}</p>
                </div>
                <span className="text-[11px] font-bold text-muted-foreground/60 tracking-widest">
                  {dayLabel(date)}
                </span>
              </div>

              {/* Slots */}
              <div className="divide-y divide-border">
                {byDate[date].map((s, i) => (
                  <div key={i} className="px-4 py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", TIER_BG[s.tier])} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{s.campaignName}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {s.campaignStatus === "pending" ? "Pending approval" : "Running"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold tabular-nums text-foreground">
                        {s.startTime}–{s.endTime}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {TIER_LABELS[s.tier]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info note */}
      <div className="rounded-xl bg-zinc-50 border border-border px-4 py-3.5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Stay in your zone during booked slots to maximise your earnings. Pending campaigns are awaiting advertiser approval.
        </p>
      </div>

    </div>
  );
}
