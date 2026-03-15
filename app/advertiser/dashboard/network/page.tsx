"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Loader2, Radio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getZonesForCity } from "@/lib/schemas/campaignData";
import type { ZoneDemand, DemandLevel } from "../components/NetworkDemandMap";

const NetworkDemandMap = dynamic(() => import("../components/NetworkDemandMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-muted/20 rounded-xl">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">Loading map...</span>
    </div>
  ),
});

// ── Demo demand data ──

const ACCRA_ZONES = getZonesForCity("accra");

const ZONE_DEMANDS: ZoneDemand[] = ACCRA_ZONES.map((zone) => {
  const demandMap: Record<string, { bookedTaxis: number; activeCampaigns: number }> = {
    "osu": { bookedTaxis: 48, activeCampaigns: 5 },
    "circle": { bookedTaxis: 55, activeCampaigns: 6 },
    "airport-city": { bookedTaxis: 30, activeCampaigns: 4 },
    "spintex": { bookedTaxis: 32, activeCampaigns: 3 },
    "east-legon": { bookedTaxis: 28, activeCampaigns: 3 },
    "madina": { bookedTaxis: 22, activeCampaigns: 2 },
    "achimota": { bookedTaxis: 14, activeCampaigns: 1 },
    "legon": { bookedTaxis: 8, activeCampaigns: 1 },
    "cantonments": { bookedTaxis: 6, activeCampaigns: 1 },
    "dansoman": { bookedTaxis: 4, activeCampaigns: 0 },
  };

  const data = demandMap[zone.id] ?? { bookedTaxis: 0, activeCampaigns: 0 };
  const utilization = data.bookedTaxis / zone.availableTaxis;
  let demand: DemandLevel = "low";
  if (utilization >= 0.75) demand = "high";
  else if (utilization >= 0.45) demand = "medium";

  return { zone, demand, ...data };
});

const networkTotalTaxis = ACCRA_ZONES.reduce((s, z) => s + z.availableTaxis, 0);
const networkBookedTaxis = ZONE_DEMANDS.reduce((s, zd) => s + zd.bookedTaxis, 0);
const networkUtilization = Math.round((networkBookedTaxis / networkTotalTaxis) * 100);
const highDemandCount = ZONE_DEMANDS.filter((zd) => zd.demand === "high").length;
const mediumDemandCount = ZONE_DEMANDS.filter((zd) => zd.demand === "medium").length;
const lowDemandCount = ZONE_DEMANDS.filter((zd) => zd.demand === "low").length;

function formatNumber(n: number) {
  return n.toLocaleString();
}

export default function NetworkDemandPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/advertiser/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Network Demand — Accra</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live availability across all geofence zones in the Accra network
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Taxis</p>
              <p className="text-2xl font-bold mt-1">{formatNumber(networkTotalTaxis)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">across {ACCRA_ZONES.length} zones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Booked</p>
              <p className="text-2xl font-bold mt-1">{formatNumber(networkBookedTaxis)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{networkTotalTaxis - networkBookedTaxis} available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Capacity</p>
              <p className="text-2xl font-bold mt-1">{networkUtilization}%</p>
              <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    networkUtilization >= 75 ? "bg-red-500" :
                    networkUtilization >= 45 ? "bg-amber-400" :
                    "bg-green-500"
                  )}
                  style={{ width: `${networkUtilization}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Zone Breakdown</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> {highDemandCount} high
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> {mediumDemandCount} med
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> {lowDemandCount} low
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden flex">
                <div className="h-full bg-red-500" style={{ width: `${(highDemandCount / ZONE_DEMANDS.length) * 100}%` }} />
                <div className="h-full bg-amber-400" style={{ width: `${(mediumDemandCount / ZONE_DEMANDS.length) * 100}%` }} />
                <div className="h-full bg-green-500" style={{ width: `${(lowDemandCount / ZONE_DEMANDS.length) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map + zone list */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
          <div className="rounded-xl overflow-hidden border border-border h-[600px]">
            <NetworkDemandMap
              zoneDemands={ZONE_DEMANDS}
              center={[5.6037, -0.1870]}
              zoom={12}
            />
          </div>

          <div className="border border-border rounded-lg overflow-hidden flex flex-col h-[600px]">
            <div className="px-3 py-2.5 bg-muted/50 border-b border-border shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Zone Availability
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {[...ZONE_DEMANDS]
                .sort((a, b) => (b.bookedTaxis / b.zone.availableTaxis) - (a.bookedTaxis / a.zone.availableTaxis))
                .map((zd) => {
                  const pct = Math.round((zd.bookedTaxis / zd.zone.availableTaxis) * 100);
                  const available = zd.zone.availableTaxis - zd.bookedTaxis;
                  const barColor =
                    zd.demand === "high" ? "bg-red-500" :
                    zd.demand === "medium" ? "bg-amber-400" :
                    "bg-green-500";
                  return (
                    <div key={zd.zone.id} className="px-3 py-2.5 border-b border-border last:border-b-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{zd.zone.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {available} available
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", barColor)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {zd.bookedTaxis}/{zd.zone.availableTaxis} taxis · {zd.activeCampaigns} campaign{zd.activeCampaigns !== 1 ? "s" : ""}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
