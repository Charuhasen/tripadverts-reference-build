// ── DOOH Hourly Rate Engine ──
//
// Rates are per hour, per zone (in GHS).
// Pricing varies by day-of-week and time-of-day.
//
// Weekdays (Mon–Thu):
//   06–09  Peak (commute)         GHS 30/hr
//   16–19  Peak (commute)         GHS 30/hr
//   10–15  Off-peak               GHS 18/hr
//   00–05, 20–23  Off-peak        GHS 12/hr
//
// Friday:
//   06–09  Peak                   GHS 30/hr
//   10–17  Off-peak               GHS 18/hr
//   18–23  Fri Night (premium)    GHS 45/hr
//   00–05  Off-peak               GHS 12/hr
//
// Saturday:
//   06–11  Off-peak               GHS 20/hr
//   12–17  Peak                   GHS 25/hr
//   18–23  Sat Night (premium)    GHS 45/hr
//   00–05  Off-peak               GHS 12/hr
//
// Sunday (Accra — church attendance shapes traffic):
//   06–12  Off-peak (church)      GHS 10/hr
//   12–18  Peak                   GHS 28/hr
//   18–21  Off-peak               GHS 18/hr
//   22–23, 00–05  Off-peak        GHS 10/hr

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
      if (hour >= 6 && hour < 10) return { rate: 30, tier: "peak" };
      if (hour >= 16 && hour < 20) return { rate: 30, tier: "peak" };
      if (hour >= 10 && hour < 16) return { rate: 18, tier: "off-peak" };
      return { rate: 12, tier: "off-peak" };

    case "friday":
      if (hour >= 6 && hour < 10) return { rate: 30, tier: "peak" };
      if (hour >= 10 && hour < 18) return { rate: 18, tier: "off-peak" };
      if (hour >= 18) return { rate: 45, tier: "fri-night" };
      return { rate: 12, tier: "off-peak" };

    case "saturday":
      if (hour >= 6 && hour < 12) return { rate: 20, tier: "off-peak" };
      if (hour >= 12 && hour < 18) return { rate: 25, tier: "peak" };
      if (hour >= 18) return { rate: 45, tier: "sat-night" };
      return { rate: 12, tier: "off-peak" };

    case "sunday":
      if (hour >= 6 && hour < 12) return { rate: 10, tier: "off-peak" };
      if (hour >= 12 && hour < 18) return { rate: 28, tier: "peak" };
      if (hour >= 18 && hour < 22) return { rate: 18, tier: "off-peak" };
      return { rate: 10, tier: "off-peak" };
  }
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
