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

// ── Page ──

type TabId = "drivers" | "fleets" | "payouts" | "tablets";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "drivers",  label: "Drivers",  icon: User       },
  { id: "fleets",   label: "Fleets",   icon: Car        },
  { id: "payouts",  label: "Payouts",  icon: Wallet     },
  { id: "tablets",  label: "Tablets",  icon: Tablet     },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("drivers");
  const stats = getAdminStats();

  const mapDrivers: AdminDriverMarker[] = useMemo(
    () => [
      ...INDIVIDUAL_DRIVERS.map((d) => ({
        id: d.id,
        name: d.name,
        plate: d.plate,
        status: d.status,
        lat: d.lat,
        lng: d.lng,
        zone: d.zone,
        type: "individual" as const,
      })),
      ...FLEET_DRIVERS.map((d) => ({
        id: d.id,
        name: d.name,
        plate: d.plate,
        status: d.status,
        lat: d.lat,
        lng: d.lng,
        zone: d.zone,
        type: "fleet" as const,
        fleetName: d.fleetName,
      })),
    ],
    []
  );

  const networkAccent = stats.networkPressure >= 75 ? "red" : stats.networkPressure >= 45 ? "amber" : "green";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Global network overview · Accra</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <StatCard icon={Users}  label="Total Drivers"   value={stats.totalDrivers} sub={`${DEMO_FLEETS.length} fleets + ${INDIVIDUAL_DRIVERS.length} individual`} accent="blue" />
          <StatCard icon={Car}    label="Active Now"      value={stats.activeNow}    sub={`${stats.totalDrivers - stats.activeNow} offline`} accent="green" />
          <StatCard icon={Tablet} label="Tablets Online"  value={`${stats.tabletsOnline}/${stats.tabletsTotal}`} sub={`${stats.tabletsTotal - stats.tabletsOnline} offline`} accent={stats.tabletsOnline / stats.tabletsTotal >= 0.7 ? "green" : "amber"} />
          <StatCard icon={Radio}  label="Network Pressure" value={`${stats.networkPressure}%`} sub="of taxis booked" accent={networkAccent as "green" | "amber" | "red"} />
          <StatCard icon={Wallet} label="Pending Payouts" value={formatGHS(stats.pendingPayouts)} sub="current period" accent="amber" />
        </div>

        {/* Live Map */}
        <div className="mb-6 rounded-xl border border-border overflow-hidden" style={{ height: 400 }}>
          <AdminMap drivers={mapDrivers} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 mb-5 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
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
        {activeTab === "drivers" && <DriversTab />}
        {activeTab === "fleets"  && <FleetsTab />}
        {activeTab === "payouts" && <PayoutsTab />}
        {activeTab === "tablets" && <TabletsTab />}

      </div>
    </div>
  );
}
