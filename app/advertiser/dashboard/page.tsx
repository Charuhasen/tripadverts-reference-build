"use client";

import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Eye,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileCheck,
  BarChart3,
  Monitor,
  Timer,
  DollarSign,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  getDayType,
  getDayLabel,
  getHourRate,
  calcTimeRangeCost,
  TIER_LABELS,
  TIER_COLORS,
  type RateTier,
} from "@/lib/pricing";

// ── Types ──

type CampaignStatus = "pending" | "running" | "completed";

interface BookingSlot {
  date: string;
  startTime: string;
  endTime: string;
}

interface CampaignZone {
  name: string;
  city: string;
}

interface ProofOfPlayEntry {
  zone: string;
  city: string;
  device: string;
  playsDelivered: number;
  date: string;
  timeWindow: string;
}

interface ProofOfPlaySummary {
  entries: ProofOfPlayEntry[];
  totalPlays: number;
  totalDevices: number;
  estimatedImpressions: number;
}

interface DemoCampaign {
  id: string;
  name: string;
  status: CampaignStatus;
  objective: "awareness" | "engagement" | "promotion";
  description: string;
  createdAt: string;
  zones: CampaignZone[];
  bookingSlots: BookingSlot[];
  adType: "image" | "video";
  estimatedImpressions: number;
  proofOfPlay?: ProofOfPlaySummary;
}

function parseHour(time: string): number {
  return parseInt(time.split(":")[0], 10);
}

function calcSlotCost(slot: BookingSlot, zoneCount: number): { cost: number; hours: number } {
  const dayType = getDayType(slot.date);
  const startH = parseHour(slot.startTime);
  let endH = parseHour(slot.endTime);
  if (slot.endTime === "23:59" || slot.endTime === "24:00") endH = 24;
  const endMin = parseInt(slot.endTime.split(":")[1], 10);
  if (endMin > 0 && endH < 24) endH += 1;

  const cost = calcTimeRangeCost(startH, endH, dayType, zoneCount);
  return { cost, hours: endH - startH };
}

function calcCampaignCost(campaign: DemoCampaign): number {
  return campaign.bookingSlots.reduce(
    (sum, slot) => sum + calcSlotCost(slot, campaign.zones.length).cost,
    0
  );
}

// ── Demo Data ──

