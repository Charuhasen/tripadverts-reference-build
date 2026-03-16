"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  MapPin,
  Calendar,
  ChevronRight,
  FileCheck,
  Radio,
  ArrowRight,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { getZonesForCity } from "@/lib/schemas/campaignData";
import {
  DEMO_CAMPAIGNS,
  calcCampaignCost,
  uniqueDates,
  type CampaignStatus,
  type DemoCampaign,
} from "@/lib/demo-campaigns";

// ── Helpers ──

const STATUS_DOT: Record<CampaignStatus, string> = {
  pending: "bg-yellow-500",
  running: "bg-green-500",
  completed: "bg-zinc-400",
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  pending: "Pending",
  running: "Live",
  completed: "Completed",
};

function formatNumber(n: number) {
  return n.toLocaleString();
}

function formatGHS(n: number) {
  return `GH₵${n.toLocaleString()}`;
}

// ── Network summary ──

const ACCRA_ZONES = getZonesForCity("accra");
const NETWORK_BOOKED = 247;
const NETWORK_TOTAL = ACCRA_ZONES.reduce((s, z) => s + z.availableTaxis, 0);
const NETWORK_UTIL = Math.round((NETWORK_BOOKED / NETWORK_TOTAL) * 100);

// ── Components ──

function NetworkDemandCard() {
  return (
    <Link href="/advertiser/dashboard/network">
      <Card className="transition-shadow hover:shadow-md group">
        <CardContent className="px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Network Demand</h3>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                  NETWORK_UTIL >= 75 ? "bg-red-100 text-red-700" :
                  NETWORK_UTIL >= 45 ? "bg-amber-100 text-amber-700" :
                  "bg-green-100 text-green-700"
                )}>
                  {NETWORK_UTIL}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {NETWORK_BOOKED}/{NETWORK_TOTAL} taxis booked
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CampaignRow({ campaign }: { campaign: DemoCampaign }) {
  const dates = uniqueDates(campaign.bookingSlots);
  const totalCost = calcCampaignCost(campaign);
  const pop = campaign.proofOfPlay;

  return (
    <Link href={`/advertiser/dashboard/${campaign.id}`}>
      <div className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card hover:shadow-md hover:border-border/80 transition-all group cursor-pointer">
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
          <Image
            src={campaign.thumbnail}
            alt={campaign.name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full shrink-0", STATUS_DOT[campaign.status])} />
            <h3 className="text-sm font-semibold truncate">{campaign.name}</h3>
            <span className="text-[10px] text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted shrink-0">
              {campaign.objective}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {dates.length}d
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {campaign.zones.length} zone{campaign.zones.length !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              ~{formatNumber(campaign.estimatedImpressions)}
            </span>
            {pop && (
              <span className="flex items-center gap-1">
                <FileCheck className="w-3 h-3" />
                {formatNumber(pop.totalPlays)} plays
              </span>
            )}
          </div>
        </div>

        {/* Right side: cost + status */}
        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-sm font-semibold">{formatGHS(totalCost)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{STATUS_LABEL[campaign.status]}</p>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </div>
    </Link>
  );
}

// ── Page ──

export default function AdvertiserDashboardPage() {
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [search, setSearch] = useState("");

  const totalEstimated = DEMO_CAMPAIGNS.reduce((a, c) => a + c.estimatedImpressions, 0);
  const running = DEMO_CAMPAIGNS.filter((c) => c.status === "running");
  const pending = DEMO_CAMPAIGNS.filter((c) => c.status === "pending");

  const filtered = DEMO_CAMPAIGNS.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statuses: { value: CampaignStatus | "all"; label: string; count: number; dot?: string }[] = [
    { value: "all", label: "All", count: DEMO_CAMPAIGNS.length },
    { value: "running", label: "Live", count: running.length, dot: "bg-green-500" },
    { value: "pending", label: "Pending", count: pending.length, dot: "bg-yellow-500" },
    { value: "completed", label: "Completed", count: DEMO_CAMPAIGNS.filter((c) => c.status === "completed").length, dot: "bg-zinc-400" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8">
        {/* Overview section */}
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">{DEMO_CAMPAIGNS.length}</span> campaigns · <span className="text-foreground font-semibold">~{formatNumber(totalEstimated)}</span> est. impressions
            </p>
          </div>
          <Link
            href="/advertiser/create-ad"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Campaign
          </Link>
        </div>

        {/* Network demand */}
        <div className="mb-6">
          <NetworkDemandCard />
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {/* Status filters */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  statusFilter === s.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s.dot && <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />}
                {s.label}
                <span className="text-muted-foreground ml-0.5">{s.count}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-background text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Campaign list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No campaigns found.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((c) => (
              <CampaignRow key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
