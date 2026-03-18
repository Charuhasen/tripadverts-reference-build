"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  BadgeCheck,
  MapPin,
  Users,
  Search,
  X,
  Tv,
  Tablet,
  Monitor,
  Image,
  Gavel,
  ShoppingCart,
  Clock,
  ChevronRight,
  Building2,
  Plane,
  Hotel,
  GraduationCap,
  ShoppingBag,
  HeartPulse,
  Clapperboard,
  Layers,
  TrendingUp,
  Briefcase,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──

type Category = "airport" | "hotel" | "university" | "mall" | "hospital" | "cinema" | "corporate";
type ScreenType = "video-wall" | "large-display" | "kiosk" | "digital-poster";
type ListingType = "fixed" | "auction";
type SortKey = "recommended" | "footfall" | "impressions" | "price-asc";
type ListingFilter = "all" | "fixed" | "auction";

interface AdSlot {
  id: string;
  name: string;
  type: ScreenType;
  dimensions: string;
  dailyImpressions: number;
  audience: string;
  listingType: ListingType;
  fixedPrice?: number;
  currentBid?: number;
  minBid?: number;
  auctionEnds?: string;
  priceUnit: string;
}

interface Venue {
  id: string;
  name: string;
  shortName: string;
  category: Category;
  location: string;
  description: string;
  dailyFootfall: number;
  gradientFrom: string;
  gradientTo: string;
  verified: boolean;
  featured: boolean;
  slots: AdSlot[];
}

// ── Data ──

