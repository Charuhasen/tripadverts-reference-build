// ── DOOH Hourly Rate Engine ──
//
// Rates are per hour, per zone (in GHS).
// Pricing varies by day-of-week and time-of-day.
//
// Weekdays (Mon–Thu):
//   06–09  Peak (commute)         GHS 130/hr
//   16–19  Peak (commute)         GHS 130/hr
//   10–15  Off-peak               GHS 80/hr
//   00–05, 20–23  Off-peak        GHS 55/hr
//
// Friday:
//   06–09  Peak                   GHS 130/hr
//   10–17  Off-peak               GHS 80/hr
//   18–23  Fri Night (premium)    GHS 190/hr
//   00–05  Off-peak               GHS 55/hr
//
// Saturday:
//   06–11  Off-peak               GHS 90/hr
//   12–17  Peak                   GHS 120/hr
//   18–23  Sat Night (premium)    GHS 190/hr
//   00–05  Off-peak               GHS 55/hr
//
// Sunday (Accra — church attendance shapes traffic):
//   06–12  Off-peak (church)      GHS 50/hr
//   12–18  Peak                   GHS 120/hr
//   18–21  Off-peak               GHS 80/hr
//   22–23, 00–05  Off-peak        GHS 50/hr

export type DayType = "weekday" | "friday" | "saturday" | "sunday";

export type RateTier = "off-peak" | "peak" | "fri-night" | "sat-night";

export interface HourRate {
  rate: number;
  tier: RateTier;
}

export const TIER_LABELS: Record<RateTier, string> = {
  "off-peak": "Off-Peak",
  "peak": "Peak",
  "fri-night": "Fri Night",
  "sat-night": "Sat Night",
};

export const TIER_COLORS: Record<RateTier, string> = {
  "off-peak": "text-muted-foreground",
  "peak": "text-orange-500",
  "fri-night": "text-pink-500",
  "sat-night": "text-pink-500",
};

export const TIER_BG: Record<RateTier, string> = {
  "off-peak": "bg-zinc-400/80",
  "peak": "bg-orange-500",
  "fri-night": "bg-pink-600",
  "sat-night": "bg-pink-600",
};

export function getDayType(dateStr: string): DayType {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0=Sun, 5=Fri, 6=Sat
  if (day === 0) return "sunday";
  if (day === 5) return "friday";
  if (day === 6) return "saturday";
  return "weekday";
}

export function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function getHourRate(hour: number, dayType: DayType): HourRate {
  switch (dayType) {
    case "weekday":
      if (hour >= 6 && hour < 10) return { rate: 130, tier: "peak" };
      if (hour >= 16 && hour < 20) return { rate: 130, tier: "peak" };
      if (hour >= 10 && hour < 16) return { rate: 80, tier: "off-peak" };
      return { rate: 55, tier: "off-peak" };

    case "friday":
      if (hour >= 6 && hour < 10) return { rate: 130, tier: "peak" };
      if (hour >= 10 && hour < 18) return { rate: 80, tier: "off-peak" };
      if (hour >= 18) return { rate: 190, tier: "fri-night" };
      return { rate: 55, tier: "off-peak" };

    case "saturday":
      if (hour >= 6 && hour < 12) return { rate: 90, tier: "off-peak" };
      if (hour >= 12 && hour < 18) return { rate: 120, tier: "peak" };
      if (hour >= 18) return { rate: 190, tier: "sat-night" };
      return { rate: 55, tier: "off-peak" };

    case "sunday":
      if (hour >= 6 && hour < 12) return { rate: 50, tier: "off-peak" };
      if (hour >= 12 && hour < 18) return { rate: 120, tier: "peak" };
      if (hour >= 18 && hour < 22) return { rate: 80, tier: "off-peak" };
      return { rate: 50, tier: "off-peak" };
  }
}

/**
 * Multiplier applied based on how many ad rotation slots an ad occupies.
 * More slots = more screen time monopolised = higher cost.
 * 1 slot → 1.0×, 2 → 1.25×, 3 → 1.5×, 4+ → 2.0×
 */
export function getSlotMultiplier(slotCount: number): number {
  if (slotCount <= 1) return 1.0;
  if (slotCount === 2) return 1.25;
  if (slotCount === 3) return 1.5;
  return 2.0;
}

/** Calculate the cost for a time range on a given day, for a given number of zones. */
export function calcTimeRangeCost(
  startHour: number,
  endHour: number,
  dayType: DayType,
  zoneCount: number
): number {
  let total = 0;
  for (let h = startHour; h < endHour; h++) {
    total += getHourRate(h, dayType).rate * zoneCount;
  }
  return total;
}

/** Get an array of rates for each hour in [0..23], for a given day type. */
export function getHourlyRates(dayType: DayType): HourRate[] {
  return Array.from({ length: 24 }, (_, h) => getHourRate(h, dayType));
}
