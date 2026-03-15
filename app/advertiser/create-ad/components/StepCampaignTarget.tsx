"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/lib/schemas/campaignData";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  X,
  Clock,
  CalendarDays,
  MapPin,
  Globe,
  Loader2,
  Link2,
  Link2Off,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDayType,
  calcTimeRangeCost,
  getHourlyRates,
  TIER_LABELS,
  TIER_BG,
  type DayType,
  type RateTier,
} from "@/lib/pricing";
import type { DateRange } from "react-day-picker";

const AccraZoneMap = dynamic(() => import("./AccraZoneMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/20">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">Loading map...</span>
    </div>
  ),
});

interface Props {
  data: CampaignTarget;
  onNext: (data: CampaignTarget) => void;
  onBack: () => void;
}


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

export function StepCampaignTarget({ data, onNext, onBack }: Props) {
  const [target, setTarget] = useState<CampaignTarget>(data);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  // When true, editing any day syncs all days to the same time range
  const [linkedDays, setLinkedDays] = useState(true);

  const cityZones = useMemo(
    () => getZonesForCity(target.city),
    [target.city]
  );

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === target.country),
    [target.country]
  );

  const selectedCity = useMemo(
    () => selectedCountry?.cities.find((c) => c.id === target.city),
    [selectedCountry, target.city]
  );

  const selectedZones = useMemo(
    () => cityZones.filter((z) => target.selectedZoneIds.includes(z.id)),
    [cityZones, target.selectedZoneIds]
  );

  const handleCountryChange = useCallback((code: string) => {
    setTarget((prev) => ({
      ...prev,
      country: code,
      city: "",
      selectedZoneIds: [],
      taxiCount: 50,
    }));
  }, []);

  const handleCityChange = useCallback((cityId: string) => {
    setTarget((prev) => ({
      ...prev,
      city: cityId,
      selectedZoneIds: [],
    }));
  }, []);

  const toggleZone = useCallback((zoneId: string) => {
    setTarget((prev) => {
      const ids = prev.selectedZoneIds.includes(zoneId)
        ? prev.selectedZoneIds.filter((id) => id !== zoneId)
        : [...prev.selectedZoneIds, zoneId];
      return { ...prev, selectedZoneIds: ids };
    });
  }, []);

  // Date range from Calendar
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

  // Campaign days list
  const campaignDaysList = useMemo(() => {
    if (!target.startDate || !target.endDate) return [];
    return getDaysBetween(target.startDate, target.endDate);
  }, [target.startDate, target.endDate]);

  const campaignDays = campaignDaysList.length;

  // Validation
  const hasCity = target.city !== "";
  const hasZones = target.selectedZoneIds.length > 0;
  const hasDates = target.startDate !== "" && target.endDate !== "";
  const datesValid = hasDates && target.endDate >= target.startDate;
  const hasTimeRange = target.defaultTimeRange[1] > target.defaultTimeRange[0];
  const canProceed = hasCity && hasZones && datesValid && hasTimeRange;

  // Average hours per day for estimates (accounting for overrides)
  const avgHoursPerDay = useMemo(() => {
    if (campaignDays === 0) return target.defaultTimeRange[1] - target.defaultTimeRange[0];
    let totalHours = 0;
    for (const day of campaignDaysList) {
      const [s, e] = getTimeRangeForDay(day, target.defaultTimeRange, target.dayTimeOverrides);
      totalHours += e - s;
    }
    return totalHours / campaignDays;
  }, [campaignDays, campaignDaysList, target.defaultTimeRange, target.dayTimeOverrides]);

  // Estimated metrics
  const totalDailyImpressions = selectedZones.reduce(
    (sum, z) => sum + z.estimatedDailyImpressions,
    0
  );
  const slotFraction = avgHoursPerDay / 16;
  const estimatedImpressions = Math.round(
    totalDailyImpressions * campaignDays * slotFraction
  );
  // Cost uses variable hourly rates based on day-of-week and time-of-day
  const estimatedCost = useMemo(() => {
    if (campaignDays === 0 || selectedZones.length === 0) return 0;
    let total = 0;
    for (const day of campaignDaysList) {
      const [s, e] = getTimeRangeForDay(day, target.defaultTimeRange, target.dayTimeOverrides);
      const dayType = getDayType(day);
      total += calcTimeRangeCost(s, e, dayType, selectedZones.length);
    }
    return Math.round(total);
  }, [campaignDays, campaignDaysList, selectedZones.length, target.defaultTimeRange, target.dayTimeOverrides]);
  // Compact formatter for impressions only (e.g. 4.5K, 1.2M)
  const formatImpressions = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
    return n.toLocaleString();
  };

  const hasOverrides = Object.keys(target.dayTimeOverrides).length > 0;
  void hasOverrides; // kept for avgHoursPerDay computation

  // Sub-step wizard inside the targeting panel
  const [panelStep, setPanelStep] = useState(0);
  const PANEL_STEPS = ["Location", "Zones", "Schedule"] as const;

  const panelStepValid = [
    hasCity,
    hasZones,
    datesValid && hasTimeRange,
  ];

  const canAdvancePanel = panelStepValid[panelStep];
  const isLastPanelStep = panelStep === PANEL_STEPS.length - 1;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-5 flex-shrink-0">
        <h2 className="text-2xl font-bold tracking-tight">Campaign Targeting</h2>
        <p className="text-muted-foreground mt-1">
          Select zones on the map, then configure delivery settings.
        </p>
      </div>

      {/* Main two-column layout */}
      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
        {/* LEFT COLUMN: sub-step wizard */}
        <div className="w-[420px] shrink-0 flex flex-col min-h-0 gap-4">

          {/* Sub-step progress dots */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {PANEL_STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <button
                  onClick={() => i < panelStep || panelStepValid[i - 1] ? setPanelStep(i) : null}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    i === panelStep
                      ? "text-primary"
                      : panelStepValid[i]
                      ? "text-muted-foreground hover:text-foreground cursor-pointer"
                      : "text-muted-foreground/40 cursor-default"
                  }`}
                >
                  <span className={`size-5 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                    i === panelStep
                      ? "bg-primary text-primary-foreground border-primary"
                      : panelStepValid[i]
                      ? "bg-muted border-border text-muted-foreground"
                      : "border-border/40 text-muted-foreground/40"
                  }`}>
                    {panelStepValid[i] && i !== panelStep ? "✓" : i + 1}
                  </span>
                  {label}
                </button>
                {i < PANEL_STEPS.length - 1 && (
                  <div className="h-px w-6 bg-border" />
                )}
              </div>
            ))}
          </div>

          {/* Active step card — flex-1 so it fills without scrolling */}
          <div className="flex-1 min-h-0 overflow-y-auto">

            {/* STEP 0: Location */}
            {panelStep === 0 && (
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="size-5 text-primary" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Country</label>
                      <Select value={target.country} onValueChange={handleCountryChange}>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">City</label>
                      <Select
                        value={target.city}
                        onValueChange={handleCityChange}
                        disabled={!selectedCountry}
                      >
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder={selectedCountry ? "Select city" : "Select country first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCountry?.cities.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Medium</label>
                      <Select
                        value={target.medium}
                        onValueChange={(val) => setTarget((prev) => ({ ...prev, medium: val }))}
                      >
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Select medium" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="headrest">
                            Headrest
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* STEP 1: Zones */}
            {panelStep === 1 && (
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="size-5 text-primary" />
                    Selected Zones
                    <span className="text-sm font-normal text-muted-foreground ml-auto">
                      {selectedZones.length} of {cityZones.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedZones.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-8 text-center">
                      <MapPin className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click zones on the map to select them
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedZones.map((z) => (
                        <Badge
                          key={z.id}
                          variant="secondary"
                          className="text-sm py-1 px-2.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                          onClick={() => toggleZone(z.id)}
                          onMouseEnter={() => setHoveredZoneId(z.id)}
                          onMouseLeave={() => setHoveredZoneId(null)}
                        >
                          {z.name}
                          <X className="size-3.5 ml-1.5" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* STEP 2: Schedule — calendar only (time window in right column) */}
            {panelStep === 2 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-5 text-primary" />
                      Campaign Schedule
                    </div>
                    <span className="text-xs font-normal text-muted-foreground">GMT</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-center">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={handleDateSelect}
                      numberOfMonths={1}
                      disabled={{ before: new Date() }}
                    />
                  </div>
                  {hasDates && datesValid && (
                    <p className="text-sm text-center text-muted-foreground">
                      {formatDateShort(target.startDate)} — {formatDateShort(target.endDate)}
                      {" · "}
                      <span className="font-medium text-foreground">
                        {campaignDays} day{campaignDays !== 1 ? "s" : ""}
                      </span>
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Campaign Estimate — compact bar */}
          <div className="flex-shrink-0 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 flex items-center gap-0">
            {/* Zones */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold leading-none">Zones</p>
              <p className="text-xs font-bold leading-tight">{selectedZones.length > 0 ? selectedZones.length : "—"}</p>
            </div>
            <div className="w-px h-7 bg-primary/20 mx-2 shrink-0" />
            {/* Duration */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold leading-none">Days</p>
              <p className="text-xs font-bold leading-tight">{campaignDays > 0 ? campaignDays : "—"}</p>
            </div>
            <div className="w-px h-7 bg-primary/20 mx-2 shrink-0" />
            {/* Taxis */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold leading-none">Taxis</p>
              <p className="text-xs font-bold leading-tight">
                {selectedZones.length > 0
                  ? selectedZones.reduce((sum, z) => sum + z.availableTaxis, 0).toLocaleString()
                  : "—"}
              </p>
            </div>
            <div className="w-px h-7 bg-primary/20 mx-2 shrink-0" />
            {/* Impressions */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-primary/80 uppercase font-bold leading-none">Impr.</p>
              <p className="text-xs font-black text-primary leading-tight">
                {estimatedImpressions > 0 ? formatImpressions(estimatedImpressions) : "—"}
              </p>
            </div>
            <div className="w-px h-7 bg-primary/20 mx-3 shrink-0" />
            {/* Cost */}
            <div className="text-right shrink-0">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold leading-none">Cost</p>
              <p className="text-sm font-black text-primary leading-tight">
                {estimatedCost > 0 ? `GH₵${estimatedCost.toLocaleString()}` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Map (steps 0 & 1) or Time Window (step 2) */}
        {panelStep !== 2 ? (
          <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-border relative">
            <AccraZoneMap
              zones={cityZones}
              center={selectedCity?.center ?? [5.6037, -0.1870]}
              zoom={selectedCity?.zoom ?? 12}
              selectedZoneIds={target.selectedZoneIds}
              hoveredZoneId={hoveredZoneId}
              onToggleZone={toggleZone}
              onHoverZone={setHoveredZoneId}
            />
            {/* Map legend */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Zone Status</p>
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded-sm bg-[#9ca3af]/40 border border-[#9ca3af]" /> Unselected
                </span>
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded-sm bg-[#6FB4A6]/60 border border-[#4a9a8a]" /> Selected
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Daily Time Window panel */
          <div className="flex-1 min-h-0 flex flex-col">
            <Card className="flex flex-col min-h-0 h-full">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-primary" />
                    Daily Time Window
                  </div>
                  {campaignDays > 1 && (
                    <button
                      onClick={() => {
                        setLinkedDays((prev) => {
                          if (!prev) setTarget((t) => ({ ...t, dayTimeOverrides: {} }));
                          return !prev;
                        });
                      }}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border transition-colors ${
                        linkedDays
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                      title={linkedDays ? "Days linked — click to edit individually" : "Days unlinked — click to sync all"}
                    >
                      {linkedDays ? <Link2 className="size-3.5" /> : <Link2Off className="size-3.5" />}
                      {linkedDays ? "Linked" : "Individual"}
                    </button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-4">
                {campaignDays === 0 ? (
                  <p className="text-sm text-muted-foreground">Select dates on the left to configure time windows.</p>
                ) : campaignDays === 1 ? (
                  <TimeRangeSlider
                    label={formatDateShort(campaignDaysList[0])}
                    dateStr={campaignDaysList[0]}
                    value={target.defaultTimeRange}
                    zoneCount={selectedZones.length}
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
                          zoneCount={selectedZones.length}
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border mt-4 flex-shrink-0">
        <Button
          variant="outline"
          size="lg"
          onClick={panelStep === 0 ? onBack : () => setPanelStep((s) => s - 1)}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>

        {isLastPanelStep ? (
          <Button
            size="lg"
            className="px-8"
            disabled={!canProceed}
            onClick={() => onNext(target)}
          >
            Next: Payment
            <ArrowRight className="ml-2 size-4" />
          </Button>
        ) : (
          <Button
            size="lg"
            className="px-8"
            disabled={!canAdvancePanel}
            onClick={() => setPanelStep((s) => s + 1)}
          >
            Next
            <ArrowRight className="ml-2 size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}



// --- Time Range Slider sub-component ---

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

  // Build rate segments for the visual bar (group consecutive hours with the same tier)
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

  return (
    <div className="space-y-2">
      {/* Header: label, time range, cost */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground font-medium">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {formatHour(value[0])} – {formatHour(value[1])}
          </span>
          <span className="text-xs text-muted-foreground">
            ({hours}h)
          </span>
          {zoneCount > 0 && (
            <span className="text-xs font-bold text-primary ml-1">
              GH₵{slotCost.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Rate tier bar — shows pricing bands behind the slider */}
      <div className="relative">
        {/* Color-coded rate bar with hourly prices */}
        <div className="flex h-7 rounded-md overflow-hidden mb-1 border border-border">
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
                  <span className={cn(
                    "text-[9px] font-bold leading-none",
                    isPeak ? "text-white" : "text-zinc-700"
                  )}>
                    GH₵{seg.rate}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Slider */}
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

      {/* Timeline labels with legend */}
      <div className="flex items-center justify-between">
        <div className="flex justify-between text-[10px] text-muted-foreground flex-1">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
        <div className="flex items-center gap-2 ml-3">
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
  );
}
