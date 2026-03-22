"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useSpring, useTransform } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CampaignTarget,
  TimeRange,
  COUNTRIES,
  getZonesForCity,
  TrafficDensity,
} from "@/lib/schemas/campaignData";
import {
  Clock,
  CalendarDays,
  MapPin,
  Globe,
  Link2,
  Link2Off,
  Car,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDayType,
  calcTimeRangeCost,
  getSlotMultiplier,
  getHourlyRates,
  TIER_LABELS,
  TIER_BG,
  type DayType,
  type RateTier,
} from "@/lib/pricing";
import type { DateRange } from "react-day-picker";
import type { StepNavState } from "../page";

interface Props {
  data: CampaignTarget;
  onNext: (data: CampaignTarget) => void;
  onBack: () => void;
  onNavChange?: (state: StepNavState) => void;
  submitRef?: React.MutableRefObject<(() => void) | null>;
  stepBackRef?: React.MutableRefObject<(() => void) | null>;
}

// ── Helpers ──

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function getDaysBetween(start: string, end: string): string[] {
  const days: string[] = [];
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    days.push(formatDateKey(d));
  }
  return days;
}

function getTimeRangeForDay(
  day: string,
  defaultRange: TimeRange,
  overrides: Record<string, TimeRange>
): TimeRange {
  return overrides[day] ?? defaultRange;
}

function formatImpressions(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return n.toLocaleString();
}

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const spring = useSpring(value, { bounce: 0, duration: 800 });
  useEffect(() => { spring.set(value); }, [value, spring]);
  const display = useTransform(spring, (current) => `${prefix}${Math.round(current).toLocaleString()}`);
  return <motion.span>{display}</motion.span>;
}

function AnimatedImpressions({ value }: { value: number }) {
  const spring = useSpring(value, { bounce: 0, duration: 800 });
  useEffect(() => { spring.set(value); }, [value, spring]);
  const display = useTransform(spring, (current) => formatImpressions(Math.round(current)));
  return <motion.span>{display}</motion.span>;
}

function TrafficDensityBars({ density }: { density: TrafficDensity }) {
  const bars = density === "High" ? 3 : density === "Medium" ? 2 : 1;
  return (
    <div className="flex items-end gap-[2px] h-3 ml-2" title={`${density} Traffic`}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-sm",
            i <= bars ? "bg-primary" : "bg-muted-foreground/30",
            i === 1 ? "h-1.5" : i === 2 ? "h-2" : "h-3"
          )}
        />
      ))}
    </div>
  );
}

// ── Section header ──

const ZoneMap = dynamic(() => import("@/components/ui/zone-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] rounded-xl bg-muted/50 animate-pulse flex items-center justify-center border border-border">
      <MapPin className="w-8 h-8 text-muted-foreground/30 animate-bounce" />
    </div>
  ),
});

function SectionLabel({ icon: Icon, title, right }: {
  icon: React.ElementType;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      {right}
    </div>
  );
}

// ── Estimate stat tile ──

function StatTile({
  label,
  value,
  highlight = false,
  large = false,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  large?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-lg border px-3 py-2.5 flex flex-col gap-0.5",
      highlight
        ? "border-primary/30 bg-primary/5"
        : "border-border bg-muted/30"
    )}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none">{label}</p>
      <p className={cn(
        "font-bold leading-tight",
        large ? "text-xl" : "text-sm",
        highlight ? "text-primary" : "text-foreground"
      )}>
        {value}
      </p>
    </div>
  );
}

// ── Main component ──

