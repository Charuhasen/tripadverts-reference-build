"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Eye,
  MapPin,
  Calendar,
  Clock,
  FileCheck,
  ImageIcon,
  Film,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEMO_CAMPAIGNS,
  calcCampaignCost,
  calcSlotCost,
  uniqueDates,
  dateRange,
  type CampaignStatus,
} from "@/lib/demo-campaigns";

const STATUS_BADGE: Record<CampaignStatus, { className: string; label: string }> = {
  pending: { className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", label: "Pending" },
  running: { className: "bg-green-500/10 text-green-600 border-green-500/20", label: "Live" },
  completed: { className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20", label: "Completed" },
};

function formatNumber(n: number) {
  return n.toLocaleString();
}

function formatGHS(n: number) {
  return `GH₵${n.toLocaleString()}`;
}

function formatDateNice(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const campaign = DEMO_CAMPAIGNS.find((c) => c.id === id);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold mb-2">Campaign not found</h2>
          <p className="text-sm text-muted-foreground mb-4">The campaign you're looking for doesn't exist.</p>
          <Link
            href="/advertiser/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalCost = calcCampaignCost(campaign);
  const dates = uniqueDates(campaign.bookingSlots);
  const range = dateRange(campaign.bookingSlots);
  const statusBadge = STATUS_BADGE[campaign.status];
  const pop = campaign.proofOfPlay;

  // Group booking slots by date
  const slotsByDate: Record<string, typeof campaign.bookingSlots> = {};
  for (const slot of campaign.bookingSlots) {
    if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
    slotsByDate[slot.date].push(slot);
  }
  const sortedDates = Object.keys(slotsByDate).sort();

  // Group PoP entries by date
  const popByDate: Record<string, NonNullable<typeof pop>["entries"]> | null = pop
    ? pop.entries.reduce((acc, entry) => {
        if (!acc[entry.date]) acc[entry.date] = [];
        acc[entry.date].push(entry);
        return acc;
      }, {} as Record<string, typeof pop.entries>)
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {/* Back link */}
        <Link
          href="/advertiser/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
            <Image
              src={campaign.thumbnail}
              alt={campaign.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">{campaign.name}</h1>
              <Badge variant="outline" className={statusBadge.className}>
                {statusBadge.label}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted">
                {campaign.objective}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-xl font-bold">{formatGHS(totalCost)}</p>
            <p className="text-[10px] text-muted-foreground">Total cost</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase">Zones</span>
            </div>
            <p className="text-lg font-bold">{campaign.zones.length}</p>
            <p className="text-[10px] text-muted-foreground">
              {campaign.zones.map((z) => z.name).join(", ")}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase">Schedule</span>
            </div>
            <p className="text-lg font-bold">{dates.length} day{dates.length !== 1 ? "s" : ""}</p>
            <p className="text-[10px] text-muted-foreground">{range}</p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase">Impressions</span>
            </div>
            <p className="text-lg font-bold">~{formatNumber(campaign.estimatedImpressions)}</p>
            <p className="text-[10px] text-muted-foreground">Estimated</p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {campaign.adType === "image" ? <ImageIcon className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-semibold uppercase">Creative</span>
            </div>
            <p className="text-lg font-bold capitalize">{campaign.adType}</p>
            <p className="text-[10px] text-muted-foreground">Created {formatDateNice(campaign.createdAt)}</p>
          </div>
        </div>

        <div className={cn("grid gap-6", pop ? "lg:grid-cols-2" : "lg:grid-cols-1 max-w-2xl")}>
          {/* Booking Schedule */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Booking Schedule
            </h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-4 py-2 bg-muted/50 text-[10px] font-semibold uppercase text-muted-foreground border-b border-border min-w-[320px]">
                <span>Date</span>
                <span>Time Window</span>
                <span className="text-right">Cost</span>
              </div>
              {sortedDates.map((date) => (
                <div key={date}>
                  {slotsByDate[date].map((slot, i) => {
                    const cost = calcSlotCost(slot, campaign.zones.length);
                    return (
                      <div
                        key={`${slot.date}-${slot.startTime}`}
                        className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-4 py-2.5 border-b border-border last:border-b-0 text-sm min-w-[320px]"
                      >
                        <span className={cn("font-medium", i > 0 && "text-transparent")}>
                          {formatDateNice(slot.date)}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <span className="text-right font-semibold">{formatGHS(Math.round(cost))}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-4 py-2.5 bg-primary/5 border-t border-primary/20 min-w-[320px]">
                <span className="text-sm font-semibold">Total</span>
                <span />
                <span className="text-right text-sm font-bold text-primary">{formatGHS(totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Proof of Play */}
          {pop && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Proof of Play
              </h2>
              {/* PoP Summary */}
              <div className="flex gap-3 mb-3">
                <div className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-center">
                  <p className="text-lg font-bold">{formatNumber(pop.totalPlays)}</p>
                  <p className="text-[10px] text-muted-foreground">Total Plays</p>
                </div>
                <div className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-center">
                  <p className="text-lg font-bold">{pop.totalDevices}</p>
                  <p className="text-[10px] text-muted-foreground">Devices</p>
                </div>
                <div className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-center">
                  <p className="text-lg font-bold">{formatNumber(pop.estimatedImpressions)}</p>
                  <p className="text-[10px] text-muted-foreground">Impressions</p>
                </div>
              </div>

              {/* PoP Table */}
              <div className="rounded-xl border border-border bg-card overflow-hidden overflow-x-auto">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-4 py-2 bg-muted/50 text-[10px] font-semibold uppercase text-muted-foreground border-b border-border min-w-[360px]">
                  <span>Zone</span>
                  <span>Device</span>
                  <span>Time</span>
                  <span className="text-right">Plays</span>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {popByDate && Object.keys(popByDate).sort().map((date) => (
                    <React.Fragment key={date}>
                      <div className="px-4 py-1.5 bg-muted/30 text-[10px] font-semibold text-muted-foreground border-b border-border min-w-[360px]">
                        {formatDateNice(date)}
                      </div>
                      {popByDate[date].map((entry, i) => (
                        <div
                          key={`${entry.device}-${entry.date}-${i}`}
                          className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-4 py-2 border-b border-border last:border-b-0 text-xs min-w-[360px]"
                        >
                          <span className="font-medium">{entry.zone}</span>
                          <span className="text-muted-foreground font-mono text-[10px]">{entry.device}</span>
                          <span className="text-muted-foreground">{entry.timeWindow}</span>
                          <span className="text-right font-semibold">{formatNumber(entry.playsDelivered)}</span>
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