const VENUES: Venue[] = [
  {
    id: "v1",
    name: "Kotoka International Airport",
    shortName: "KIA",
    category: "airport",
    location: "Airport City, Accra",
    description: "Ghana's premier international gateway serving over 3.5M passengers annually. High-dwell departure and arrival halls filled with affluent domestic and international travelers.",
    dailyFootfall: 9600,
    gradientFrom: "#0ea5e9",
    gradientTo: "#1e40af",
    verified: true,
    featured: true,
    slots: [
      { id: "s1", name: "Main Departure Hall — Video Wall", type: "video-wall", dimensions: "3840×2160", dailyImpressions: 8200, audience: "Departing international & domestic passengers", listingType: "auction", currentBid: 4200, minBid: 500, auctionEnds: "2026-03-24", priceUnit: "per week" },
      { id: "s2", name: "Arrivals Concourse — Kiosk Row", type: "kiosk", dimensions: "1080×1920", dailyImpressions: 6400, audience: "Arriving passengers and greeters", listingType: "fixed", fixedPrice: 850, priceUnit: "per day" },
      { id: "s3", name: "VIP Lounge Entrance Display", type: "digital-poster", dimensions: "1920×1080", dailyImpressions: 1100, audience: "Business and first-class travelers", listingType: "fixed", fixedPrice: 1200, priceUnit: "per day" },
    ],
  },
  {
    id: "v2",
    name: "Kempinski Hotel Gold Coast City",
    shortName: "Kempinski",
    category: "hotel",
    location: "Gamel Abdul Nasser Ave, Accra",
    description: "Accra's leading five-star luxury property. Hosts heads of state, C-suite executives, and high-net-worth individuals year-round. Premium lobby and conference wing exposure.",
    dailyFootfall: 1200,
    gradientFrom: "#d97706",
    gradientTo: "#92400e",
    verified: true,
    featured: true,
    slots: [
      { id: "s4", name: "Grand Lobby Video Wall", type: "video-wall", dimensions: "3840×2160", dailyImpressions: 900, audience: "Hotel guests and conference delegates", listingType: "auction", currentBid: 3100, minBid: 400, auctionEnds: "2026-03-22", priceUnit: "per week" },
      { id: "s5", name: "Conference Wing Corridor Screen", type: "digital-poster", dimensions: "1920×1080", dailyImpressions: 620, audience: "Business travelers, event attendees", listingType: "fixed", fixedPrice: 700, priceUnit: "per day" },
    ],
  },
  {
    id: "v3",
    name: "Lancaster University Ghana",
    shortName: "LUG",
    category: "university",
    location: "Adabraka, Accra",
    description: "Ghana campus of the UK's Lancaster University. Affluent student body with strong international links. High engagement in library, student union, and dining areas.",
    dailyFootfall: 3400,
    gradientFrom: "#dc2626",
    gradientTo: "#9f1239",
    verified: true,
    featured: true,
    slots: [
      { id: "s6", name: "Main Library Entrance Screen", type: "large-display", dimensions: "1920×1080", dailyImpressions: 2800, audience: "Students, lecturers, researchers", listingType: "fixed", fixedPrice: 320, priceUnit: "per day" },
      { id: "s7", name: "Student Union Digital Wall", type: "video-wall", dimensions: "2560×1440", dailyImpressions: 2100, audience: "Undergrad and postgrad students", listingType: "auction", currentBid: 1400, minBid: 200, auctionEnds: "2026-03-25", priceUnit: "per week" },
      { id: "s8", name: "Cafeteria Screens (×3)", type: "digital-poster", dimensions: "1920×1080", dailyImpressions: 1600, audience: "Students during meal periods", listingType: "fixed", fixedPrice: 280, priceUnit: "per day" },
    ],
  },
  {
    id: "v4",
    name: "Accra Mall",
    shortName: "Accra Mall",
    category: "mall",
    location: "Tetteh Quarshie Interchange, Accra",
    description: "Accra's flagship retail destination with 60+ stores anchored by ShopRite. Attracts middle to upper-income shoppers, families, and young professionals daily.",
    dailyFootfall: 14000,
    gradientFrom: "#7c3aed",
    gradientTo: "#4c1d95",
    verified: true,
    featured: false,
    slots: [
      { id: "s9",  name: "Main Atrium Video Wall",          type: "video-wall",     dimensions: "5760×1080", dailyImpressions: 11200, audience: "All shoppers at main entrance",        listingType: "auction", currentBid: 5800, minBid: 800, auctionEnds: "2026-03-23", priceUnit: "per week" },
      { id: "s10", name: "Food Court Central Display",      type: "large-display",  dimensions: "3840×2160", dailyImpressions: 6400,  audience: "Diners, families, young professionals", listingType: "fixed",   fixedPrice: 600, priceUnit: "per day" },
      { id: "s11", name: "ShopRite Checkout Kiosks (×6)",  type: "kiosk",          dimensions: "1080×1920", dailyImpressions: 4800,  audience: "Shoppers at checkout",                 listingType: "fixed",   fixedPrice: 380, priceUnit: "per day" },
    ],
  },
  {
    id: "v5",
    name: "University of Ghana, Legon",
    shortName: "UG Legon",
    category: "university",
    location: "Legon, Greater Accra",
    description: "Ghana's premier public university with over 40,000 students. The Balme Library and central student areas offer unmatched volume for brand awareness campaigns.",
    dailyFootfall: 28000,
    gradientFrom: "#16a34a",
    gradientTo: "#064e3b",
    verified: true,
    featured: false,
    slots: [
      { id: "s12", name: "Balme Library Digital Wall",     type: "video-wall",    dimensions: "3840×1080", dailyImpressions: 9200, audience: "Students, faculty, researchers", listingType: "fixed",   fixedPrice: 450, priceUnit: "per day"  },
      { id: "s13", name: "Commonwealth Hall Forecourt",    type: "large-display", dimensions: "1920×1080", dailyImpressions: 5100, audience: "Student residents, campus visitors", listingType: "auction", currentBid: 2100, minBid: 250, auctionEnds: "2026-03-26", priceUnit: "per week" },
    ],
  },
  {
    id: "v6",
    name: "Mövenpick Ambassador Hotel",
    shortName: "Mövenpick",
    category: "hotel",
    location: "Independence Avenue, Accra",
    description: "Iconic five-star property in Accra's diplomatic and business district, regularly hosting UN agencies, embassy events, and international summits.",
    dailyFootfall: 900,
    gradientFrom: "#0d9488",
    gradientTo: "#155e75",
    verified: true,
    featured: false,
    slots: [
      { id: "s14", name: "Lobby Entrance Display",  type: "large-display",  dimensions: "1920×1080", dailyImpressions: 700, audience: "Diplomats, executives, hotel guests", listingType: "auction", currentBid: 2600, minBid: 350, auctionEnds: "2026-03-21", priceUnit: "per week" },
      { id: "s15", name: "Pool Deck Screen",         type: "digital-poster", dimensions: "1920×1080", dailyImpressions: 320, audience: "Leisure guests, pool visitors",       listingType: "fixed",   fixedPrice: 480, priceUnit: "per day" },
    ],
  },
  {
    id: "v7",
    name: "Junction Mall",
    shortName: "Junction",
    category: "mall",
    location: "Nungua Barrier, East Legon, Accra",
    description: "East Legon's go-to retail and entertainment hub. Strong pull from Accra's younger, tech-savvy demographic with a popular cinema and dining level.",
    dailyFootfall: 8500,
    gradientFrom: "#ea580c",
    gradientTo: "#991b1b",
    verified: false,
    featured: false,
    slots: [
      { id: "s16", name: "Central Atrium Screen",   type: "large-display",  dimensions: "1920×1080", dailyImpressions: 6200, audience: "Shoppers, young professionals",  listingType: "fixed",   fixedPrice: 420, priceUnit: "per day"  },
      { id: "s17", name: "Cinema Foyer Display",    type: "digital-poster", dimensions: "1920×1080", dailyImpressions: 2400, audience: "Movie-goers, teens, young adults", listingType: "auction", currentBid: 1100, minBid: 150, auctionEnds: "2026-03-27", priceUnit: "per week" },
    ],
  },
  {
    id: "v8",
    name: "Korle-Bu Teaching Hospital",
    shortName: "Korle-Bu",
    category: "hospital",
    location: "Korle Bu, Accra",
    description: "West Africa's largest teaching hospital with over 2,000 beds. Extensive waiting areas provide sustained dwell-time exposure to patients, families, and healthcare professionals.",
    dailyFootfall: 7200,
    gradientFrom: "#3b82f6",
    gradientTo: "#3730a3",
    verified: true,
    featured: false,
    slots: [
      { id: "s18", name: "OPD Waiting Area Screens (×4)", type: "digital-poster", dimensions: "1920×1080", dailyImpressions: 5600, audience: "Patients, families, caregivers",  listingType: "fixed", fixedPrice: 280, priceUnit: "per day" },
      { id: "s19", name: "Main Entrance Kiosk",           type: "kiosk",          dimensions: "1080×1920", dailyImpressions: 3800, audience: "All visitors and hospital staff", listingType: "fixed", fixedPrice: 200, priceUnit: "per day" },
    ],
  },
  {
    id: "v9",
    name: "Silverbird Cinemas",
    shortName: "Silverbird",
    category: "cinema",
    location: "Accra Mall, Tetteh Quarshie, Accra",
    description: "Ghana's leading multiplex cinema chain. Captive pre-show audiences with high engagement and premium demographics across action, lifestyle, and family screenings.",
    dailyFootfall: 2800,
    gradientFrom: "#db2777",
    gradientTo: "#7e22ce",
    verified: true,
    featured: false,
    slots: [
      { id: "s20", name: "Pre-Show In-Screen Ads (×6 screens)", type: "video-wall",     dimensions: "4096×2160", dailyImpressions: 2400, audience: "Cinema audiences, captive pre-show",   listingType: "auction", currentBid: 3400, minBid: 450, auctionEnds: "2026-03-28", priceUnit: "per week" },
      { id: "s21", name: "Foyer Digital Billboards (×2)",       type: "large-display",  dimensions: "1920×1080", dailyImpressions: 2100, audience: "Cinema-goers in foyer and queue",    listingType: "fixed",   fixedPrice: 360, priceUnit: "per day"  },
    ],
  },
  {
    id: "v10",
    name: "Bank of Ghana HQ",
    shortName: "BoG",
    category: "corporate",
    location: "Thorpe Road, Accra CBD",
    description: "Ghana's central bank and financial regulatory authority. Hosts senior banking professionals, government officials, and international financial delegations daily.",
    dailyFootfall: 1600,
    gradientFrom: "#475569",
    gradientTo: "#1e293b",
    verified: true,
    featured: false,
    slots: [
      { id: "s22", name: "Main Reception Lobby Screen",  type: "large-display",  dimensions: "1920×1080", dailyImpressions: 1200, audience: "Banking executives, officials, visitors", listingType: "fixed",   fixedPrice: 550, priceUnit: "per day"  },
      { id: "s23", name: "Conference Lobby Display",     type: "digital-poster", dimensions: "1920×1080", dailyImpressions: 480,  audience: "Senior delegates, board members",       listingType: "auction", currentBid: 1800, minBid: 300, auctionEnds: "2026-03-29", priceUnit: "per week" },
    ],
  },
];