export function StepCampaignTarget({ data, onNext, onNavChange, submitRef, stepBackRef }: Props) {
  const [target, setTarget] = useState<CampaignTarget>(data);
  const [linkedDays, setLinkedDays] = useState(true);
  const [monthsCount, setMonthsCount] = useState(1);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setMonthsCount(mq.matches ? 2 : 1);
    const handler = (e: MediaQueryListEvent) => setMonthsCount(e.matches ? 2 : 1);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const cityZones = useMemo(() => getZonesForCity(target.city), [target.city]);

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === target.country),
    [target.country]
  );

  const selectedZones = useMemo(
    () => cityZones.filter((z) => target.selectedZoneIds.includes(z.id)),
    [cityZones, target.selectedZoneIds]
  );

  // Clear stepBackRef — Back button goes to step 1
  useEffect(() => {
    if (stepBackRef) stepBackRef.current = null;
    return () => { if (stepBackRef) stepBackRef.current = null; };
  }, [stepBackRef]);

  useEffect(() => {
    onNavChange?.({ canProceed: true, nextLabel: "Next: Payment" });
  }, [onNavChange]);

  useEffect(() => {
    if (submitRef) {
      submitRef.current = () => onNext(target);
    }
  });

  const handleCountryChange = useCallback((code: string) => {
    setTarget((prev) => ({ ...prev, country: code, city: "", selectedZoneIds: [], taxiCount: 50 }));
  }, []);

  const handleCityChange = useCallback((cityId: string) => {
    setTarget((prev) => ({ ...prev, city: cityId, selectedZoneIds: [] }));
  }, []);

  const toggleZone = useCallback((zoneId: string) => {
    setTarget((prev) => {
      const ids = prev.selectedZoneIds.includes(zoneId)
        ? prev.selectedZoneIds.filter((id) => id !== zoneId)
        : [...prev.selectedZoneIds, zoneId];
      return { ...prev, selectedZoneIds: ids };
    });
  }, []);

  const dateRange: DateRange | undefined = useMemo(() => {
    if (!target.startDate) return undefined;
    return {
      from: new Date(target.startDate + "T00:00:00"),
      to: target.endDate ? new Date(target.endDate + "T00:00:00") : undefined,
    };
  }, [target.startDate, target.endDate]);

  const handleDateSelect = (range: DateRange | undefined) => {
    setTarget((prev) => ({
      ...prev,
      startDate: range?.from ? formatDateKey(range.from) : "",
      endDate: range?.to ? formatDateKey(range.to) : "",
      dayTimeOverrides: {},
    }));
  };

  const campaignDaysList = useMemo(() => {
    if (!target.startDate || !target.endDate) return [];
    return getDaysBetween(target.startDate, target.endDate);
  }, [target.startDate, target.endDate]);

  const campaignDays = campaignDaysList.length;

  const avgHoursPerDay = useMemo(() => {
    if (campaignDays === 0) return target.defaultTimeRange[1] - target.defaultTimeRange[0];
    let totalHours = 0;
    for (const day of campaignDaysList) {
      const [s, e] = getTimeRangeForDay(day, target.defaultTimeRange, target.dayTimeOverrides);
      totalHours += e - s;
    }
    return totalHours / campaignDays;
  }, [campaignDays, campaignDaysList, target.defaultTimeRange, target.dayTimeOverrides]);

  const totalDailyImpressions = selectedZones.reduce((sum, z) => sum + z.estimatedDailyImpressions, 0);
  const zoneWeight = selectedZones.reduce((sum, z) => sum + z.priceMultiplier, 0);
  const slotFraction = avgHoursPerDay / 16;
  const estimatedImpressions = Math.round(totalDailyImpressions * campaignDays * slotFraction);

  const estimatedCost = useMemo(() => {
    if (campaignDays === 0 || zoneWeight === 0) return 0;
    let total = 0;
    for (const day of campaignDaysList) {
      const [s, e] = getTimeRangeForDay(day, target.defaultTimeRange, target.dayTimeOverrides);
      total += calcTimeRangeCost(s, e, getDayType(day), zoneWeight);
    }
    return Math.round(total * getSlotMultiplier(target.slotCount));
  }, [campaignDays, campaignDaysList, zoneWeight, target.defaultTimeRange, target.dayTimeOverrides, target.slotCount]);

  const totalAvailableTaxis = selectedZones.reduce((sum, z) => sum + z.availableTaxis, 0);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 relative">
      
      {/* Left Column: Configuration */}
      <div className="space-y-6">
        
        {/* Location */}
        <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <SectionLabel icon={Globe} title="Location" />
          <div className="grid sm:grid-cols-3 gap-2.5">
            <Select value={target.country} onValueChange={handleCountryChange}>
              <SelectTrigger className="h-9 w-full text-xs bg-background">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={target.city} onValueChange={handleCityChange} disabled={!selectedCountry}>
              <SelectTrigger className="h-9 w-full text-xs bg-background">
                <SelectValue placeholder={selectedCountry ? "Select city" : "Select country first"} />
              </SelectTrigger>
              <SelectContent>
                {selectedCountry?.cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={target.medium}
              onValueChange={(val) => setTarget((prev) => ({ ...prev, medium: val }))}
            >
              <SelectTrigger className="h-9 w-full text-xs bg-background">
                <SelectValue placeholder="Select medium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="headrest">Headrest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Zones */}
        <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <SectionLabel
          icon={MapPin}
          title="Zones"
          right={
            cityZones.length > 0 ? (
              <span className="text-xs text-muted-foreground">
                {selectedZones.length > 0 ? `${selectedZones.length} / ${cityZones.length} selected` : `${cityZones.length} available`}
              </span>
            ) : null
          }
        />
        {!target.city ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center">
            <MapPin className="w-5 h-5 text-muted-foreground/40 mx-auto mb-1.5" />
            <p className="text-xs text-muted-foreground">Select a city above to see available zones</p>
          </div>
        ) : cityZones.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center">
            <MapPin className="w-5 h-5 text-muted-foreground/40 mx-auto mb-1.5" />
            <p className="text-xs text-muted-foreground">No zones available for this city yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Map */}
            <div className="hidden lg:block h-[450px]">
              <ZoneMap
                city={selectedCountry?.cities.find((c) => c.id === target.city)!}
                zones={cityZones}
                selectedIds={target.selectedZoneIds}
                onZoneClick={toggleZone}
              />
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-2">
            {cityZones.map((zone) => {
              const isSelected = target.selectedZoneIds.includes(zone.id);
              return (
                <button
                  key={zone.id}
                  onClick={() => toggleZone(zone.id)}
                  className={cn(
                    "text-left p-3 rounded-xl border transition-all cursor-pointer bg-background",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-md shadow-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-muted/30 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center">
                      <span className="text-sm font-semibold leading-tight">{zone.name}</span>
                      <TrafficDensityBars density={zone.trafficDensity} />
                    </div>
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      isSelected ? "bg-primary border-primary" : "border-border"
                    )}>
                      {isSelected && (
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-primary-foreground">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      {zone.availableTaxis.toLocaleString()} taxis
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatImpressions(zone.estimatedDailyImpressions)}/day
                    </span>
                    <span className={cn(
                      "ml-auto font-semibold",
                      zone.priceMultiplier >= 2.0 ? "text-orange-500" :
                      zone.priceMultiplier >= 1.5 ? "text-yellow-600" :
                      "text-muted-foreground"
                    )}>
                      {zone.priceMultiplier === 1.0 ? "base rate" : `×${zone.priceMultiplier} rate`}
                    </span>
                  </div>
                </button>
              );
            })}
            </div>
          </div>
        )}
        </section>

        {/* Schedule */}
        <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <SectionLabel icon={CalendarDays} title="Schedule" />
        <div className="flex justify-center">
          {(() => {
            const nextMonthStart = new Date();
            nextMonthStart.setMonth(nextMonthStart.getMonth() + 1, 1);
            nextMonthStart.setHours(0, 0, 0, 0);

            const nextMonthEnd = new Date(nextMonthStart);
            nextMonthEnd.setMonth(nextMonthEnd.getMonth() + 1, 0);
            nextMonthEnd.setHours(23, 59, 59, 999);

            return (
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={handleDateSelect}
                numberOfMonths={monthsCount}
                defaultMonth={nextMonthStart}
                disabled={[
                  { before: nextMonthStart },
                  { after: nextMonthEnd }
                ]}
              />
            );
          })()}
        </div>
        {target.startDate && target.endDate && target.endDate >= target.startDate && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            {formatDateShort(target.startDate)} — {formatDateShort(target.endDate)}
            {" · "}
            <span className="font-semibold text-foreground">
              {campaignDays} day{campaignDays !== 1 ? "s" : ""}
            </span>
          </p>
        )}
        </section>

        {/* Time Window */}
        <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <SectionLabel
          icon={Clock}
          title="Daily Time Window"
          right={
            campaignDays > 1 ? (
              <button
                onClick={() => {
                  setLinkedDays((prev) => {
                    if (!prev) setTarget((t) => ({ ...t, dayTimeOverrides: {} }));
                    return !prev;
                  });
                }}
                className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border transition-colors",
                  linkedDays
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {linkedDays ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
                {linkedDays ? "Linked" : "Individual"}
              </button>
            ) : null
          }
        />
        {campaignDays === 0 ? (
          <p className="text-xs text-muted-foreground">Select dates above to configure time windows.</p>
        ) : campaignDays === 1 ? (
          <TimeRangeSlider
            label={formatDateShort(campaignDaysList[0])}
            dateStr={campaignDaysList[0]}
            value={target.defaultTimeRange}
            zoneCount={zoneWeight}
            onChange={(range) =>
              setTarget((prev) => ({ ...prev, defaultTimeRange: range, dayTimeOverrides: {} }))
            }
          />
        ) : (
          <div className="space-y-5">
            {campaignDaysList.map((day) => {
              const range = getTimeRangeForDay(day, target.defaultTimeRange, target.dayTimeOverrides);
              return (
                <TimeRangeSlider
                  key={day}
                  label={formatDateShort(day)}
                  dateStr={day}
                  value={range}
                  zoneCount={zoneWeight}
                  onChange={(newRange) => {
                    if (linkedDays) {
                      setTarget((prev) => ({
                        ...prev,
                        defaultTimeRange: newRange,
                        dayTimeOverrides: {},
                      }));
                    } else {
                      setTarget((prev) => ({
                        ...prev,
                        dayTimeOverrides: { ...prev.dayTimeOverrides, [day]: newRange },
                      }));
                    }
                  }}
                />
              );
            })}
          </div>
        )}
        </section>
      </div>

      {/* Right Column: Sticky Campaign Estimate */}
      <div className="relative">
        <section className="sticky top-6 bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Campaign Estimate
          </p>
          <div className="grid grid-cols-2 gap-3">
            <StatTile
              label="Zones"
              value={selectedZones.length > 0 ? selectedZones.length : "—"}
            />
            <StatTile
              label="Days"
              value={campaignDays > 0 ? campaignDays : "—"}
            />
            <StatTile
              label="Taxis"
              value={totalAvailableTaxis > 0 ? <AnimatedNumber value={totalAvailableTaxis} /> : "—"}
            />
            <StatTile
              label="Impressions"
              value={estimatedImpressions > 0 ? <AnimatedImpressions value={estimatedImpressions} /> : "—"}
              highlight
            />
          </div>
          <div className="mt-4 pt-4 border-t border-border/50">
            <StatTile
              label="Estimated Cost"
              value={estimatedCost > 0 ? <AnimatedNumber value={estimatedCost} prefix="GH₵ " /> : "—"}
              highlight
              large
            />
          </div>
          
          <div className="mt-4 text-[10px] text-muted-foreground text-center px-2">
            Pricing dynamically adapts to traffic density, time of day, and location multiplier.
          </div>
        </section>
      </div>

    </div>
  );
}

