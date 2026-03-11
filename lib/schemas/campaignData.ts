export type CampaignObjective = "awareness" | "engagement" | "promotion";

export type ZoneCategory = "Commercial" | "Residential" | "CBD" | "Mixed";
export type TrafficDensity = "Low" | "Medium" | "High";

export interface Zone {
  id: string;
  name: string;
  category: ZoneCategory;
  trafficDensity: TrafficDensity;
  availableTaxis: number;
  estimatedDailyImpressions: number;
  polygon: [number, number][]; // [lat, lng] pairs
  center: [number, number]; // [lat, lng]
}

export interface City {
  id: string;
  name: string;
  country: string;
  center: [number, number];
  zoom: number;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  cities: City[];
}

export const COUNTRIES: Country[] = [
  {
    code: "GH",
    name: "Ghana",
    flag: "🇬🇭",
    cities: [
      { id: "accra", name: "Accra", country: "GH", center: [5.6037, -0.1870], zoom: 12 },
      { id: "kumasi", name: "Kumasi", country: "GH", center: [6.6885, -1.6244], zoom: 12 },
    ],
  },
  {
    code: "NG",
    name: "Nigeria",
    flag: "🇳🇬",
    cities: [
      { id: "lagos", name: "Lagos", country: "NG", center: [6.5244, 3.3792], zoom: 12 },
      { id: "abuja", name: "Abuja", country: "NG", center: [9.0579, 7.4951], zoom: 12 },
    ],
  },
  {
    code: "KE",
    name: "Kenya",
    flag: "🇰🇪",
    cities: [
      { id: "nairobi", name: "Nairobi", country: "KE", center: [-1.2921, 36.8219], zoom: 12 },
    ],
  },
];

// Zone data keyed by city ID (only Accra has zones for now)
export const ZONES_BY_CITY: Record<string, Zone[]> = {
  accra: [], // populated below
};

export interface CampaignInfo {
  name: string;
  objective: CampaignObjective | "";
  description: string;
  adContent: {
    file: File | null;
    previewUrl: string;
    type: "image" | "video" | null;
  };
}

// [startHour, endHour] e.g. [9, 17] means 09:00–17:00
export type TimeRange = [number, number];

export interface CampaignTarget {
  country: string; // country code e.g. "GH"
  city: string; // city id e.g. "accra"
  medium: string; // e.g. "headrest"
  selectedZoneIds: string[];
  taxiCount: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  defaultTimeRange: TimeRange;
  dayTimeOverrides: Record<string, TimeRange>; // "YYYY-MM-DD" -> [start, end]
}

export type PaymentMethod = "momo" | "stripe" | "";

export interface CampaignPayment {
  method: PaymentMethod;
  momoPhone: string;
}

export interface CampaignDraft {
  campaignInfo: CampaignInfo;
  campaignTarget: CampaignTarget;
  campaignPayment: CampaignPayment;
}

export const initialCampaignDraft: CampaignDraft = {
  campaignInfo: {
    name: "",
    objective: "",
    description: "",
    adContent: { file: null, previewUrl: "", type: null },
  },
  campaignTarget: {
    country: "",
    city: "",
    medium: "headrest",
    selectedZoneIds: [],
    taxiCount: 10,
    startDate: "",
    endDate: "",
    defaultTimeRange: [8, 18],
    dayTimeOverrides: {},
  },
  campaignPayment: {
    method: "",
    momoPhone: "",
  },
};

