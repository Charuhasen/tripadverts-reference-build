"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Loader2, ArrowRight, Eye, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// ── Data ──

const DEMAND_DATA: Record<string, Record<string, { bookedTaxis: number; activeCampaigns: number }>> = {
  accra: {
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
  },
};

const CITY_CENTERS: Record<string, [number, number]> = {
  accra: [5.6037, -0.187],
};

const COUNTRIES = [
  { value: "ghana", label: "Ghana" },
  { value: "nigeria", label: "Nigeria" },
  { value: "kenya", label: "Kenya" },
];

const CITIES: Record<string, { value: string; label: string }[]> = {
  ghana: [{ value: "accra", label: "Accra" }],
  nigeria: [{ value: "lagos", label: "Lagos" }],
  kenya: [{ value: "nairobi", label: "Nairobi" }],
};

const MEDIUMS = [{ value: "headrest", label: "Headrest" }];

type SortKey = "utilization" | "available" | "impressions" | "name";

function buildZoneDemands(city: string): ZoneDemand[] {
  const zones = getZonesForCity(city);
  const demandMap = DEMAND_DATA[city] ?? {};
  return zones.map((zone) => {
    const data = demandMap[zone.id] ?? { bookedTaxis: 0, activeCampaigns: 0 };
    const utilization = data.bookedTaxis / zone.availableTaxis;
    let demand: DemandLevel = "low";
    if (utilization >= 0.75) demand = "high";
    else if (utilization >= 0.45) demand = "medium";
    return { zone, demand, ...data };
  });
}

const DEMAND_DOT: Record<DemandLevel, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-green-500",
};

const DEMAND_BAR: Record<DemandLevel, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-green-500",
};

// ── Page ──

