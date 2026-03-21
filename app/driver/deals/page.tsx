"use client";

import { useState } from "react";
import { Tag, CheckCircle, Clock, Fuel, Utensils, Smartphone, Wrench, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type DealCategory = "fuel" | "food" | "mobile" | "auto" | "insurance";

interface Deal {
  id: string;
  brand: string;
  initials: string;
  brandColor: string;
  category: DealCategory;
  title: string;
  description: string;
  discount: string;
  code?: string;
  expiresAt: string;
  claimsLeft: number;
}

const CATEGORY_CONFIG: Record<DealCategory, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  fuel:      { label: "Fuel",      icon: Fuel,        bg: "bg-orange-100", text: "text-orange-700" },
  food:      { label: "Food",      icon: Utensils,    bg: "bg-green-100",  text: "text-green-700"  },
  mobile:    { label: "Mobile",    icon: Smartphone,  bg: "bg-blue-100",   text: "text-blue-700"   },
  auto:      { label: "Auto",      icon: Wrench,      bg: "bg-zinc-100",   text: "text-zinc-700"   },
  insurance: { label: "Insurance", icon: ShieldCheck, bg: "bg-purple-100", text: "text-purple-700" },
};

const DEALS: Deal[] = [
  {
    id: "d1",
    brand: "Shell Ghana",
    initials: "SH",
    brandColor: "bg-yellow-400 text-yellow-900",
    category: "fuel",
    title: "10% off every fill-up",
    description: "Exclusive fuel discount at all Shell stations across Accra for registered TripAdverts drivers.",
    discount: "10% OFF",
    code: "TRIP10",
    expiresAt: "2026-04-30",
    claimsLeft: 80,
  },
  {
    id: "d2",
    brand: "MTN Ghana",
    initials: "MT",
    brandColor: "bg-yellow-300 text-yellow-900",
    category: "mobile",
    title: "Free 5GB data monthly",
    description: "Get 5GB of free data every month while your tablet is active and connected.",
    discount: "5GB FREE",
    expiresAt: "2026-06-30",
    claimsLeft: 200,
  },
  {
    id: "d3",
    brand: "KFC Ghana",
    initials: "KF",
    brandColor: "bg-red-500 text-white",
    category: "food",
    title: "Buy 1 Get 1 on meals",
    description: "Show your TripAdverts driver badge at any KFC outlet and get a free meal with every purchase.",
    discount: "B1G1",
    code: "TADRIVER",
    expiresAt: "2026-03-31",
    claimsLeft: 15,
  },
  {
    id: "d4",
    brand: "AutoCare GH",
    initials: "AC",
    brandColor: "bg-zinc-700 text-white",
    category: "auto",
    title: "Free oil change service",
    description: "One complimentary oil change per quarter at AutoCare service centres in Accra and Tema.",
    discount: "FREE",
    expiresAt: "2026-06-30",
    claimsLeft: 40,
  },
  {
    id: "d5",
    brand: "Enterprise Insurance",
    initials: "EI",
    brandColor: "bg-purple-600 text-white",
    category: "insurance",
    title: "25% off comprehensive cover",
    description: "Discounted comprehensive vehicle insurance for all active TripAdverts drivers.",
    discount: "25% OFF",
    code: "TAFLEET25",
    expiresAt: "2026-05-31",
    claimsLeft: 60,
  },
  {
    id: "d6",
    brand: "Shoprite Ghana",
    initials: "SR",
    brandColor: "bg-red-600 text-white",
    category: "food",
    title: "GH₵ 20 voucher on groceries",
    description: "Receive a GH₵ 20 grocery voucher each month. Redeemable at all Shoprite branches.",
    discount: "GH₵ 20",
    expiresAt: "2026-04-30",
    claimsLeft: 120,
  },
  {
    id: "d7",
    brand: "TotalEnergies",
    initials: "TE",
    brandColor: "bg-red-500 text-white",
    category: "fuel",
    title: "GH₵ 0.50 off per litre",
    description: "Discounted fuel rate at TotalEnergies stations. Present your driver QR code at the pump.",
    discount: "GH₵ 0.50/L",
    expiresAt: "2026-04-30",
    claimsLeft: 95,
  },
  {
    id: "d8",
    brand: "Vodafone Ghana",
    initials: "VF",
    brandColor: "bg-red-600 text-white",
    category: "mobile",
    title: "Unlimited calls for GH₵ 15",
    description: "Unlimited on-net calls for a month at GH₵ 15 — exclusively for TripAdverts drivers.",
    discount: "GH₵ 15",
    code: "TAVODADRV",
    expiresAt: "2026-05-31",
    claimsLeft: 150,
  },
];