// Zone data for Accra with real approximate polygon boundaries
const ACCRA_ZONES: Zone[] = [
  {
    id: "east-legon",
    name: "East Legon",
    category: "Mixed",
    trafficDensity: "High",
    availableTaxis: 42,
    estimatedDailyImpressions: 38000,
    center: [5.6350, -0.1570],
    polygon: [
      [5.6490, -0.1720],
      [5.6510, -0.1640],
      [5.6485, -0.1530],
      [5.6440, -0.1460],
      [5.6370, -0.1440],
      [5.6290, -0.1470],
      [5.6240, -0.1540],
      [5.6230, -0.1630],
      [5.6270, -0.1730],
      [5.6350, -0.1780],
      [5.6440, -0.1760],
    ],
  },
  {
    id: "legon",
    name: "Legon",
    category: "Mixed",
    trafficDensity: "Medium",
    availableTaxis: 28,
    estimatedDailyImpressions: 22000,
    center: [5.6508, -0.1870],
    polygon: [
      [5.6620, -0.1980],
      [5.6600, -0.1780],
      [5.6540, -0.1680],
      [5.6470, -0.1700],
      [5.6430, -0.1780],
      [5.6430, -0.1900],
      [5.6470, -0.1990],
      [5.6540, -0.2020],
      [5.6600, -0.2000],
    ],
  },
  {
    id: "airport-city",
    name: "Airport City",
    category: "CBD",
    trafficDensity: "High",
    availableTaxis: 38,
    estimatedDailyImpressions: 52000,
    center: [5.6050, -0.1720],
    polygon: [
      [5.6130, -0.1840],
      [5.6160, -0.1750],
      [5.6140, -0.1660],
      [5.6090, -0.1600],
      [5.6020, -0.1590],
      [5.5960, -0.1630],
      [5.5940, -0.1710],
      [5.5960, -0.1800],
      [5.6020, -0.1850],
      [5.6090, -0.1860],
    ],
  },
  {
    id: "spintex",
    name: "Spintex",
    category: "Commercial",
    trafficDensity: "High",
    availableTaxis: 45,
    estimatedDailyImpressions: 48000,
    center: [5.6320, -0.1200],
    polygon: [
      [5.6470, -0.1350],
      [5.6490, -0.1200],
      [5.6450, -0.1060],
      [5.6370, -0.0980],
      [5.6280, -0.0980],
      [5.6200, -0.1040],
      [5.6170, -0.1140],
      [5.6200, -0.1260],
      [5.6270, -0.1360],
      [5.6370, -0.1390],
    ],
  },
  {
    id: "osu",
    name: "Osu",
    category: "Commercial",
    trafficDensity: "High",
    availableTaxis: 55,
    estimatedDailyImpressions: 45000,
    center: [5.5560, -0.1820],
    polygon: [
      [5.5640, -0.1930],
      [5.5660, -0.1840],
      [5.5630, -0.1740],
      [5.5570, -0.1690],
      [5.5490, -0.1720],
      [5.5460, -0.1810],
      [5.5490, -0.1920],
      [5.5570, -0.1960],
    ],
  },
  {
    id: "circle",
    name: "Kwame Nkrumah Circle",
    category: "CBD",
    trafficDensity: "High",
    availableTaxis: 65,
    estimatedDailyImpressions: 72000,
    center: [5.5710, -0.2250],
    polygon: [
      [5.5810, -0.2360],
      [5.5830, -0.2250],
      [5.5800, -0.2140],
      [5.5730, -0.2080],
      [5.5640, -0.2100],
      [5.5600, -0.2200],
      [5.5620, -0.2330],
      [5.5700, -0.2390],
      [5.5780, -0.2380],
    ],
  },
  {
    id: "cantonments",
    name: "Cantonments",
    category: "Residential",
    trafficDensity: "Medium",
    availableTaxis: 25,
    estimatedDailyImpressions: 18000,
    center: [5.5750, -0.1850],
    polygon: [
      [5.5840, -0.1970],
      [5.5860, -0.1860],
      [5.5830, -0.1760],
      [5.5760, -0.1710],
      [5.5680, -0.1740],
      [5.5650, -0.1840],
      [5.5670, -0.1950],
      [5.5740, -0.2000],
      [5.5820, -0.1980],
    ],
  },
  {
    id: "dansoman",
    name: "Dansoman",
    category: "Residential",
    trafficDensity: "Medium",
    availableTaxis: 22,
    estimatedDailyImpressions: 16000,
    center: [5.5380, -0.2580],
    polygon: [
      [5.5490, -0.2710],
      [5.5520, -0.2590],
      [5.5490, -0.2470],
      [5.5410, -0.2410],
      [5.5310, -0.2440],
      [5.5270, -0.2560],
      [5.5300, -0.2690],
      [5.5390, -0.2740],
    ],
  },
  {
    id: "achimota",
    name: "Achimota",
    category: "Mixed",
    trafficDensity: "High",
    availableTaxis: 35,
    estimatedDailyImpressions: 34000,
    center: [5.6150, -0.2350],
    polygon: [
      [5.6320, -0.2490],
      [5.6350, -0.2370],
      [5.6310, -0.2240],
      [5.6230, -0.2160],
      [5.6120, -0.2160],
      [5.6040, -0.2230],
      [5.6010, -0.2370],
      [5.6060, -0.2500],
      [5.6170, -0.2550],
      [5.6280, -0.2530],
    ],
  },
  {
    id: "madina",
    name: "Madina",
    category: "Commercial",
    trafficDensity: "High",
    availableTaxis: 40,
    estimatedDailyImpressions: 41000,
    center: [5.6700, -0.1680],
    polygon: [
      [5.6820, -0.1800],
      [5.6850, -0.1690],
      [5.6820, -0.1570],
      [5.6750, -0.1490],
      [5.6650, -0.1490],
      [5.6570, -0.1570],
      [5.6560, -0.1700],
      [5.6610, -0.1810],
      [5.6710, -0.1840],
      [5.6790, -0.1820],
    ],
  },
];

// Populate zones by city
ZONES_BY_CITY.accra = ACCRA_ZONES;

// Helper to get zones for a city
export function getZonesForCity(cityId: string): Zone[] {
  return ZONES_BY_CITY[cityId] ?? [];
}
