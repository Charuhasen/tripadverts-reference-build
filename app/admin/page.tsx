"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Users,
  Car,
  Tablet,
  Radio,
  Wallet,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wifi,
  WifiOff,
  Loader2,
  Building2,
  User,
  TrendingUp,
  TrendingDown,
  BarChart2,
  MapPin,
  AlertTriangle,
  Repeat2,
  CheckCircle,
  Timer,
  Megaphone,
  Layers,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEMO_FLEETS,
  FLEET_DRIVERS,
  INDIVIDUAL_DRIVERS,
  PAYOUT_RECORDS,
  getAdminStats,
  type Fleet,
  type PayoutRecord,
  type PayoutStatus,
} from "@/lib/admin-data";
import { DEMO_CAMPAIGNS, calcCampaignCost } from "@/lib/demo-campaigns";
import { getDayType, getHourRate } from "@/lib/pricing";
import type { AdminDriverMarker } from "./components/AdminMap";

// ── Dynamic map import (SSR disabled for Leaflet) ──

const AdminMap = dynamic(() => import("./components/AdminMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/20">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">Loading map…</span>
    </div>
  ),
});

// ── Helpers ──

function formatGHS(n: number) {
  return `GH₵ ${n.toLocaleString()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatLastSeen(iso: string) {
  const d = new Date(iso);
  const now = new Date("2026-03-16T09:15:00");
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 2) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return formatDate(iso);
}

// ── Sub-components ──

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: "green" | "amber" | "red" | "blue";
}) {
  const accentClass = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  }[accent ?? "blue"] ?? "bg-primary/10 text-primary";

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold mt-0.5">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", accentClass)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
    </div>
  );
}

// ── Drivers Tab ──

function DriversTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "offline">("all");

  const filtered = INDIVIDUAL_DRIVERS.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.plate.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {(["all", "active", "offline"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize",
                statusFilter === s
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s !== "all" && (
                <span className={cn("w-1.5 h-1.5 rounded-full", s === "active" ? "bg-green-500" : "bg-zinc-400")} />
              )}
              {s === "all" ? `All (${INDIVIDUAL_DRIVERS.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${INDIVIDUAL_DRIVERS.filter((d) => d.status === s).length})`}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or plate…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-56 pl-8 pr-3 rounded-lg border border-border bg-background text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Driver</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Plate / Vehicle</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Zone</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Tablet</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Pending Payout</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr
                key={d.id}
                className={cn(
                  "border-b border-border last:border-0 hover:bg-muted/20 transition-colors",
                  i % 2 === 0 ? "bg-card" : "bg-background"
                )}
              >
                <td className="px-4 py-3">
                  <p className="font-medium">{d.name}</p>
                  <p className="text-muted-foreground">{d.phone}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-mono">{d.plate}</p>
                  <p className="text-muted-foreground">{d.vehicle}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{d.zone}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium",
                    d.status === "active" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", d.status === "active" ? "bg-green-500" : "bg-zinc-400")} />
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {d.tabletOnline ? (
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <Wifi className="w-3 h-3" /> Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-zinc-400">
                      <WifiOff className="w-3 h-3" /> Offline
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {d.pendingPayout > 0 ? formatGHS(d.pendingPayout) : <span className="text-muted-foreground font-normal">—</span>}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                  {formatDate(d.joinedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-sm text-muted-foreground">No drivers found.</div>
        )}
      </div>
    </div>
  );
}

// ── Fleets Tab ──

function FleetsTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-6" />
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Fleet</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Owner</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Drivers</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Active</th>
            <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Pending Payout</th>
            <th className="text-right px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Last Payout</th>
            <th className="text-right px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Joined</th>
          </tr>
        </thead>
        <tbody>
          {DEMO_FLEETS.map((fleet: Fleet, i) => {
            const isExpanded = expandedId === fleet.id;
            const fleetDrivers = FLEET_DRIVERS.filter((d) => d.fleetId === fleet.id);
            return (
              <React.Fragment key={fleet.id}>
                <tr
                  className={cn(
                    "border-b border-border hover:bg-muted/20 transition-colors cursor-pointer",
                    isExpanded ? "bg-primary/5" : i % 2 === 0 ? "bg-card" : "bg-background"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : fleet.id)}
                >
                  <td className="px-4 py-3">
                    <ChevronRight className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{fleet.name}</p>
                    <p className="text-muted-foreground">{fleet.city}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{fleet.owner}</p>
                    <p className="text-muted-foreground">{fleet.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">{fleet.driverCount}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {fleet.activeCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatGHS(fleet.pendingPayout)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                    {formatGHS(fleet.lastPayout.amount)} · {formatDate(fleet.lastPayout.date)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                    {formatDate(fleet.joinedAt)}
                  </td>
                </tr>

                {/* Expanded fleet drivers */}
                {isExpanded && (
                  <tr className="border-b border-border bg-primary/5">
                    <td colSpan={8} className="px-4 pb-3 pt-1">
                      <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border bg-muted/40">
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Driver</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Plate</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Zone</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th>
                              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Tablet</th>
                              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Last Seen</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fleetDrivers.map((d) => (
                              <tr key={d.id} className="border-b border-border last:border-0 bg-card">
                                <td className="px-3 py-2 font-medium">{d.name}</td>
                                <td className="px-3 py-2 font-mono text-muted-foreground">{d.plate}</td>
                                <td className="px-3 py-2 text-muted-foreground">{d.zone}</td>
                                <td className="px-3 py-2">
                                  <span className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium",
                                    d.status === "active" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                                  )}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full", d.status === "active" ? "bg-green-500" : "bg-zinc-400")} />
                                    {d.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  {d.tabletOnline ? (
                                    <span className="inline-flex items-center gap-1 text-green-700">
                                      <Wifi className="w-3 h-3" /> Online
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-zinc-400">
                                      <WifiOff className="w-3 h-3" /> Offline
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-right text-muted-foreground">{formatLastSeen(d.lastSeen)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Payouts Tab ──

const PAYOUT_STATUS_CONFIG: Record<PayoutStatus, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: "Pending",   icon: Clock,         className: "bg-amber-100 text-amber-700" },
  paid:    { label: "Paid",      icon: CheckCircle2,  className: "bg-green-100 text-green-700" },
  failed:  { label: "Failed",    icon: AlertCircle,   className: "bg-red-100 text-red-700" },
};

function PayoutsTab() {
  const [filter, setFilter] = useState<PayoutStatus | "all">("all");
  const [search, setSearch] = useState("");

  const pendingTotal = PAYOUT_RECORDS.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);

  const filtered = PAYOUT_RECORDS.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.recipientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: PAYOUT_RECORDS.length,
    pending: PAYOUT_RECORDS.filter((p) => p.status === "pending").length,
    paid: PAYOUT_RECORDS.filter((p) => p.status === "paid").length,
    failed: PAYOUT_RECORDS.filter((p) => p.status === "failed").length,
  };

  return (
    <div>
      {/* Pending payout summary */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-amber-800">{counts.pending} pending payouts · Mar 1–15, 2026</p>
          <p className="text-lg font-bold text-amber-900 mt-0.5">{formatGHS(pendingTotal)}</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors cursor-pointer">
          Process All
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {(["all", "pending", "paid", "failed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize",
                filter === s
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "all" ? `All (${counts.all})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s]})`}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-48 pl-8 pr-3 rounded-lg border border-border bg-background text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Recipient</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Period</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Amount</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Date</th>
              <th className="w-20 px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: PayoutRecord, i) => {
              const cfg = PAYOUT_STATUS_CONFIG[p.status];
              const StatusIcon = cfg.icon;
              return (
                <tr
                  key={p.id}
                  className={cn(
                    "border-b border-border last:border-0 hover:bg-muted/20 transition-colors",
                    i % 2 === 0 ? "bg-card" : "bg-background"
                  )}
                >
                  <td className="px-4 py-3 font-medium">{p.recipientName}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium",
                      p.type === "fleet" ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
                    )}>
                      {p.type === "fleet" ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.period}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatGHS(p.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium", cfg.className)}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{formatDate(p.date)}</td>
                  <td className="px-4 py-3 text-right">
                    {p.status === "pending" && (
                      <button className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                        Pay
                      </button>
                    )}
                    {p.status === "failed" && (
                      <button className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-[11px] font-medium hover:bg-red-200 transition-colors cursor-pointer">
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-sm text-muted-foreground">No payouts found.</div>
        )}
      </div>
    </div>
  );
}

// ── Tablets Tab ──

function TabletsTab() {
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");

  const allTablets = useMemo(() => [
    ...INDIVIDUAL_DRIVERS.map((d) => ({
      id: `tab-${d.id}`,
      driverName: d.name,
      plate: d.plate,
      fleetName: undefined as string | undefined,
      online: d.tabletOnline,
      lastSeen: d.lastSeen,
      zone: d.zone,
    })),
    ...FLEET_DRIVERS.map((d) => ({
      id: `tab-${d.id}`,
      driverName: d.name,
      plate: d.plate,
      fleetName: d.fleetName,
      online: d.tabletOnline,
      lastSeen: d.lastSeen,
      zone: d.zone,
    })),
  ], []);

  const totalOnline = allTablets.filter((t) => t.online).length;
  const totalOffline = allTablets.filter((t) => !t.online).length;
  const uptimePct = Math.round((totalOnline / allTablets.length) * 100);

  const filtered = allTablets.filter((t) => {
    if (filter === "online") return t.online;
    if (filter === "offline") return !t.online;
    return true;
  });

  return (
    <div>
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
          <p className="text-xl font-bold text-green-600">{totalOnline}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Online</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
          <p className="text-xl font-bold text-zinc-400">{totalOffline}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Offline</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
          <p className={cn("text-xl font-bold", uptimePct >= 75 ? "text-green-600" : uptimePct >= 50 ? "text-amber-600" : "text-red-600")}>
            {uptimePct}%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Uptime</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 mb-4 w-fit">
        {(["all", "online", "offline"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
              filter === s
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {" "}({s === "all" ? allTablets.length : s === "online" ? totalOnline : totalOffline})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((t) => (
          <div
            key={t.id}
            className={cn(
              "rounded-xl border px-4 py-3 flex items-start gap-3",
              t.online ? "border-green-200 bg-green-50/40" : "border-border bg-card"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
              t.online ? "bg-green-100" : "bg-muted"
            )}>
              <Tablet className={cn("w-4 h-4", t.online ? "text-green-600" : "text-muted-foreground")} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{t.driverName}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{t.plate}</p>
              {t.fleetName && (
                <p className="text-[11px] text-muted-foreground truncate">{t.fleetName}</p>
              )}
              <p className="text-[11px] text-muted-foreground mt-0.5">{t.zone}</p>
              <div className="flex items-center gap-1 mt-1.5">
                {t.online ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700">
                    <Wifi className="w-3 h-3" /> Online · {formatLastSeen(t.lastSeen)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                    <WifiOff className="w-3 h-3" /> Last seen {formatLastSeen(t.lastSeen)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shared constants ──

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  running:   "bg-blue-100 text-blue-700",
  pending:   "bg-amber-100 text-amber-700",
};

const OBJ_COLORS: Record<string, string> = {
  promotion:  "bg-pink-500",
  awareness:  "bg-sky-500",
  engagement: "bg-violet-500",
};

const OBJ_BADGE: Record<string, string> = {
  promotion:  "bg-pink-50 text-pink-700",
  awareness:  "bg-sky-50 text-sky-700",
  engagement: "bg-violet-50 text-violet-700",
};

const ADMIN_TODAY = "2026-03-19";

function MiniBar({ pct, color = "bg-primary" }: { pct: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground w-7 text-right">{pct}%</span>
    </div>
  );
}

// ── Campaigns Tab ──

function CampaignsTab() {
  const [statusFilter, setStatusFilter] = useState<"all" | "running" | "pending" | "completed">("all");

  const campaignsWithCost = useMemo(
    () => DEMO_CAMPAIGNS.map((c) => ({ ...c, cost: calcCampaignCost(c) })),
    []
  );

  const counts = {
    all:       campaignsWithCost.length,
    running:   campaignsWithCost.filter((c) => c.status === "running").length,
    pending:   campaignsWithCost.filter((c) => c.status === "pending").length,
    completed: campaignsWithCost.filter((c) => c.status === "completed").length,
  };

  const sorted = useMemo(() => {
    const order = { running: 0, pending: 1, completed: 2 };
    return campaignsWithCost
      .filter((c) => statusFilter === "all" || c.status === statusFilter)
      .sort((a, b) => order[a.status] - order[b.status]);
  }, [campaignsWithCost, statusFilter]);

  const today = new Date(ADMIN_TODAY + "T00:00:00");

  function daysUntil(dateStr: string) {
    return Math.round(
      (new Date(dateStr + "T00:00:00").getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  const STATUS_DOT: Record<string, string> = {
    running: "bg-blue-500", pending: "bg-amber-400", completed: "bg-green-500",
  };

  return (
    <div>
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 mb-4 w-fit">
        {(["all", "running", "pending", "completed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize",
              statusFilter === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s !== "all" && <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[s])} />}
            {s === "all" ? `All (${counts.all})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s]})`}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Campaign</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Advertiser</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Zones</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Cost</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground hidden lg:table-cell">Impressions</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Fulfillment</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => {
              const firstSlot = c.bookingSlots[0]?.date;
              const lastSlot  = c.bookingSlots[c.bookingSlots.length - 1]?.date;
              const d = firstSlot ? daysUntil(firstSlot) : null;
              const fulfillment = c.proofOfPlay
                ? Math.round((c.proofOfPlay.estimatedImpressions / c.estimatedImpressions) * 100)
                : null;
              return (
                <tr key={c.id} className={cn(
                  "border-b border-border last:border-0 hover:bg-muted/20 transition-colors",
                  i % 2 === 0 ? "bg-card" : "bg-background"
                )}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium capitalize", OBJ_BADGE[c.objective])}>
                        {c.objective}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{c.adType}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.advertiser}</p>
                    <span className={cn(
                      "inline-flex items-center gap-0.5 text-[10px] font-medium",
                      c.advertiserType === "business" ? "text-blue-600" : "text-purple-600"
                    )}>
                      {c.advertiserType === "business"
                        ? <Building2 className="w-2.5 h-2.5" />
                        : <User className="w-2.5 h-2.5" />}
                      {c.advertiserType === "business" ? "Business" : "Sole Trader"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {c.zones.map((z) => z.name).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-[11px]", STATUS_COLORS[c.status])}>
                      {c.status}
                    </span>
                    {c.status === "pending" && d !== null && d >= 0 && d <= 5 && (
                      <p className="text-[10px] text-red-600 font-semibold mt-0.5">starts in {d}d !</p>
                    )}
                    {c.status === "running" && firstSlot && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{firstSlot} → {lastSlot}</p>
                    )}
                    {c.status === "completed" && lastSlot && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">ended {lastSlot}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold hidden sm:table-cell">
                    {formatGHS(c.cost)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">
                    ~{(c.estimatedImpressions / 1000).toFixed(0)}k
                  </td>
                  <td className="px-4 py-3 text-right">
                    {fulfillment !== null
                      ? <span className={cn("font-bold", fulfillment >= 95 ? "text-green-600" : "text-amber-600")}>{fulfillment}%</span>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Alerts Panel ──

function buildAlerts() {
  type AdminAlert = { id: string; severity: "high" | "medium"; title: string; body: string; };
  const alerts: AdminAlert[] = [];
  const today = new Date(ADMIN_TODAY + "T00:00:00");

  // Active drivers with offline tablet — inventory not being delivered
  const leaking = [
    ...FLEET_DRIVERS.filter((d) => d.status === "active" && !d.tabletOnline),
    ...INDIVIDUAL_DRIVERS.filter((d) => d.status === "active" && !d.tabletOnline),
  ];
  if (leaking.length > 0) {
    alerts.push({
      id: "tablet-leak",
      severity: "high",
      title: `${leaking.length} active driver${leaking.length > 1 ? "s" : ""} with offline tablet — inventory not delivered`,
      body: `${leaking.map((d) => d.name).join(", ")}. Every offline tablet is a revenue leak and a delivery shortfall to advertisers.`,
    });
  }

  // Failed payouts
  const failedPayouts = PAYOUT_RECORDS.filter((p) => p.status === "failed");
  if (failedPayouts.length > 0) {
    const total = failedPayouts.reduce((s, p) => s + p.amount, 0);
    alerts.push({
      id: "failed-payouts",
      severity: "high",
      title: `${failedPayouts.length} failed payout${failedPayouts.length > 1 ? "s" : ""} totalling ${formatGHS(total)}`,
      body: `${failedPayouts.map((p) => p.recipientName).join(", ")}. Unpaid drivers reduce fleet reliability and cause churn.`,
    });
  }

  // Pending campaigns starting within 5 days — need approval
  const soonPending = DEMO_CAMPAIGNS.filter((c) => {
    if (c.status !== "pending") return false;
    const d = Math.round(
      (new Date(c.bookingSlots[0].date + "T00:00:00").getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return d >= 0 && d <= 5;
  });
  for (const c of soonPending) {
    const d = Math.round(
      (new Date(c.bookingSlots[0].date + "T00:00:00").getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    alerts.push({
      id: `pending-soon-${c.id}`,
      severity: "high",
      title: `"${c.name}" starts in ${d} day${d !== 1 ? "s" : ""} — still pending approval`,
      body: `${c.advertiser} · ${c.zones.length} zone${c.zones.length > 1 ? "s" : ""}. Approve or notify advertiser before go-live.`,
    });
  }

  // Low fleet active rate (< 50%)
  const lowFleets = DEMO_FLEETS.filter((f) => f.driverCount > 0 && f.activeCount / f.driverCount < 0.5);
  for (const f of lowFleets) {
    alerts.push({
      id: `low-fleet-${f.id}`,
      severity: "medium",
      title: `${f.name}: ${f.activeCount}/${f.driverCount} drivers active (${Math.round((f.activeCount / f.driverCount) * 100)}%)`,
      body: `Low fleet activity reduces zone coverage. Investigate with fleet owner ${f.owner}.`,
    });
  }

  // At-risk advertisers: completed a campaign 14+ days ago, no follow-up booking
  const advertiserFollowUp = new Set(
    DEMO_CAMPAIGNS.filter((c) => c.status !== "completed").map((c) => c.advertiser)
  );
  const advertiserCampaignCount = new Map<string, number>();
  for (const c of DEMO_CAMPAIGNS) {
    advertiserCampaignCount.set(c.advertiser, (advertiserCampaignCount.get(c.advertiser) ?? 0) + 1);
  }
  const atRiskNames = [...new Set(
    DEMO_CAMPAIGNS
      .filter((c) => {
        if (c.status !== "completed") return false;
        if (advertiserFollowUp.has(c.advertiser)) return false;
        if ((advertiserCampaignCount.get(c.advertiser) ?? 0) > 1) return false;
        const lastSlot = c.bookingSlots[c.bookingSlots.length - 1].date;
        const daysSince = Math.round(
          (today.getTime() - new Date(lastSlot + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSince >= 14;
      })
      .map((c) => c.advertiser)
  )];
  if (atRiskNames.length > 0) {
    alerts.push({
      id: "churn-risk",
      severity: "medium",
      title: `${atRiskNames.length} advertiser${atRiskNames.length > 1 ? "s" : ""} at churn risk — no re-booking after completed campaign`,
      body: `${atRiskNames.join(", ")}. Reach out to convert first-time buyers into repeat customers.`,
    });
  }

  return alerts;
}

function AlertsPanel() {
  const alerts = useMemo(() => buildAlerts(), []);
  if (alerts.length === 0) return null;

  const highCount = alerts.filter((a) => a.severity === "high").length;

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <h2 className="text-sm font-semibold">Action Items</h2>
        {highCount > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">{highCount} urgent</span>
        )}
        {alerts.length - highCount > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">{alerts.length - highCount} medium</span>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "rounded-xl border px-4 py-3 flex items-start gap-3",
              alert.severity === "high" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
              alert.severity === "high" ? "bg-red-100" : "bg-amber-100"
            )}>
              <AlertTriangle className={cn("w-3.5 h-3.5", alert.severity === "high" ? "text-red-600" : "text-amber-600")} />
            </div>
            <div className="min-w-0">
              <p className={cn("text-xs font-semibold", alert.severity === "high" ? "text-red-800" : "text-amber-800")}>
                {alert.title}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{alert.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Operations Tab (map + tablets) ──

function OperationsTab() {
  const [view, setView] = useState<"map" | "tablets">("map");

  const mapDrivers: AdminDriverMarker[] = useMemo(
    () => [
      ...INDIVIDUAL_DRIVERS.map((d) => ({
        id: d.id, name: d.name, plate: d.plate, status: d.status,
        lat: d.lat, lng: d.lng, zone: d.zone, type: "individual" as const,
      })),
      ...FLEET_DRIVERS.map((d) => ({
        id: d.id, name: d.name, plate: d.plate, status: d.status,
        lat: d.lat, lng: d.lng, zone: d.zone, type: "fleet" as const, fleetName: d.fleetName,
      })),
    ],
    []
  );

  return (
    <div>
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 mb-4 w-fit">
        <button
          onClick={() => setView("map")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
            view === "map" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Navigation className="w-3.5 h-3.5" /> Live Map
        </button>
        <button
          onClick={() => setView("tablets")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
            view === "tablets" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Tablet className="w-3.5 h-3.5" /> Tablets
        </button>
      </div>

      {view === "map" && (
        <div className="rounded-xl border border-border overflow-hidden" style={{ height: 520 }}>
          <AdminMap drivers={mapDrivers} />
        </div>
      )}
      {view === "tablets" && <TabletsTab />}
    </div>
  );
}

// ── Analytics Tab ──

function AnalyticsTab() {
  const stats = getAdminStats();

  const campaignsWithCost = useMemo(
    () => DEMO_CAMPAIGNS.map((c) => ({ ...c, cost: calcCampaignCost(c) })),
    []
  );

  // ── Revenue totals ──
  const totalRevenue     = campaignsWithCost.reduce((s, c) => s + c.cost, 0);
  const realizedRevenue  = campaignsWithCost.filter((c) => c.status === "completed").reduce((s, c) => s + c.cost, 0);
  const pipelineRevenue  = campaignsWithCost.filter((c) => c.status !== "completed").reduce((s, c) => s + c.cost, 0);
  const totalImpressions = campaignsWithCost.reduce((s, c) => s + c.estimatedImpressions, 0);
  const cpm              = Math.round((realizedRevenue / campaignsWithCost.filter((c) => c.status === "completed").reduce((s, c) => s + c.estimatedImpressions, 0)) * 1000);

  // ── Monthly buckets & MoM growth ──
  const monthMap: Record<string, { realized: number; pipeline: number }> = {};
  for (const c of campaignsWithCost) {
    const m = c.createdAt.slice(0, 7);
    if (!monthMap[m]) monthMap[m] = { realized: 0, pipeline: 0 };
    if (c.status === "completed") monthMap[m].realized += c.cost;
    else monthMap[m].pipeline += c.cost;
  }
  const months = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b));
  const maxMonthRev = Math.max(...months.map(([, v]) => v.realized + v.pipeline));
  const lastTwo = months.slice(-2);
  const momGrowth = lastTwo.length === 2
    ? ((lastTwo[1][1].realized + lastTwo[1][1].pipeline) - (lastTwo[0][1].realized + lastTwo[0][1].pipeline))
      / (lastTwo[0][1].realized + lastTwo[0][1].pipeline) * 100
    : null;

  // ── RevPASH: revenue per available screen-hour ──
  // Estimate period as days between earliest campaign and today
  const allDates = DEMO_CAMPAIGNS.map((c) => c.createdAt).sort();
  const periodDays = Math.max(1, Math.round(
    (new Date("2026-03-19").getTime() - new Date(allDates[0]).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const operatingHrsPerDay = 16; // 06:00–22:00
  const availableScreenHrs = stats.tabletsTotal * operatingHrsPerDay * periodDays;
  const revpash = +(realizedRevenue / availableScreenHrs).toFixed(2);
  const revpashPerDay = +(realizedRevenue / (stats.tabletsTotal * periodDays)).toFixed(2);

  // ── Rate tier breakdown (DOOH-specific: peak vs off-peak sell-through) ──
  const tierRev: Record<string, number> = { peak: 0, "off-peak": 0, "fri-night": 0, "sat-night": 0 };
  for (const c of campaignsWithCost) {
    for (const slot of c.bookingSlots) {
      const dayType = getDayType(slot.date);
      const startH = parseInt(slot.startTime.split(":")[0], 10);
      let endH = parseInt(slot.endTime.split(":")[0], 10);
      if (slot.endTime === "23:59" || slot.endTime === "24:00") endH = 24;
      else if (parseInt(slot.endTime.split(":")[1], 10) > 0) endH += 1;
      for (let h = startH; h < endH; h++) {
        const { rate, tier } = getHourRate(h, dayType);
        tierRev[tier] = (tierRev[tier] ?? 0) + rate * c.zones.length;
      }
    }
  }
  const totalTierRev = Object.values(tierRev).reduce((s, v) => s + v, 0);
  const peakRevPct   = Math.round(((tierRev.peak + tierRev["fri-night"] + tierRev["sat-night"]) / totalTierRev) * 100);
  const tierEntries  = [
    { label: "Peak (commute)", key: "peak",      color: "bg-orange-500", rev: tierRev.peak },
    { label: "Fri/Sat Night",  key: "fri-night", color: "bg-pink-500",   rev: tierRev["fri-night"] + tierRev["sat-night"] },
    { label: "Off-Peak",       key: "off-peak",  color: "bg-muted-foreground/40", rev: tierRev["off-peak"] },
  ].sort((a, b) => b.rev - a.rev);
  const maxTierRev = tierEntries[0]?.rev ?? 1;

  // ── Advertiser table ──
  type CustomerRow = {
    advertiser: string;
    advertiserType: "business" | "sole";
    totalSpend: number;
    campaignCount: number;
    statuses: string[];
    regions: string[];
    avgLeadDays: number;
  };
  const customerMap = new Map<string, CustomerRow>();
  for (const c of campaignsWithCost) {
    const cities = [...new Set(c.zones.map((z) => z.city))];
    const leadDays = Math.round(
      (new Date(c.bookingSlots[0].date + "T00:00:00").getTime() - new Date(c.createdAt + "T00:00:00").getTime())
      / (1000 * 60 * 60 * 24)
    );
    const existing = customerMap.get(c.advertiser);
    if (existing) {
      existing.totalSpend    += c.cost;
      existing.campaignCount += 1;
      existing.statuses.push(c.status);
      existing.avgLeadDays    = Math.round((existing.avgLeadDays + leadDays) / 2);
      for (const city of cities) if (!existing.regions.includes(city)) existing.regions.push(city);
    } else {
      customerMap.set(c.advertiser, {
        advertiser: c.advertiser,
        advertiserType: c.advertiserType,
        totalSpend: c.cost,
        campaignCount: 1,
        statuses: [c.status],
        regions: cities,
        avgLeadDays: leadDays,
      });
    }
  }
  const topCustomers   = [...customerMap.values()].sort((a, b) => b.totalSpend - a.totalSpend);
  const returningCount = topCustomers.filter((c) => c.campaignCount > 1).length;
  const repeatRate     = Math.round((returningCount / customerMap.size) * 100);

  // ── Revenue concentration (top-3 share = fragility signal) ──
  const top3Spend = topCustomers.slice(0, 3).reduce((s, c) => s + c.totalSpend, 0);
  const top3Pct   = Math.round((top3Spend / totalRevenue) * 100);
  const concentrationRisk = top3Pct >= 70 ? "high" : top3Pct >= 50 ? "medium" : "low";

  // ── Avg booking lead time ──
  const avgLeadTime = Math.round(
    campaignsWithCost.reduce((s, c) => {
      return s + Math.round(
        (new Date(c.bookingSlots[0].date + "T00:00:00").getTime() - new Date(c.createdAt + "T00:00:00").getTime())
        / (1000 * 60 * 60 * 24)
      );
    }, 0) / campaignsWithCost.length
  );

  // ── Delivery fulfillment (completed campaigns with PoP) ──
  const completedWithPoP = campaignsWithCost.filter((c) => c.status === "completed" && c.proofOfPlay);
  const avgFulfillment   = completedWithPoP.length > 0
    ? Math.round(
        completedWithPoP.reduce((s, c) =>
          s + (c.proofOfPlay!.estimatedImpressions / c.estimatedImpressions) * 100, 0
        ) / completedWithPoP.length
      )
    : null;

  // ── Revenue by region ──
  const regionMap: Record<string, number> = {};
  for (const c of campaignsWithCost) {
    const cities = [...new Set(c.zones.map((z) => z.city))];
    const share = c.cost / cities.length;
    for (const city of cities) regionMap[city] = (regionMap[city] ?? 0) + share;
  }
  const regionRevs = Object.entries(regionMap)
    .map(([city, rev]) => ({ city, rev: Math.round(rev) }))
    .sort((a, b) => b.rev - a.rev);
  const maxRegionRev = regionRevs[0]?.rev ?? 1;

  // ── Revenue by objective ──
  const objectiveMap: Record<string, number> = {};
  for (const c of campaignsWithCost) {
    objectiveMap[c.objective] = (objectiveMap[c.objective] ?? 0) + c.cost;
  }
  const objectiveRevs = Object.entries(objectiveMap)
    .map(([obj, rev]) => ({ obj, rev }))
    .sort((a, b) => b.rev - a.rev);
  const maxObjRev = objectiveRevs[0]?.rev ?? 1;

  // ── Business vs Sole ──
  const businessRev = campaignsWithCost.filter((c) => c.advertiserType === "business").reduce((s, c) => s + c.cost, 0);
  const soleRev     = campaignsWithCost.filter((c) => c.advertiserType === "sole").reduce((s, c) => s + c.cost, 0);
  const businessPct = Math.round((businessRev / totalRevenue) * 100);

  const concentrationColors = { high: "text-red-600 bg-red-50 border-red-200", medium: "text-amber-700 bg-amber-50 border-amber-200", low: "text-green-700 bg-green-50 border-green-200" };

  return (
    <div className="space-y-6">

      {/* ── Row 1: Growth Pulse KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          icon={momGrowth !== null && momGrowth >= 0 ? TrendingUp : TrendingDown}
          label="MoM Revenue"
          value={momGrowth !== null ? `${momGrowth >= 0 ? "+" : ""}${momGrowth.toFixed(0)}%` : "—"}
          sub={`vs prior month`}
          accent={momGrowth === null ? "blue" : momGrowth >= 8 ? "green" : momGrowth >= 0 ? "amber" : "red"}
        />
        <StatCard icon={Clock}      label="Pipeline Value"  value={formatGHS(pipelineRevenue)}  sub="pending + running"          accent="amber" />
        <StatCard icon={Repeat2}    label="Repeat Rate"     value={`${repeatRate}%`}            sub={`${returningCount} of ${customerMap.size} advertisers`} accent={repeatRate >= 40 ? "green" : "amber"} />
        <StatCard icon={Timer}      label="Avg Lead Time"   value={`${avgLeadTime}d`}           sub="booking to go-live"         accent="blue"  />
        <StatCard icon={CheckCircle} label="Fulfillment"    value={avgFulfillment !== null ? `${avgFulfillment}%` : "—"} sub="delivery vs contracted" accent={avgFulfillment === null ? "blue" : avgFulfillment >= 95 ? "green" : "amber"} />
      </div>

      {/* ── Row 2: Revenue Trend + Rate Tier Mix ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">

        {/* Monthly revenue — realized vs pipeline with MoM annotations */}
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold">Monthly Revenue</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Realized vs pipeline by campaign creation month</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Realized</p>
              <p className="text-sm font-bold">{formatGHS(realizedRevenue)}</p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-36">
            {months.map(([month, { realized, pipeline }], idx) => {
              const total   = realized + pipeline;
              const barH    = Math.max(4, Math.round((total / maxMonthRev) * 108));
              const prevRev = idx > 0 ? months[idx - 1][1].realized + months[idx - 1][1].pipeline : null;
              const mom     = prevRev ? Math.round(((total - prevRev) / prevRev) * 100) : null;
              const label   = new Date(month + "-02").toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  {mom !== null && (
                    <span className={cn("text-[10px] font-semibold", mom >= 0 ? "text-green-600" : "text-red-500")}>
                      {mom >= 0 ? "+" : ""}{mom}%
                    </span>
                  )}
                  {mom === null && <span className="text-[10px] text-transparent">·</span>}
                  <div className="w-full flex flex-col rounded-t-sm overflow-hidden" style={{ height: `${barH}px` }}>
                    {pipeline > 0 && (
                      <div className="w-full bg-amber-300/70" style={{ height: `${Math.round((pipeline / total) * barH)}px` }} />
                    )}
                    <div className="w-full bg-primary/80 flex-1" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded-sm bg-primary/80 inline-block" /> Realized</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded-sm bg-amber-300/70 inline-block" /> Pipeline</span>
          </div>
        </div>

        {/* Rate tier mix — peak sell-through is the DOOH efficiency metric */}
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <div className="mb-5">
            <h3 className="text-sm font-semibold">Inventory Tier Mix</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Revenue by pricing tier — target ≥ 50% peak</p>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-px">
            {tierEntries.map((t) => (
              <div key={t.key} className={cn(t.color)} style={{ width: `${Math.round((t.rev / totalTierRev) * 100)}%` }} />
            ))}
          </div>
          <div className="space-y-3">
            {tierEntries.map((t) => {
              const pct = Math.round((t.rev / totalTierRev) * 100);
              return (
                <div key={t.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("w-2 h-2 rounded-full", t.color)} />
                      <span className="text-xs font-medium">{t.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatGHS(t.rev)}</span>
                  </div>
                  <MiniBar pct={pct} color={t.color} />
                </div>
              );
            })}
          </div>
          <div className={cn(
            "mt-4 rounded-lg border px-3 py-2 text-[11px] font-medium",
            peakRevPct >= 50 ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"
          )}>
            {peakRevPct >= 50
              ? `${peakRevPct}% premium inventory sold — strong yield`
              : `Only ${peakRevPct}% premium sold — push peak-hour bookings`}
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-[11px] text-muted-foreground">RevPASH</p>
            <p className="text-sm font-bold">{formatGHS(revpash)}<span className="text-[11px] font-normal text-muted-foreground"> / screen-hr</span></p>
            <p className="text-[11px] text-muted-foreground">{formatGHS(revpashPerDay)}/screen/day · {stats.tabletsTotal} screens · {periodDays}d period</p>
          </div>
        </div>
      </div>

      {/* ── Row 3: Top Customers ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Top Customers by Spend</h3>
          {/* Concentration risk badge */}
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium",
            concentrationColors[concentrationRisk]
          )}>
            {concentrationRisk !== "low" && <AlertTriangle className="w-3 h-3" />}
            Top 3 advertisers = {top3Pct}% of revenue
            {concentrationRisk === "high" && " · high concentration risk"}
          </span>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-8">#</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Advertiser</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Campaigns</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Regions</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Lead Time</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Total Spend</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c, i) => (
                <tr
                  key={c.advertiser}
                  className={cn(
                    "border-b border-border last:border-0 hover:bg-muted/20 transition-colors",
                    i % 2 === 0 ? "bg-card" : "bg-background"
                  )}
                >
                  <td className="px-4 py-3 text-muted-foreground font-mono">#{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.advertiser}</p>
                    {c.campaignCount > 1 && (
                      <p className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                        <Repeat2 className="w-2.5 h-2.5" /> {c.campaignCount} campaigns
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium text-[11px]",
                      c.advertiserType === "business" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                    )}>
                      {c.advertiserType === "business" ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {c.advertiserType === "business" ? "Business" : "Sole Trader"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {c.statuses.map((s, si) => (
                        <span key={si} className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", STATUS_COLORS[s])}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.regions.join(", ")}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">{c.avgLeadDays}d</td>
                  <td className="px-4 py-3 text-right font-bold">{formatGHS(c.totalSpend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Row 4: Regional + Objective ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <h3 className="text-sm font-semibold mb-1">Revenue by Region</h3>
          <p className="text-[11px] text-muted-foreground mb-4">Multi-city campaigns split evenly across cities</p>
          <div className="space-y-3">
            {regionRevs.map(({ city, rev }) => (
              <div key={city}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium">{city}</span>
                  <span className="text-xs text-muted-foreground">{formatGHS(rev)}</span>
                </div>
                <MiniBar pct={Math.round((rev / maxRegionRev) * 100)} color="bg-primary" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <h3 className="text-sm font-semibold mb-1">Revenue by Objective</h3>
          <p className="text-[11px] text-muted-foreground mb-4">Promotion = high CPM; Awareness = sticky, recurring</p>
          <div className="space-y-3">
            {objectiveRevs.map(({ obj, rev }) => (
              <div key={obj}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium capitalize">{obj}</span>
                  <span className="text-xs text-muted-foreground">{formatGHS(rev)}</span>
                </div>
                <MiniBar pct={Math.round((rev / maxObjRev) * 100)} color={OBJ_COLORS[obj] ?? "bg-primary"} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 5: Business vs Sole + CPM ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <h3 className="text-sm font-semibold mb-4">Business vs Sole Trader</h3>
          <div className="flex h-3 rounded-full overflow-hidden mb-4">
            <div className="bg-blue-500" style={{ width: `${businessPct}%` }} />
            <div className="bg-purple-400 flex-1" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="font-semibold">Business</span>
              </div>
              <p className="text-base font-bold">{formatGHS(businessRev)}</p>
              <p className="text-muted-foreground mt-0.5">{businessPct}% of revenue</p>
              <p className="text-muted-foreground">{campaignsWithCost.filter((c) => c.advertiserType === "business").length} campaigns</p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
                <span className="font-semibold">Sole Trader</span>
              </div>
              <p className="text-base font-bold">{formatGHS(soleRev)}</p>
              <p className="text-muted-foreground mt-0.5">{100 - businessPct}% of revenue</p>
              <p className="text-muted-foreground">{campaignsWithCost.filter((c) => c.advertiserType === "sole").length} campaigns</p>
            </div>
          </div>
        </div>

        {/* Network efficiency summary */}
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <h3 className="text-sm font-semibold mb-4">Network Efficiency</h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Avg CPM (realized)</p>
                <p className="text-muted-foreground">Cost per 1,000 impressions delivered</p>
              </div>
              <p className="text-lg font-bold">{formatGHS(cpm)}</p>
            </div>
            <div className="border-t border-border pt-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Fill Rate</p>
                <p className="text-muted-foreground">Booked vs available taxis network-wide</p>
              </div>
              <p className={cn(
                "text-lg font-bold",
                stats.networkPressure >= 75 ? "text-red-600" : stats.networkPressure >= 45 ? "text-amber-600" : "text-green-600"
              )}>{stats.networkPressure}%</p>
            </div>
            <div className="border-t border-border pt-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Tablet Uptime</p>
                <p className="text-muted-foreground">Screens live and delivering</p>
              </div>
              <p className={cn(
                "text-lg font-bold",
                stats.tabletsOnline / stats.tabletsTotal >= 0.9 ? "text-green-600" :
                stats.tabletsOnline / stats.tabletsTotal >= 0.7 ? "text-amber-600" : "text-red-600"
              )}>
                {Math.round((stats.tabletsOnline / stats.tabletsTotal) * 100)}%
              </p>
            </div>
            <div className="border-t border-border pt-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Total Impressions</p>
                <p className="text-muted-foreground">Across all campaigns (est.)</p>
              </div>
              <p className="text-lg font-bold">{(totalImpressions / 1000).toFixed(0)}k</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Page ──

type TabId = "analytics" | "campaigns" | "drivers" | "fleets" | "payouts" | "operations";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "analytics",  label: "Analytics",  icon: BarChart2  },
  { id: "campaigns",  label: "Campaigns",  icon: Megaphone  },
  { id: "drivers",    label: "Drivers",    icon: User       },
  { id: "fleets",     label: "Fleets",     icon: Car        },
  { id: "payouts",    label: "Payouts",    icon: Wallet     },
  { id: "operations", label: "Operations", icon: Layers     },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("analytics");
  const stats = getAdminStats();

  // Revenue KPIs — growth signals at the top
  const campaignCosts = useMemo(
    () => DEMO_CAMPAIGNS.map((c) => ({ ...c, cost: calcCampaignCost(c) })),
    []
  );
  const realizedRevenue = campaignCosts.filter((c) => c.status === "completed").reduce((s, c) => s + c.cost, 0);
  const pipelineRevenue = campaignCosts.filter((c) => c.status !== "completed").reduce((s, c) => s + c.cost, 0);

  const monthMap: Record<string, number> = {};
  for (const c of campaignCosts) {
    const m = c.createdAt.slice(0, 7);
    monthMap[m] = (monthMap[m] ?? 0) + c.cost;
  }
  const monthEntries = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b));
  const lastTwo = monthEntries.slice(-2);
  const momGrowth = lastTwo.length === 2
    ? ((lastTwo[1][1] - lastTwo[0][1]) / lastTwo[0][1]) * 100
    : null;

  const uptimePct = Math.round((stats.tabletsOnline / stats.tabletsTotal) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">19 Mar 2026 · Accra · Global network overview</p>
        </div>

        {/* Revenue KPIs — growth signals first */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          <StatCard icon={TrendingUp}  label="Realized Revenue" value={formatGHS(realizedRevenue)} sub="completed campaigns" accent="blue" />
          <StatCard
            icon={momGrowth !== null && momGrowth >= 0 ? TrendingUp : TrendingDown}
            label="MoM Growth"
            value={momGrowth !== null ? `${momGrowth >= 0 ? "+" : ""}${momGrowth.toFixed(0)}%` : "—"}
            sub="vs prior month"
            accent={momGrowth === null ? "blue" : momGrowth >= 8 ? "green" : momGrowth >= 0 ? "amber" : "red"}
          />
          <StatCard icon={Clock}   label="Pipeline"      value={formatGHS(pipelineRevenue)}      sub="pending + running"          accent="amber" />
          <StatCard icon={Radio}   label="Fill Rate"     value={`${stats.networkPressure}%`}     sub="inventory sold"             accent={stats.networkPressure >= 75 ? "red" : stats.networkPressure >= 45 ? "amber" : "green"} />
          <StatCard icon={Tablet}  label="Tablet Uptime" value={`${uptimePct}%`}                sub={`${stats.tabletsOnline}/${stats.tabletsTotal} screens live`} accent={uptimePct >= 90 ? "green" : uptimePct >= 70 ? "amber" : "red"} />
        </div>

        {/* Alerts — prescriptive action items */}
        <AlertsPanel />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 mb-5 w-fit overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap",
                activeTab === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "analytics"  && <AnalyticsTab />}
        {activeTab === "campaigns"  && <CampaignsTab />}
        {activeTab === "drivers"    && <DriversTab />}
        {activeTab === "fleets"     && <FleetsTab />}
        {activeTab === "payouts"    && <PayoutsTab />}
        {activeTab === "operations" && <OperationsTab />}

      </div>
    </div>
  );
}
