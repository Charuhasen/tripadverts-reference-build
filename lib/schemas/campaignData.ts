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
  estimatedDailyFootfall: number; // unique people passing through per day
  pois: string[]; // notable landmarks / points of interest
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

export interface SupportingDoc {
  file: File;
  name: string;
}

export interface CampaignInfo {
  name: string;
  objective: CampaignObjective | "";
  description: string;
  adContent: {
    file: File | null;
    previewUrl: string;
    type: "image" | "video" | null;
  };
  supportingDocs: SupportingDoc[];
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
    supportingDocs: [],
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
    id: "airport-city",
    name: "Airport City",
    category: "CBD",
    trafficDensity: "High",
    availableTaxis: 38,
    estimatedDailyImpressions: 52000,
    estimatedDailyFootfall: 85000,
    pois: ["Kotoka Int'l Airport", "A&C Mall", "Movenpick Hotel", "Papaye", "Fiesta Royale Hotel"],
    center: [5.6050, -0.1720],
    polygon: [
      [5.615131631401568,  -0.21311759948730472],
      [5.62187968051697,   -0.17938613891601562],
      [5.628883901916142,  -0.1577568054199219],
      [5.635204712203097,  -0.1408481597900391],
      [5.623331782126395,  -0.1378440856933594],
      [5.617181679906836,  -0.1353549957275391],
      [5.609237701786533,  -0.13423919677734378],
      [5.596510027538425,  -0.13200759887695315],
      [5.588224077252476,  -0.1309776306152344],
      [5.579938009720149,  -0.13114929199218753],
      [5.564048934332006,  -0.1316642761230469],
      [5.560033884929737,  -0.14642715454101565],
      [5.554993677761772,  -0.1598167419433594],
      [5.572591501412461,  -0.19002914428710938],
      [5.5920680893977,    -0.20522117614746097],
      [5.605222962007942,  -0.20985603332519534],
    ],
  },
  {
    id: "achimota",
    name: "Achimota",
    category: "Mixed",
    trafficDensity: "High",
    availableTaxis: 35,
    estimatedDailyImpressions: 34000,
    estimatedDailyFootfall: 55000,
    pois: ["Achimota Mall", "Achimota School", "Achimota Forest Reserve", "Total Fuel Station"],
    center: [5.6150, -0.2350],
    polygon: [
      [5.615046212557332, -0.21595001220703128],
      [5.622135934005429, -0.2191257476806641],
      [5.629310985858113, -0.22041320800781253],
      [5.635290128087331, -0.21526336669921875],
      [5.639902567172363, -0.21964073181152347],
      [5.644087896832487, -0.22427558898925784],
      [5.648700265950634, -0.2295970916748047],
      [5.646308671731061, -0.2346611022949219],
      [5.649725231879521, -0.23912429809570315],
      [5.64998147307833,  -0.2438449859619141],
      [5.647589884147804, -0.24916648864746097],
      [5.64605242890779,  -0.2549171447753907],
      [5.641269208749559, -0.2592086791992188],
      [5.636656780526122, -0.26006698608398443],
      [5.631702650133715, -0.2605819702148438],
      [5.625808888273004, -0.26023864746093756],
      [5.620683829412567, -0.26006698608398443],
      [5.616242075237301, -0.25938034057617193],
      [5.6110315127585295,-0.2585220336914063],
      [5.607956404858025, -0.2575778961181641],
      [5.60351455372701,  -0.256032943725586],
    ],
  },
  {
    id: "accra-central",
    name: "Accra Central",
    category: "CBD",
    trafficDensity: "High",
    availableTaxis: 50,
    estimatedDailyImpressions: 60000,
    estimatedDailyFootfall: 120000,
    pois: ["Makola Market", "National Theatre", "Accra High Street", "Melcom (High St)", "Barclays Bank HQ"],
    center: [5.559, -0.200],
    polygon: [
      [5.530048289559503,  -0.2223014831542969],
      [5.540641665336457,  -0.22315979003906253],
      [5.549013715023947,  -0.22933959960937503],
      [5.55875248041786,   -0.23088455200195315],
      [5.564561491857723,  -0.22624969482421878],
      [5.569174489481756,  -0.21835327148437503],
      [5.570882997931688,  -0.21097183227539065],
      [5.5732749014130665, -0.20101547241210938],
      [5.574470849500126,  -0.19535064697265628],
      [5.571908100616539,  -0.19174575805664065],
      [5.569174489481756,  -0.18573760986328128],
      [5.565586605568947,  -0.17990112304687503],
      [5.563023817940555,  -0.17509460449218753],
      [5.558410772076948,  -0.16822814941406253],
      [5.55328512317068,   -0.16376495361328128],
      [5.532952943737817,  -0.20891189575195315],
    ],
  },
];

// Populate zones by city
ZONES_BY_CITY.accra = ACCRA_ZONES;

// Helper to get zones for a city
export function getZonesForCity(cityId: string): Zone[] {
  return ZONES_BY_CITY[cityId] ?? [];
}