// ── Helpers ──

const CATEGORY_CONFIG: Record<Category, { label: string; icon: React.ElementType; color: string }> = {
  airport:    { label: "Airport",    icon: Plane,         color: "bg-sky-100 text-sky-700"       },
  hotel:      { label: "Hotel",      icon: Hotel,         color: "bg-amber-100 text-amber-700"   },
  university: { label: "University", icon: GraduationCap, color: "bg-red-100 text-red-700"       },
  mall:       { label: "Mall",       icon: ShoppingBag,   color: "bg-purple-100 text-purple-700" },
  hospital:   { label: "Hospital",   icon: HeartPulse,    color: "bg-blue-100 text-blue-700"     },
  cinema:     { label: "Cinema",     icon: Clapperboard,  color: "bg-pink-100 text-pink-700"     },
  corporate:  { label: "Corporate",  icon: Briefcase,     color: "bg-slate-100 text-slate-700"   },
};

const SCREEN_TYPE_CONFIG: Record<ScreenType, { label: string; icon: React.ElementType }> = {
  "video-wall":     { label: "Video Wall",    icon: Layers },
  "large-display":  { label: "Large Display", icon: Tv     },
  "kiosk":          { label: "Kiosk",         icon: Tablet },
  "digital-poster": { label: "Digital Poster",icon: Image  },
};