const DEMO_CAMPAIGNS: DemoCampaign[] = [
  {
    id: "cmp_001",
    name: "Ramadan Promo — Accra",
    status: "completed",
    objective: "promotion",
    description: "Ramadan special offers on selected products across Accra zones",
    createdAt: "2026-02-01",
    adType: "video",
    zones: [
      { name: "East Legon", city: "Accra" },
      { name: "Osu", city: "Accra" },
      { name: "Airport City", city: "Accra" },
      { name: "Spintex", city: "Accra" },
    ],
    bookingSlots: [
      // Sun 15 Feb
      { date: "2026-02-15", startTime: "06:00", endTime: "10:00" },
      { date: "2026-02-15", startTime: "16:00", endTime: "20:00" },
      // Mon 16 Feb
      { date: "2026-02-16", startTime: "06:00", endTime: "10:00" },
      { date: "2026-02-16", startTime: "16:00", endTime: "20:00" },
      // Tue 17 Feb
      { date: "2026-02-17", startTime: "08:00", endTime: "18:00" },
    ],
    estimatedImpressions: 48_000,
    proofOfPlay: {
      totalPlays: 3_840,
      totalDevices: 42,
      estimatedImpressions: 48_000,
      entries: [
        { zone: "East Legon", city: "Accra", device: "TXD-ACC-017", playsDelivered: 312, date: "2026-02-15", timeWindow: "06:00–10:00" },
        { zone: "East Legon", city: "Accra", device: "TXD-ACC-023", playsDelivered: 288, date: "2026-02-15", timeWindow: "06:00–10:00" },
        { zone: "Osu", city: "Accra", device: "TXD-ACC-041", playsDelivered: 420, date: "2026-02-15", timeWindow: "16:00–20:00" },
        { zone: "Osu", city: "Accra", device: "TXD-ACC-009", playsDelivered: 396, date: "2026-02-15", timeWindow: "16:00–20:00" },
        { zone: "Airport City", city: "Accra", device: "TXD-ACC-055", playsDelivered: 504, date: "2026-02-16", timeWindow: "06:00–10:00" },
        { zone: "Spintex", city: "Accra", device: "TXD-ACC-031", playsDelivered: 264, date: "2026-02-16", timeWindow: "16:00–20:00" },
        { zone: "East Legon", city: "Accra", device: "TXD-ACC-017", playsDelivered: 348, date: "2026-02-17", timeWindow: "08:00–18:00" },
        { zone: "Osu", city: "Accra", device: "TXD-ACC-041", playsDelivered: 516, date: "2026-02-17", timeWindow: "08:00–18:00" },
        { zone: "Airport City", city: "Accra", device: "TXD-ACC-055", playsDelivered: 468, date: "2026-02-17", timeWindow: "08:00–18:00" },
        { zone: "Spintex", city: "Accra", device: "TXD-ACC-031", playsDelivered: 324, date: "2026-02-17", timeWindow: "08:00–18:00" },
      ],
    },
  },
  {
    id: "cmp_002",
    name: "New Year Brand Push",
    status: "completed",
    objective: "awareness",
    description: "Brand awareness campaign for the new year across Lagos",
    createdAt: "2025-12-10",
    adType: "image",
    zones: [
      { name: "Victoria Island", city: "Lagos" },
      { name: "Lekki", city: "Lagos" },
      { name: "Ikeja", city: "Lagos" },
    ],
    bookingSlots: [
      // Fri 26 Dec
      { date: "2025-12-26", startTime: "07:00", endTime: "22:00" },
      // Sat 27 Dec
      { date: "2025-12-27", startTime: "07:00", endTime: "22:00" },
      // Wed 31 Dec
      { date: "2025-12-31", startTime: "10:00", endTime: "23:59" },
      // Thu 1 Jan
      { date: "2026-01-01", startTime: "06:00", endTime: "22:00" },
    ],
    estimatedImpressions: 52_000,
    proofOfPlay: {
      totalPlays: 4_200,
      totalDevices: 56,
      estimatedImpressions: 52_000,
      entries: [
        { zone: "Victoria Island", city: "Lagos", device: "TXD-LAG-003", playsDelivered: 480, date: "2025-12-26", timeWindow: "07:00–22:00" },
        { zone: "Victoria Island", city: "Lagos", device: "TXD-LAG-011", playsDelivered: 456, date: "2025-12-26", timeWindow: "07:00–22:00" },
        { zone: "Lekki", city: "Lagos", device: "TXD-LAG-022", playsDelivered: 372, date: "2025-12-26", timeWindow: "07:00–22:00" },
        { zone: "Ikeja", city: "Lagos", device: "TXD-LAG-038", playsDelivered: 336, date: "2025-12-27", timeWindow: "07:00–22:00" },
        { zone: "Victoria Island", city: "Lagos", device: "TXD-LAG-003", playsDelivered: 612, date: "2025-12-31", timeWindow: "10:00–23:59" },
        { zone: "Lekki", city: "Lagos", device: "TXD-LAG-022", playsDelivered: 528, date: "2025-12-31", timeWindow: "10:00–23:59" },
        { zone: "Ikeja", city: "Lagos", device: "TXD-LAG-038", playsDelivered: 444, date: "2026-01-01", timeWindow: "06:00–22:00" },
        { zone: "Victoria Island", city: "Lagos", device: "TXD-LAG-011", playsDelivered: 540, date: "2026-01-01", timeWindow: "06:00–22:00" },
      ],
    },
  },
  {
    id: "cmp_003",
    name: "Spring Collection Launch",
    status: "running",
    objective: "engagement",
    description: "Fashion brand spring collection — targeting high-traffic commercial zones",
    createdAt: "2026-03-01",
    adType: "video",
    zones: [
      { name: "Cantonments", city: "Accra" },
      { name: "Osu", city: "Accra" },
      { name: "Kwame Nkrumah Circle", city: "Accra" },
    ],
    bookingSlots: [
      // Tue 10 Mar
      { date: "2026-03-10", startTime: "07:00", endTime: "19:00" },
      // Wed 11 Mar
      { date: "2026-03-11", startTime: "07:00", endTime: "19:00" },
      // Sun 15 Mar
      { date: "2026-03-15", startTime: "12:00", endTime: "18:00" },
      // Mon 16 Mar
      { date: "2026-03-16", startTime: "07:00", endTime: "19:00" },
      // Fri 20 Mar
      { date: "2026-03-20", startTime: "07:00", endTime: "22:00" },
    ],
    estimatedImpressions: 28_000,
  },
  {
    id: "cmp_004",
    name: "Fintech App Install Drive",
    status: "running",
    objective: "engagement",
    description: "Mobile fintech app promotion on taxi-top screens in Nairobi",
    createdAt: "2026-03-08",
    adType: "image",
    zones: [
      { name: "Westlands", city: "Nairobi" },
      { name: "CBD", city: "Nairobi" },
    ],
    bookingSlots: [
      // Thu 12 Mar
      { date: "2026-03-12", startTime: "06:00", endTime: "09:00" },
      { date: "2026-03-12", startTime: "16:00", endTime: "19:00" },
      // Fri 13 Mar
      { date: "2026-03-13", startTime: "06:00", endTime: "09:00" },
      { date: "2026-03-13", startTime: "18:00", endTime: "22:00" },
      // Sat 14 Mar
      { date: "2026-03-14", startTime: "10:00", endTime: "22:00" },
    ],
    estimatedImpressions: 18_500,
  },
  {
    id: "cmp_005",
    name: "Telecom Data Bundle Promo",
    status: "pending",
    objective: "promotion",
    description: "Unlimited data bundle offers for Q2 — pending creative review",
    createdAt: "2026-03-14",
    adType: "video",
    zones: [
      { name: "East Legon", city: "Accra" },
      { name: "Victoria Island", city: "Lagos" },
      { name: "Westlands", city: "Nairobi" },
    ],
    bookingSlots: [
      // Sun 22 Mar
      { date: "2026-03-22", startTime: "12:00", endTime: "18:00" },
      // Mon 23 Mar
      { date: "2026-03-23", startTime: "06:00", endTime: "20:00" },
      // Tue 24 Mar
      { date: "2026-03-24", startTime: "06:00", endTime: "20:00" },
      // Fri 27 Mar
      { date: "2026-03-27", startTime: "06:00", endTime: "23:00" },
      // Sat 28 Mar
      { date: "2026-03-28", startTime: "08:00", endTime: "23:00" },
    ],
    estimatedImpressions: 72_000,
  },
  {
    id: "cmp_006",
    name: "Real Estate Open Day",
    status: "pending",
    objective: "awareness",
    description: "Weekend open day announcement for new residential development",
    createdAt: "2026-03-13",
    adType: "image",
    zones: [
      { name: "Spintex", city: "Accra" },
      { name: "Madina", city: "Accra" },
    ],
    bookingSlots: [
      // Sun 22 Mar — skip church hours, book post-church
      { date: "2026-03-22", startTime: "12:00", endTime: "18:00" },
      // Sat 28 Mar
      { date: "2026-03-28", startTime: "08:00", endTime: "18:00" },
    ],
    estimatedImpressions: 9_400,
  },
];