const ALL_CATEGORIES = ["all", ...Object.keys(CATEGORY_CONFIG)] as const;
type FilterType = typeof ALL_CATEGORIES[number];

export default function DriverDealsPage() {
  const [filter, setFilter]       = useState<FilterType>("all");
  const [claimed, setClaimed]     = useState<Set<string>>(new Set());
  const [revealed, setRevealed]   = useState<Set<string>>(new Set());

  const visible = filter === "all" ? DEALS : DEALS.filter((d) => d.category === filter);

  function daysLeft(expiresAt: string) {
    const diff = Math.round((new Date(expiresAt + "T00:00:00").getTime() - new Date("2026-03-19T00:00:00").getTime()) / 86400000);
    if (diff <= 0) return "Expired";
    if (diff === 1) return "Last day";
    if (diff <= 7) return `${diff}d left`;
    return `Expires ${new Date(expiresAt + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
  }

  function urgency(expiresAt: string, claimsLeft: number) {
    const diff = Math.round((new Date(expiresAt + "T00:00:00").getTime() - new Date("2026-03-19T00:00:00").getTime()) / 86400000);
    return diff <= 7 || claimsLeft <= 20;
  }

  return (
    <div className="px-4 pt-8 space-y-5 pb-4">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Driver Deals</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Exclusive offers from our brand partners</p>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {ALL_CATEGORIES.map((cat) => {
          const isAll    = cat === "all";
          const cfg      = isAll ? null : CATEGORY_CONFIG[cat as DealCategory];
          const Icon     = cfg?.icon;
          const active   = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors shrink-0",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground"
              )}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {isAll ? "All deals" : cfg!.label}
            </button>
          );
        })}
      </div>

      {/* Deal cards */}
      <div className="space-y-3">
        {visible.map((deal) => {
          const cfg         = CATEGORY_CONFIG[deal.category];
          const CatIcon     = cfg.icon;
          const isClaimed   = claimed.has(deal.id);
          const isRevealed  = revealed.has(deal.id);
          const hot         = urgency(deal.expiresAt, deal.claimsLeft);

          return (
            <div
              key={deal.id}
              className={cn(
                "rounded-2xl border bg-card overflow-hidden",
                isClaimed ? "border-green-200" : "border-border"
              )}
            >
              {/* Top strip */}
              <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                {/* Brand avatar */}
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0", deal.brandColor)}>
                  {deal.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[11px] font-medium text-muted-foreground">{deal.brand}</p>
                    <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full", cfg.bg, cfg.text)}>
                      <CatIcon className="w-2.5 h-2.5" />
                      {cfg.label}
                    </span>
                    {hot && !isClaimed && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                        🔥 Hot
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold mt-0.5 leading-snug">{deal.title}</p>
                </div>

                {/* Discount badge */}
                <div className={cn(
                  "shrink-0 rounded-xl px-2.5 py-1.5 text-center min-w-[52px]",
                  isClaimed ? "bg-green-50 border border-green-200" : "bg-primary/10"
                )}>
                  <p className={cn("text-xs font-bold leading-tight", isClaimed ? "text-green-700" : "text-primary")}>
                    {deal.discount}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-[12px] text-muted-foreground px-4 pb-3 leading-relaxed">
                {deal.description}
              </p>

              {/* Footer */}
              <div className={cn(
                "px-4 py-3 border-t flex items-center justify-between gap-3",
                isClaimed ? "border-green-100 bg-green-50/50" : "border-border bg-muted/20"
              )}>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className={hot && !isClaimed ? "text-red-500 font-medium" : ""}>{daysLeft(deal.expiresAt)}</span>
                  </span>
                  <span>{deal.claimsLeft} remaining</span>
                </div>

                {isClaimed ? (
                  <div className="flex items-center gap-1.5">
                    {deal.code && isRevealed && (
                      <span className="text-xs font-mono font-bold bg-green-100 text-green-800 px-2 py-1 rounded-lg">
                        {deal.code}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-semibold">Claimed</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setClaimed((s) => new Set(s).add(deal.id));
                      if (deal.code) setRevealed((s) => new Set(s).add(deal.id));
                    }}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-transform"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    Claim deal
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