export default function NetworkDemandPage() {
  const [country, setCountry] = useState("ghana");
  const [city, setCity] = useState("accra");
  const [medium, setMedium] = useState("headrest");
  const [demandFilter, setDemandFilter] = useState<DemandLevel | "all">("all");
  const [sortBy, setSortBy] = useState<SortKey>("utilization");
  const [focusedZone, setFocusedZone] = useState<string | null>(null);

  const allZoneDemands = useMemo(() => buildZoneDemands(city), [city]);

  // Derived stats
  const totalTaxis = allZoneDemands.reduce((s, zd) => s + zd.zone.availableTaxis, 0);
  const bookedTaxis = allZoneDemands.reduce((s, zd) => s + zd.bookedTaxis, 0);
  const utilPct = totalTaxis > 0 ? Math.round((bookedTaxis / totalTaxis) * 100) : 0;
  const center = CITY_CENTERS[city] ?? [5.6037, -0.187];

  // Filtered + sorted zones for sidebar
  const filteredZones = useMemo(() => {
    let list = demandFilter === "all"
      ? [...allZoneDemands]
      : allZoneDemands.filter((zd) => zd.demand === demandFilter);

    list.sort((a, b) => {
      switch (sortBy) {
        case "utilization":
          return (b.bookedTaxis / b.zone.availableTaxis) - (a.bookedTaxis / a.zone.availableTaxis);
        case "available":
          return (b.zone.availableTaxis - b.bookedTaxis) - (a.zone.availableTaxis - a.bookedTaxis);
        case "impressions":
          return b.zone.estimatedDailyImpressions - a.zone.estimatedDailyImpressions;
        case "name":
          return a.zone.name.localeCompare(b.zone.name);
      }
    });

    return list;
  }, [allZoneDemands, demandFilter, sortBy]);

  const handleCountryChange = (val: string) => {
    setCountry(val);
    setCity(CITIES[val]?.[0]?.value ?? "");
    setFocusedZone(null);
  };

  const handleCityChange = (val: string) => {
    setCity(val);
    setFocusedZone(null);
  };

  const demandFilters: { value: DemandLevel | "all"; label: string; dot?: string }[] = [
    { value: "all", label: "All" },
    { value: "high", label: "High", dot: "bg-red-500" },
    { value: "medium", label: "Medium", dot: "bg-amber-400" },
    { value: "low", label: "Available", dot: "bg-green-500" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {/* Top bar: back + stats, then selectors */}
        <div className="mb-5 space-y-2">
          {/* Row 1: back link + inline stats */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Link
              href="/advertiser/dashboard"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            {/* Inline summary */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span><span className="text-foreground font-semibold">{totalTaxis}</span> taxis</span>
              <span><span className="text-foreground font-semibold">{bookedTaxis}</span> booked</span>
              <span className={cn(
                "font-bold px-1.5 py-0.5 rounded text-[10px]",
                utilPct >= 75 ? "bg-red-100 text-red-700" :
                utilPct >= 45 ? "bg-amber-100 text-amber-700" :
                "bg-green-100 text-green-700"
              )}>
                {utilPct}% capacity
              </span>
              <span><span className="text-foreground font-semibold">{allZoneDemands.length}</span> zones</span>
            </div>
          </div>
          {/* Row 2: selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={country} onValueChange={handleCountryChange}>
              <SelectTrigger className="flex-1 min-w-[100px] max-w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={city} onValueChange={handleCityChange}>
              <SelectTrigger className="flex-1 min-w-[100px] max-w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(CITIES[country] ?? []).map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={medium} onValueChange={setMedium}>
              <SelectTrigger className="flex-1 min-w-[100px] max-w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDIUMS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {allZoneDemands.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
            {/* Map — full width on mobile */}
            <div className="rounded-xl overflow-hidden border border-border h-[400px] sm:h-[500px] lg:h-[calc(100vh-12rem)]">
              <NetworkDemandMap
                zoneDemands={allZoneDemands}
                center={center}
                zoom={12}
                focusedZoneId={focusedZone}
              />
            </div>

            {/* Zone sidebar */}
            <div className="border border-border rounded-lg overflow-hidden flex flex-col h-[360px] sm:h-[400px] lg:h-[calc(100vh-12rem)]">
              {/* Sidebar header: filter + sort */}
              <div className="px-3 py-2.5 bg-muted/50 border-b border-border shrink-0 space-y-2">
                {/* Demand filter pills */}
                <div className="flex items-center gap-1">
                  {demandFilters.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => { setDemandFilter(f.value); setFocusedZone(null); }}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer",
                        demandFilter === f.value
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f.dot && <span className={cn("w-1.5 h-1.5 rounded-full", f.dot)} />}
                      {f.label}
                    </button>
                  ))}
                  <div className="flex-1" />
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}
                    className="text-[10px] bg-transparent text-muted-foreground border-none outline-none cursor-pointer"
                  >
                    <option value="utilization">Sort: Utilization</option>
                    <option value="available">Sort: Available</option>
                    <option value="impressions">Sort: Impressions</option>
                    <option value="name">Sort: Name</option>
                  </select>
                </div>
              </div>

              {/* Zone list */}
              <div className="flex-1 overflow-y-auto">
                {filteredZones.length === 0 ? (
                  <div className="text-center py-10 text-xs text-muted-foreground">
                    No zones match this filter.
                  </div>
                ) : (
                  filteredZones.map((zd) => {
                    const pct = Math.round((zd.bookedTaxis / zd.zone.availableTaxis) * 100);
                    const available = zd.zone.availableTaxis - zd.bookedTaxis;
                    const isFocused = focusedZone === zd.zone.id;

                    return (
                      <div
                        key={zd.zone.id}
                        onClick={() => setFocusedZone(isFocused ? null : zd.zone.id)}
                        className={cn(
                          "px-3 py-2.5 border-b border-border last:border-b-0 cursor-pointer transition-colors",
                          isFocused ? "bg-primary/5" : "hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("w-2 h-2 rounded-full shrink-0", DEMAND_DOT[zd.demand])} />
                            <span className={cn("text-sm font-medium", isFocused && "text-primary")}>{zd.zone.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {available} avail
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", DEMAND_BAR[zd.demand])} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-semibold text-muted-foreground w-7 text-right">{pct}%</span>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span>{zd.bookedTaxis}/{zd.zone.availableTaxis} taxis</span>
                          <span>{zd.activeCampaigns} campaign{zd.activeCampaigns !== 1 ? "s" : ""}</span>
                          <span className="flex items-center gap-0.5">
                            <Eye className="w-2.5 h-2.5" />
                            ~{(zd.zone.estimatedDailyImpressions / 1000).toFixed(0)}k/day
                          </span>
                        </div>

                        {/* Book CTA */}
                        {available > 0 && (
                          <Link
                            href="/advertiser/create-ad"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            Book this zone
                            <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground text-sm">
            No zone data available for this selection yet.
          </div>
        )}
      </div>
    </div>
  );
}