// ── Time Range Slider ──

function TimeRangeSlider({
  label,
  dateStr,
  value,
  zoneCount,
  onChange,
}: {
  label: string;
  dateStr?: string;
  value: TimeRange;
  zoneCount: number;
  onChange: (range: TimeRange) => void;
}) {
  const hours = value[1] - value[0];
  const dayType: DayType = dateStr ? getDayType(dateStr) : "weekday";
  const hourlyRates = getHourlyRates(dayType);
  const slotCost = calcTimeRangeCost(value[0], value[1], dayType, zoneCount);

  const segments: { start: number; end: number; tier: RateTier; rate: number }[] = [];
  for (let h = 0; h < 24; h++) {
    const hr = hourlyRates[h];
    const last = segments[segments.length - 1];
    if (last && last.tier === hr.tier && last.rate === hr.rate) {
      last.end = h + 1;
    } else {
      segments.push({ start: h, end: h + 1, tier: hr.tier, rate: hr.rate });
    }
  }

  // Generate SVG Path for the histogram
  const maxRate = 100; // arbitrary max for scaling
  let histogramPath = `M 0,100 `;
  for (let i = 0; i <= 24; i++) {
     const hrIndex = Math.min(23, i);
     const rate = hourlyRates[hrIndex].rate;
     const x = (i / 24) * 100;
     const y = 100 - (rate / maxRate) * 100;
     // Add point
     histogramPath += `L ${x},${y} `;
  }
  histogramPath += `L 100,100 Z`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">
            {formatHour(value[0])} – {formatHour(value[1])}
          </span>
          <span className="text-xs text-muted-foreground">({hours}h)</span>
          {zoneCount > 0 && (
            <span className="text-xs font-bold text-primary ml-1">
              GH₵{slotCost.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <div>
        {/* Availability Bar */}
        <div className="flex h-1.5 rounded-sm overflow-hidden mb-1.5">
          {Array.from({ length: 24 }).map((_, h) => {
            const inRange = h >= value[0] && h < value[1];
            // Deterministic mock based on date and hour
            const str = (dateStr || "default") + h;
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash |= 0;
            }
            const val = Math.abs(hash) % 100;
            const isPeak = hourlyRates[h].tier !== "off-peak";
            const bookedPct = Math.min(100, val + (isPeak ? 40 : 0));
            
            let status = "green";
            if (bookedPct >= 90) status = "red";
            else if (bookedPct >= 50) status = "yellow";
            
            const bgColor = status === "green" ? "bg-emerald-500" : status === "yellow" ? "bg-amber-400" : "bg-rose-500";
            
            return (
              <div
                key={`avail-${h}`}
                className={cn(
                  "flex-1 border-r border-background/20 last:border-r-0",
                  bgColor
                )}
                title={`${formatHour(h)}–${formatHour(h + 1)}: ${status === "green" ? "< 50% booked" : status === "yellow" ? "≥ 50% booked" : "Fully booked"}`}
              />
            );
          })}
        </div>

        <div className="relative">
          {/* Histogram Base */}
          <div className="absolute -inset-x-0 bottom-0 h-10 overflow-hidden pointer-events-none z-0 opacity-[0.03]">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-foreground">
              <path d={histogramPath} />
            </svg>
          </div>

          <div className="flex h-7 rounded-md overflow-hidden border border-border relative z-10 w-full shadow-inner bg-background">
          {segments.map((seg) => {
            const widthPct = ((seg.end - seg.start) / 24) * 100;
            const inRange = seg.end > value[0] && seg.start < value[1];
            const isPeak = seg.tier !== "off-peak";
            return (
              <div
                key={`${seg.start}-${seg.rate}`}
                className={cn(
                  "flex items-center justify-center transition-opacity border-r border-white/10 last:border-r-0",
                  TIER_BG[seg.tier],
                  inRange ? "opacity-100" : "opacity-20"
                )}
                style={{ width: `${widthPct}%` }}
                title={`${formatHour(seg.start)}–${formatHour(seg.end)}: ${TIER_LABELS[seg.tier]} (GH₵${seg.rate}/hr)`}
              >
                {widthPct > 8 && (
                  <span className={cn("text-[9px] font-bold leading-none", isPeak ? "text-white" : "text-zinc-700")}>
                    GH₵{seg.rate}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        </div>
        <div className="mt-1">
          <Slider
            min={0}
            max={24}
            step={1}
            value={[value[0], value[1]]}
            onValueChange={([start, end]: [number, number]) => {
              if (end - start < 1) return;
              onChange([start, end] as TimeRange);
            }}
            aria-label={`Time range for ${label}`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex justify-between text-[10px] text-muted-foreground w-full">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> &lt;50% Booked
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" /> ≥50% Booked
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-sm bg-rose-500 inline-block" /> Full
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" /> Peak
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-sm bg-pink-600 inline-block" /> Fri/Sat Night
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-sm bg-zinc-400/80 inline-block" /> Off-Peak
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