// ── Helpers ──

const statusConfig: Record<CampaignStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending Approval", color: "text-yellow-500", icon: Clock },
  running: { label: "Live", color: "text-green-500", icon: Play },
  completed: { label: "Completed", color: "text-muted-foreground", icon: CheckCircle2 },
};

const objectiveBadge: Record<string, string> = {
  awareness: "default",
  engagement: "secondary",
  promotion: "outline",
};

function formatNumber(n: number) {
  return n.toLocaleString();
}

function formatGHS(n: number) {
  return `GHS ${n.toLocaleString()}`;
}

function uniqueDates(slots: BookingSlot[]) {
  return [...new Set(slots.map((s) => s.date))];
}

function dateRange(slots: BookingSlot[]) {
  const dates = uniqueDates(slots).sort();
  if (dates.length === 1) return dates[0];
  return `${dates[0]} → ${dates[dates.length - 1]}`;
}

// ── Components ──

function SummaryCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function BookingSchedule({ slots, zoneCount }: { slots: BookingSlot[]; zoneCount: number }) {
  const grouped = slots.reduce<Record<string, BookingSlot[]>>((acc, slot) => {
    (acc[slot.date] ??= []).push(slot);
    return acc;
  }, {});

  return (
    <div className="mt-3 border border-border rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
            <th className="text-left px-3 py-2 font-medium">Date</th>
            <th className="text-left px-3 py-2 font-medium">Day</th>
            <th className="text-left px-3 py-2 font-medium">Time Window</th>
            <th className="text-left px-3 py-2 font-medium">Rate Tier</th>
            <th className="text-right px-3 py-2 font-medium">Hours</th>
            <th className="text-right px-3 py-2 font-medium">Cost</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([date, daySlots]) => {
            const dayLabel = getDayLabel(date);
            return daySlots.map((slot, si) => {
              const { cost, hours } = calcSlotCost(slot, zoneCount);
              const dayType = getDayType(slot.date);
              const startH = parseHour(slot.startTime);
              const startRate = getHourRate(startH, dayType);

              return (
                <tr key={`${date}-${si}`} className="border-t border-border">
                  {si === 0 ? (
                    <>
                      <td className="px-3 py-2 font-medium" rowSpan={daySlots.length}>{date}</td>
                      <td className="px-3 py-2 text-muted-foreground" rowSpan={daySlots.length}>{dayLabel}</td>
                    </>
                  ) : null}
                  <td className="px-3 py-2">
                    {slot.startTime}–{slot.endTime}
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn("text-xs font-medium", TIER_COLORS[startRate.tier])}>
                      {TIER_LABELS[startRate.tier]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{hours}h</td>
                  <td className="px-3 py-2 text-right font-medium">{formatGHS(cost)}</td>
                </tr>
              );
            });
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border bg-muted/30">
            <td colSpan={4} className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total
            </td>
            <td className="px-3 py-2 text-right text-muted-foreground text-sm">
              {slots.reduce((a, s) => a + calcSlotCost(s, zoneCount).hours, 0)}h
            </td>
            <td className="px-3 py-2 text-right font-bold text-sm">
              {formatGHS(slots.reduce((a, s) => a + calcSlotCost(s, zoneCount).cost, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function RateCardPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
        {open ? "Hide" : "View"} hourly rate card
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-3 border border-border rounded-lg overflow-hidden max-w-2xl">
          <div className="px-4 py-3 bg-muted/50 border-b border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hourly Rates (GHS per hour, per zone)
            </p>
          </div>
          <div className="divide-y divide-border text-sm">
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mon – Thu</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <RateChip label="06–09" rate={30} tier="peak" />
                <RateChip label="10–15" rate={18} tier="off-peak" />
                <RateChip label="16–19" rate={30} tier="peak" />
                <RateChip label="20–05" rate={12} tier="off-peak" />
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Friday</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <RateChip label="06–09" rate={30} tier="peak" />
                <RateChip label="10–17" rate={18} tier="off-peak" />
                <RateChip label="18–23" rate={45} tier="fri-night" />
                <RateChip label="00–05" rate={12} tier="off-peak" />
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Saturday</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <RateChip label="06–11" rate={20} tier="off-peak" />
                <RateChip label="12–17" rate={25} tier="peak" />
                <RateChip label="18–23" rate={45} tier="sat-night" />
                <RateChip label="00–05" rate={12} tier="off-peak" />
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sunday</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <RateChip label="06–12" rate={10} tier="off-peak" />
                <RateChip label="12–18" rate={28} tier="peak" />
                <RateChip label="18–21" rate={18} tier="off-peak" />
                <RateChip label="22–05" rate={10} tier="off-peak" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RateChip({ label, rate, tier }: { label: string; rate: number; tier: RateTier }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-2.5 py-1.5">
      <div>
        <p className="text-xs font-mono">{label}</p>
        <p className={cn("text-[10px] font-medium", TIER_COLORS[tier])}>
          {TIER_LABELS[tier]}
        </p>
      </div>
      <span className="text-sm font-bold">GH₵{rate}</span>
    </div>
  );
}

function ZoneList({ zones }: { zones: CampaignZone[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {zones.map((z) => (
        <span
          key={z.name + z.city}
          className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md"
        >
          <MapPin className="w-3 h-3 text-muted-foreground" />
          {z.name}, {z.city}
        </span>
      ))}
    </div>
  );
}

function ProofOfPlayPanel({ pop }: { pop: ProofOfPlaySummary }) {
  const byZone = pop.entries.reduce<Record<string, number>>((acc, e) => {
    const key = `${e.zone}, ${e.city}`;
    acc[key] = (acc[key] ?? 0) + e.playsDelivered;
    return acc;
  }, {});

  return (
    <div className="mt-4 border border-border rounded-lg bg-card/50">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <FileCheck className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Proof of Play Report</span>
      </div>

      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-border">
        <Stat label="Total Plays" value={formatNumber(pop.totalPlays)} />
        <Stat label="Devices Used" value={String(pop.totalDevices)} />
        <Stat label="Est. Impressions" value={`~${formatNumber(pop.estimatedImpressions)}`} />
      </div>

      <div className="p-4 border-b border-border">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
          Plays by Zone
        </p>
        <div className="space-y-2">
          {Object.entries(byZone)
            .sort((a, b) => b[1] - a[1])
            .map(([zone, plays]) => {
              const pct = (plays / pop.totalPlays) * 100;
              return (
                <div key={zone}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{zone}</span>
                    <span className="text-muted-foreground">
                      {formatNumber(plays)} plays ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
          Play Log
        </p>
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-3 py-2 font-medium">Date</th>
                <th className="text-left px-3 py-2 font-medium">Time Window</th>
                <th className="text-left px-3 py-2 font-medium">Zone</th>
                <th className="text-left px-3 py-2 font-medium">Device</th>
                <th className="text-right px-3 py-2 font-medium">Plays</th>
              </tr>
            </thead>
            <tbody>
              {pop.entries.map((e, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2">{e.date}</td>
                  <td className="px-3 py-2 text-muted-foreground">{e.timeWindow}</td>
                  <td className="px-3 py-2">{e.zone}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{e.device}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatNumber(e.playsDelivered)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: DemoCampaign }) {
  const [expanded, setExpanded] = useState(false);
  const sc = statusConfig[campaign.status];
  const StatusIcon = sc.icon;
  const dates = uniqueDates(campaign.bookingSlots);
  const totalCost = calcCampaignCost(campaign);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <button
          className="w-full text-left px-5 py-4 flex items-start gap-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold truncate">{campaign.name}</h3>
              <Badge variant={objectiveBadge[campaign.objective] as any} className="text-[10px]">
                {campaign.objective}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {campaign.description}
            </p>

            <div className="flex items-center gap-4 mt-2.5 text-xs text-muted-foreground flex-wrap">
              <span className={cn("flex items-center gap-1 font-medium", sc.color)}>
                <StatusIcon className="w-3.5 h-3.5" />
                {sc.label}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {dateRange(campaign.bookingSlots)}
              </span>
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {dates.length} day{dates.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {campaign.zones.length} zone{campaign.zones.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                ~{formatNumber(campaign.estimatedImpressions)} est.
              </span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <DollarSign className="w-3 h-3" />
                {formatGHS(totalCost)}
              </span>
            </div>
          </div>

          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
          )}
        </button>

        {expanded && (
          <div className="px-5 pb-5 pt-0">
            <Separator className="mb-4" />

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
              <Stat label="Ad Type" value={campaign.adType === "video" ? "Video" : "Image"} />
              <Stat label="Created" value={campaign.createdAt} />
              <Stat label="Booked Days" value={String(dates.length)} />
              <Stat label="Est. Impressions" value={`~${formatNumber(campaign.estimatedImpressions)}`} />
              <Stat label="Total Cost" value={formatGHS(totalCost)} />
            </div>

            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
              Geofence Zones
            </p>
            <ZoneList zones={campaign.zones} />

            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-4 mb-0">
              Booking Schedule & Pricing
            </p>
            <BookingSchedule slots={campaign.bookingSlots} zoneCount={campaign.zones.length} />

            {campaign.proofOfPlay && (
              <ProofOfPlayPanel pop={campaign.proofOfPlay} />
            )}

            {campaign.status === "pending" && (
              <div className="mt-4 flex items-center gap-2 text-xs text-yellow-600 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  This campaign is awaiting creative review and approval. You&apos;ll be notified once it&apos;s live.
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ──

export default function AdvertiserDashboardPage() {
  const pending = DEMO_CAMPAIGNS.filter((c) => c.status === "pending");
  const running = DEMO_CAMPAIGNS.filter((c) => c.status === "running");
  const completed = DEMO_CAMPAIGNS.filter((c) => c.status === "completed");

  const totalPlays = DEMO_CAMPAIGNS.reduce(
    (a, c) => a + (c.proofOfPlay?.totalPlays ?? 0),
    0
  );
  const totalEstimated = DEMO_CAMPAIGNS.reduce(
    (a, c) => a + c.estimatedImpressions,
    0
  );
  const totalRevenue = DEMO_CAMPAIGNS.reduce(
    (a, c) => a + calcCampaignCost(c),
    0
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Advertiser Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your campaigns, booking schedules, and Proof of Play reports
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <SummaryCard
            label="Campaigns"
            value={String(DEMO_CAMPAIGNS.length)}
            icon={BarChart3}
            sub={`${running.length} live · ${pending.length} pending`}
          />
          <SummaryCard
            label="Est. Impressions"
            value={`~${formatNumber(totalEstimated)}`}
            icon={Eye}
            sub="across all campaigns"
          />
          <SummaryCard
            label="Total Plays"
            value={formatNumber(totalPlays)}
            icon={Monitor}
            sub="completed campaigns"
          />
          <SummaryCard
            label="Booked Days"
            value={String(
              DEMO_CAMPAIGNS.reduce((a, c) => a + uniqueDates(c.bookingSlots).length, 0)
            )}
            icon={Calendar}
            sub="total scheduled"
          />
          <SummaryCard
            label="Total Cost"
            value={formatGHS(totalRevenue)}
            icon={DollarSign}
            sub="all campaigns"
          />
        </div>

        <RateCardPanel />

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              All ({DEMO_CAMPAIGNS.length})
            </TabsTrigger>
            <TabsTrigger value="running">
              <Play className="w-3 h-3 mr-1" />
              Live ({running.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="w-3 h-3 mr-1" />
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>

          <div className="mt-5">
            <TabsContent value="all">
              <CampaignList campaigns={DEMO_CAMPAIGNS} />
            </TabsContent>
            <TabsContent value="running">
              <CampaignList campaigns={running} />
            </TabsContent>
            <TabsContent value="pending">
              <CampaignList campaigns={pending} />
            </TabsContent>
            <TabsContent value="completed">
              <CampaignList campaigns={completed} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function CampaignList({ campaigns }: { campaigns: DemoCampaign[] }) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No campaigns found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {campaigns.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </div>
  );
}
