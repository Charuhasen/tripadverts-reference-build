import { getDayType, calcTimeRangeCost } from "@/lib/pricing";

// ── Types ──

export type CampaignStatus = "pending" | "running" | "completed";

export interface BookingSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export interface CampaignZone {
  name: string;
  city: string;
}

export interface ProofOfPlayEntry {
  zone: string;
  city: string;
  device: string;
  playsDelivered: number;
  date: string;
  timeWindow: string;
}

export interface ProofOfPlaySummary {
  entries: ProofOfPlayEntry[];
  totalPlays: number;
  totalDevices: number;
  estimatedImpressions: number;
}

export interface DemoCampaign {
  id: string;
  name: string;
  status: CampaignStatus;
  objective: "awareness" | "engagement" | "promotion";
  description: string;
  createdAt: string;
  advertiser: string;
  advertiserType: "business" | "sole";
  zones: CampaignZone[];
  bookingSlots: BookingSlot[];
  adType: "image" | "video";
  thumbnail: string;
  estimatedImpressions: number;
  proofOfPlay?: ProofOfPlaySummary;
}

// ── Helpers ──

function parseHour(time: string): number {
  return parseInt(time.split(":")[0], 10);
}

export function calcSlotCost(slot: BookingSlot, zoneCount: number): number {
  const dayType = getDayType(slot.date);
  const startH = parseHour(slot.startTime);
  let endH = parseHour(slot.endTime);
  if (slot.endTime === "23:59" || slot.endTime === "24:00") endH = 24;
  const endMin = parseInt(slot.endTime.split(":")[1], 10);
  if (endMin > 0 && endH < 24) endH += 1;
  return calcTimeRangeCost(startH, endH, dayType, zoneCount);
}

export function calcCampaignCost(c: DemoCampaign): number {
  return c.bookingSlots.reduce((sum, slot) => sum + calcSlotCost(slot, c.zones.length), 0);
}

export function uniqueDates(slots: BookingSlot[]): string[] {
  return [...new Set(slots.map((s) => s.date))];
}

export function dateRange(slots: BookingSlot[]): string {
  const dates = uniqueDates(slots).sort();
  if (dates.length === 1) return dates[0];
  return `${dates[0]} → ${dates[dates.length - 1]}`;
}

// ── Demo Data ──

export const DEMO_CAMPAIGNS: DemoCampaign[] = [
  {
    id: "cmp_001",
    name: "Ramadan Promo — Accra",
    status: "completed",
    objective: "promotion",
    description: "Ramadan special offers on selected products across Accra zones",
    createdAt: "2026-02-01",
    advertiser: "Al-Noor Trading Co.",
    advertiserType: "business",
    adType: "video",
    thumbnail: "/thumbnails/ramadan-promo.svg",
    zones: [
      { name: "East Legon", city: "Accra" },
      { name: "Osu", city: "Accra" },
      { name: "Airport City", city: "Accra" },
      { name: "Spintex", city: "Accra" },
    ],
    bookingSlots: [
      { date: "2026-02-15", startTime: "06:00", endTime: "10:00" },
      { date: "2026-02-15", startTime: "16:00", endTime: "20:00" },
      { date: "2026-02-16", startTime: "06:00", endTime: "10:00" },
      { date: "2026-02-16", startTime: "16:00", endTime: "20:00" },
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
    advertiser: "BrandWave Nigeria",
    advertiserType: "business",
    adType: "image",
    thumbnail: "/thumbnails/new-year-push.svg",
    zones: [
      { name: "Victoria Island", city: "Lagos" },
      { name: "Lekki", city: "Lagos" },
      { name: "Ikeja", city: "Lagos" },
    ],
    bookingSlots: [
      { date: "2025-12-26", startTime: "07:00", endTime: "22:00" },
      { date: "2025-12-27", startTime: "07:00", endTime: "22:00" },
      { date: "2025-12-31", startTime: "10:00", endTime: "23:59" },
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
    advertiser: "BrandWave Nigeria",
    advertiserType: "business",
    adType: "video",
    thumbnail: "/thumbnails/spring-collection.svg",
    zones: [
      { name: "Cantonments", city: "Accra" },
      { name: "Osu", city: "Accra" },
      { name: "Kwame Nkrumah Circle", city: "Accra" },
    ],
    bookingSlots: [
      { date: "2026-03-10", startTime: "07:00", endTime: "19:00" },
      { date: "2026-03-11", startTime: "07:00", endTime: "19:00" },
      { date: "2026-03-15", startTime: "12:00", endTime: "18:00" },
      { date: "2026-03-16", startTime: "07:00", endTime: "19:00" },
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
    advertiser: "PesaFast Ltd.",
    advertiserType: "business",
    adType: "image",
    thumbnail: "/thumbnails/fintech-app.svg",
    zones: [
      { name: "Westlands", city: "Nairobi" },
      { name: "CBD", city: "Nairobi" },
    ],
    bookingSlots: [
      { date: "2026-03-12", startTime: "06:00", endTime: "09:00" },
      { date: "2026-03-12", startTime: "16:00", endTime: "19:00" },
      { date: "2026-03-13", startTime: "06:00", endTime: "09:00" },
      { date: "2026-03-13", startTime: "18:00", endTime: "22:00" },
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
    advertiser: "ConnectAfrica Telecom",
    advertiserType: "business",
    adType: "video",
    thumbnail: "/thumbnails/telecom-bundle.svg",
    zones: [
      { name: "East Legon", city: "Accra" },
      { name: "Victoria Island", city: "Lagos" },
      { name: "Westlands", city: "Nairobi" },
    ],
    bookingSlots: [
      { date: "2026-03-22", startTime: "12:00", endTime: "18:00" },
      { date: "2026-03-23", startTime: "06:00", endTime: "20:00" },
      { date: "2026-03-24", startTime: "06:00", endTime: "20:00" },
      { date: "2026-03-27", startTime: "06:00", endTime: "23:00" },
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
    advertiser: "Kofi Mensah Properties",
    advertiserType: "sole",
    adType: "image",
    thumbnail: "/thumbnails/real-estate.svg",
    zones: [
      { name: "Spintex", city: "Accra" },
      { name: "Madina", city: "Accra" },
    ],
    bookingSlots: [
      { date: "2026-03-22", startTime: "12:00", endTime: "18:00" },
      { date: "2026-03-28", startTime: "08:00", endTime: "18:00" },
    ],
    estimatedImpressions: 9_400,
  },
];