function formatGHS(n: number) {
  return `GH₵ ${n.toLocaleString()}`;
}

function formatNumber(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString();
}

function daysUntil(dateStr: string) {
  const end = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

function venueLowestPrice(venue: Venue): number {
  const fixedPrices = venue.slots
    .filter((s) => s.listingType === "fixed" && s.fixedPrice)
    .map((s) => s.fixedPrice!);
  return fixedPrices.length > 0 ? Math.min(...fixedPrices) : Infinity;
}

function venueTotalImpressions(venue: Venue): number {
  return venue.slots.reduce((s, sl) => s + sl.dailyImpressions, 0);
}

// ── Slot Card ──

function SlotCard({ slot }: { slot: AdSlot }) {
  const screenCfg = SCREEN_TYPE_CONFIG[slot.type];
  const ScreenIcon = screenCfg.icon;
  const isAuction = slot.listingType === "auction";

  return (
    <div className="rounded-xl border border-border bg-background p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <ScreenIcon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-snug">{slot.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
              {screenCfg.label}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">{slot.dimensions}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {formatNumber(slot.dailyImpressions)}/day
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span className="truncate max-w-[180px]">{slot.audience}</span>
        </span>
      </div>

      <div className="border-t border-border" />

      {isAuction ? (
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wide">
                Live Auction
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                {daysUntil(slot.auctionEnds!)}d left
              </span>
            </div>
            <p className="text-base font-bold">{formatGHS(slot.currentBid!)}</p>
            <p className="text-[10px] text-muted-foreground">Current bid · min {formatGHS(slot.minBid!)} {slot.priceUnit}</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors cursor-pointer shrink-0">
            <Gavel className="w-3.5 h-3.5" />
            Place Bid
          </button>
        </div>
      ) : (
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-base font-bold">{formatGHS(slot.fixedPrice!)}</p>
            <p className="text-[10px] text-muted-foreground">{slot.priceUnit}</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer shrink-0">
            <ShoppingCart className="w-3.5 h-3.5" />
            Book Now
          </button>
        </div>
      )}
    </div>
  );
}

// ── Venue Modal ──

function VenueModal({ venue, onClose }: { venue: Venue; onClose: () => void }) {
  const catCfg = CATEGORY_CONFIG[venue.category];
  const CatIcon = catCfg.icon;
  const totalImpressions = venueTotalImpressions(venue);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-28 relative flex items-end p-5"
          style={{ background: `linear-gradient(135deg, ${venue.gradientFrom}, ${venue.gradientTo})` }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>

          <div className="flex items-end gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <CatIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white leading-tight">{venue.name}</h2>
                {venue.verified && <BadgeCheck className="w-4 h-4 text-white/90 shrink-0" />}
              </div>
              <p className="text-xs text-white/75 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />{venue.location}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Daily Footfall",    value: formatNumber(venue.dailyFootfall) },
              { label: "Daily Impressions", value: formatNumber(totalImpressions)    },
              { label: "Ad Slots",          value: venue.slots.length               },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-muted/40 px-3 py-2.5 text-center">
                <p className="text-sm font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-5">{venue.description}</p>

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Available Ad Slots
          </p>
          <div className="flex flex-col gap-3">
            {venue.slots.map((slot) => (
              <SlotCard key={slot.id} slot={slot} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Featured Venue Card (horizontal layout) ──

function FeaturedVenueCard({ venue, onClick }: { venue: Venue; onClick: () => void }) {
  const catCfg = CATEGORY_CONFIG[venue.category];
  const CatIcon = catCfg.icon;
  const totalImpressions = venueTotalImpressions(venue);
  const auctionSlots = venue.slots.filter((s) => s.listingType === "auction");
  const fixedSlots = venue.slots.filter((s) => s.listingType === "fixed");
  const lowestFixed = fixedSlots
    .filter((s) => s.fixedPrice)
    .sort((a, b) => (a.fixedPrice ?? 0) - (b.fixedPrice ?? 0))[0];
  const earliestAuction = auctionSlots.length > 0
    ? auctionSlots.slice().sort((a, b) => new Date(a.auctionEnds!).getTime() - new Date(b.auctionEnds!).getTime())[0]
    : null;

  return (
    <div
      onClick={onClick}
      className="group rounded-2xl border border-border bg-card hover:shadow-lg hover:border-border/60 transition-all cursor-pointer overflow-hidden flex flex-row"
    >
      {/* Gradient left panel */}
      <div
        className="w-24 sm:w-28 shrink-0 flex flex-col items-center justify-center gap-2 p-4"
        style={{ background: `linear-gradient(160deg, ${venue.gradientFrom}, ${venue.gradientTo})` }}
      >
        <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <CatIcon className="w-5 h-5 text-white" />
        </div>
        {venue.verified && <BadgeCheck className="w-4 h-4 text-white/80" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors truncate">
                {venue.name}
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider shrink-0">
                Featured
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />{venue.location}
            </p>
          </div>
          <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0", catCfg.color)}>
            <CatIcon className="w-3 h-3" />
            {catCfg.label}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{venue.description}</p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {formatNumber(venue.dailyFootfall)}/day
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {formatNumber(totalImpressions)} impressions/day
          </span>
          <span className="flex items-center gap-1">
            <Monitor className="w-3 h-3" />
            {venue.slots.length} slot{venue.slots.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Badges + CTA */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {earliestAuction && (
              <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium">
                <Gavel className="w-2.5 h-2.5" />
                {auctionSlots.length} auction{auctionSlots.length !== 1 ? "s" : ""} · {daysUntil(earliestAuction.auctionEnds!)}d left
              </span>
            )}
            {lowestFixed && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                from {formatGHS(lowestFixed.fixedPrice!)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:text-primary/80 transition-colors shrink-0">
            View slots
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Venue Card ──

function VenueCard({ venue, onClick }: { venue: Venue; onClick: () => void }) {
  const catCfg = CATEGORY_CONFIG[venue.category];
  const CatIcon = catCfg.icon;
  const totalImpressions = venueTotalImpressions(venue);
  const auctionSlots = venue.slots.filter((s) => s.listingType === "auction");
  const fixedSlots = venue.slots.filter((s) => s.listingType === "fixed");
  const lowestFixed = fixedSlots
    .filter((s) => s.fixedPrice)
    .sort((a, b) => (a.fixedPrice ?? 0) - (b.fixedPrice ?? 0))[0];
  const earliestAuction = auctionSlots.length > 0
    ? auctionSlots.slice().sort((a, b) => new Date(a.auctionEnds!).getTime() - new Date(b.auctionEnds!).getTime())[0]
    : null;

  return (
    <div
      onClick={onClick}
      className="group rounded-2xl border border-border bg-card hover:shadow-lg hover:border-border/60 transition-all cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Gradient header */}
      <div
        className="h-24 relative flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${venue.gradientFrom}, ${venue.gradientTo})` }}
      >
        {venue.verified && (
          <span className="absolute top-2.5 right-2.5">
            <BadgeCheck className="w-4 h-4 text-white/90" />
          </span>
        )}
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <CatIcon className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">{venue.name}</h3>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" />{venue.location}
          </p>
        </div>

        <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded w-fit", catCfg.color)}>
          <CatIcon className="w-3 h-3" />
          {catCfg.label}
        </span>

        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{venue.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-auto pt-1">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {formatNumber(venue.dailyFootfall)}/day
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {formatNumber(totalImpressions)}/day
          </span>
          <span className="flex items-center gap-1">
            <Monitor className="w-3 h-3" />
            {venue.slots.length} slot{venue.slots.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {earliestAuction && (
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium">
              <Gavel className="w-2.5 h-2.5" />
              {auctionSlots.length} auction{auctionSlots.length !== 1 ? "s" : ""} · {daysUntil(earliestAuction.auctionEnds!)}d left
            </span>
          )}
          {lowestFixed && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              from {formatGHS(lowestFixed.fixedPrice!)}
            </span>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs font-medium text-primary group-hover:text-primary/80 transition-colors">
          View ad slots
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──

const CATEGORIES: { id: Category | "all"; label: string; icon: React.ElementType }[] = [
  { id: "all",        label: "All Venues",  icon: Building2     },
  { id: "airport",    label: "Airport",     icon: Plane         },
  { id: "hotel",      label: "Hotel",       icon: Hotel         },
  { id: "university", label: "University",  icon: GraduationCap },
  { id: "mall",       label: "Mall",        icon: ShoppingBag   },
  { id: "hospital",   label: "Hospital",    icon: HeartPulse    },
  { id: "cinema",     label: "Cinema",      icon: Clapperboard  },
  { id: "corporate",  label: "Corporate",   icon: Briefcase     },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recommended",  label: "Recommended"      },
  { value: "footfall",     label: "Highest Footfall"  },
  { value: "impressions",  label: "Most Impressions"  },
  { value: "price-asc",    label: "Lowest Price"      },
];

const LISTING_FILTERS: { value: ListingFilter; label: string }[] = [
  { value: "all",     label: "All"         },
  { value: "fixed",   label: "Fixed Price" },
  { value: "auction", label: "Live Auctions" },
];

export default function AdMarketplacePage() {
  const [category, setCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("recommended");
  const [listingFilter, setListingFilter] = useState<ListingFilter>("all");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const filtered = useMemo(() => {
    let result = VENUES.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!v.name.toLowerCase().includes(q) && !v.location.toLowerCase().includes(q)) return false;
      }
      if (listingFilter === "fixed" && !v.slots.some((s) => s.listingType === "fixed")) return false;
      if (listingFilter === "auction" && !v.slots.some((s) => s.listingType === "auction")) return false;
      return true;
    });

    if (sortBy === "footfall") {
      result = result.slice().sort((a, b) => b.dailyFootfall - a.dailyFootfall);
    } else if (sortBy === "impressions") {
      result = result.slice().sort((a, b) => venueTotalImpressions(b) - venueTotalImpressions(a));
    } else if (sortBy === "price-asc") {
      result = result.slice().sort((a, b) => venueLowestPrice(a) - venueLowestPrice(b));
    }

    return result;
  }, [category, search, sortBy, listingFilter]);

  const featured = VENUES.filter((v) => v.featured);
  const showFeatured = category === "all" && !search && listingFilter === "all";

  const clearFilters = () => {
    setCategory("all");
    setSearch("");
    setSortBy("recommended");
    setListingFilter("all");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* Hero */}
        <div className="py-6 sm:py-8 pb-5 sm:pb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Ad Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover and book premium digital ad screens across Accra
          </p>
          <div className="relative mt-4 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search venues or locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full pl-10 pr-9 rounded-xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Sticky filter bar */}
        <div className="sticky top-14 z-20 bg-background/95 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-3 border-b border-border mb-8">
          {/* Category pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-2">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border shrink-0",
                  category === id
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/50"
                )}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Listing type + sort + result count */}
          <div className="flex items-center justify-between gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-1">
              {LISTING_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setListingFilter(value)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border",
                    listingFilter === value
                      ? value === "auction"
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {value === "auction" && <Gavel className="w-3 h-3 inline mr-1" />}
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">
                {filtered.length} venue{filtered.length !== 1 ? "s" : ""}
              </span>
              <div className="relative">
                <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="h-8 pl-7 pr-3 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer appearance-none"
                >
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Featured section */}
        {showFeatured && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Featured Venues</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">High demand</span>
            </div>
            <div className="flex flex-col gap-3">
              {featured.map((venue) => (
                <FeaturedVenueCard key={venue.id} venue={venue} onClick={() => setSelectedVenue(venue)} />
              ))}
            </div>
          </div>
        )}

        {/* All / Filtered venues */}
        <div className="pb-8">
          {showFeatured && (
            <h2 className="text-sm font-semibold mb-4">All Venues</h2>
          )}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">No venues found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Try adjusting your filters or search term to see more results.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted/50 transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((venue) => (
                <VenueCard key={venue.id} venue={venue} onClick={() => setSelectedVenue(venue)} />
              ))}
            </div>
          )}
        </div>

        {/* Venue owner CTA */}
        <div className="mb-14 rounded-2xl border border-dashed border-border bg-muted/30 px-4 sm:px-8 py-8 sm:py-10 text-center">
          <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold">Own a venue or screen network?</h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto">
            List your digital ad space on the TripAdverts Marketplace and reach thousands of advertisers looking for premium out-of-home exposure.
          </p>
          <button className="mt-4 px-5 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:bg-foreground/80 transition-colors cursor-pointer">
            Apply to List Your Space
          </button>
        </div>

      </div>

      {/* Modal */}
      {selectedVenue && (
        <VenueModal venue={selectedVenue} onClose={() => setSelectedVenue(null)} />
      )}
    </div>
  );
}
