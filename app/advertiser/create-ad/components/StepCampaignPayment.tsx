"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CampaignDraft,
  CampaignPayment,
  PaymentMethod,
  getZonesForCity,
} from "@/lib/schemas/campaignData";
import {
  Check,
  CreditCard,
  Smartphone,
  MapPin,
  Car,
  Eye,
  Clock,
  CalendarDays,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepNavState } from "../page";

interface Props {
  draft: CampaignDraft;
  payment: CampaignPayment;
  onBack: () => void;
  onSubmit: (payment: CampaignPayment) => void;
  onNavChange?: (state: StepNavState) => void;
  submitRef?: React.MutableRefObject<(() => void) | null>;
}

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

export function StepCampaignPayment({ draft, payment, onBack, onSubmit, onNavChange, submitRef }: Props) {
  const router = useRouter();
  const [pay, setPay] = useState<CampaignPayment>(payment);
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const { campaignInfo, campaignTarget } = draft;
  const selectedZones = getZonesForCity(campaignTarget.city).filter((z) =>
    campaignTarget.selectedZoneIds.includes(z.id)
  );
  const maxTaxis = selectedZones.reduce((sum, z) => sum + z.availableTaxis, 0);

  const campaignDays =
    campaignTarget.startDate && campaignTarget.endDate
      ? Math.ceil(
          (new Date(campaignTarget.endDate).getTime() -
            new Date(campaignTarget.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
  const totalDailyImpressions = selectedZones.reduce(
    (sum, z) => sum + z.estimatedDailyImpressions,
    0
  );
  // Calculate average hours per day accounting for overrides
  const getDaysBetween = (start: string, end: string): string[] => {
    const days: string[] = [];
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };
  const campaignDaysList = campaignDays > 0
    ? getDaysBetween(campaignTarget.startDate, campaignTarget.endDate)
    : [];
  const avgHoursPerDay = campaignDays > 0
    ? campaignDaysList.reduce((sum, day) => {
        const [s, e] = campaignTarget.dayTimeOverrides[day] ?? campaignTarget.defaultTimeRange;
        return sum + (e - s);
      }, 0) / campaignDays
    : campaignTarget.defaultTimeRange[1] - campaignTarget.defaultTimeRange[0];

  const slotFraction = avgHoursPerDay / 16;
  const taxiFraction = maxTaxis > 0 ? campaignTarget.taxiCount / maxTaxis : 0;
  const estimatedImpressions = Math.round(
    totalDailyImpressions * campaignDays * slotFraction * taxiFraction
  );
  const estimatedCost = Math.round(
    campaignTarget.taxiCount * campaignDays * avgHoursPerDay * 0.75
  );

  const handlePay = () => {
    setProcessing(true);
    onNavChange?.({ canProceed: false, nextLabel: `Pay $${estimatedCost.toLocaleString()}`, processing: true });
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setConfirmed(true);
    }, 2500);
  };

  useEffect(() => {
    onNavChange?.({
      canProceed: !processing,
      nextLabel: `Pay $${estimatedCost.toLocaleString()}`,
      processing,
    });
  }, [processing, estimatedCost, onNavChange]);

  useEffect(() => {
    if (submitRef) {
      submitRef.current = handlePay;
    }
  });

  // Fire confetti when payment is confirmed
  useEffect(() => {
    if (!confirmed) return;
    const fire = (opts: confetti.Options) => confetti({ startVelocity: 30, spread: 60, ticks: 80, zIndex: 9999, ...opts });
    fire({ particleCount: 60, angle: 60, origin: { x: 0, y: 0.65 } });
    fire({ particleCount: 60, angle: 120, origin: { x: 1, y: 0.65 } });
    const t = setTimeout(() => {
      fire({ particleCount: 30, angle: 90, origin: { x: 0.5, y: 0.5 }, startVelocity: 20 });
    }, 300);
    return () => clearTimeout(t);
  }, [confirmed]);

  // Confirmation screen
  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="size-7 text-green-500" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">Campaign Created!</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Your campaign <strong>"{campaignInfo.name}"</strong> has been successfully created
          and payment has been confirmed.
        </p>

        <div className="bg-card border border-border rounded-xl p-5 w-full max-w-md text-left space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Campaign ID</span>
            <span className="font-mono font-semibold">CMP-{Date.now().toString(36).toUpperCase()}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
              Confirmed
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Start Date</span>
            <span className="font-semibold">{campaignTarget.startDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Est. Delivery</span>
            <span className="font-semibold">
              {estimatedImpressions.toLocaleString()} impressions
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Paid</span>
            <span className="font-bold text-lg">${estimatedCost.toLocaleString()}</span>
          </div>
        </div>

        <Button size="sm" className="mt-5 px-6" onClick={() => router.push("/advertiser/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-3">
        <h2 className="text-lg font-bold tracking-tight">Campaign Payment</h2>
        <p className="text-sm text-muted-foreground">
          Review your campaign details and complete payment.
        </p>
      </div>

      <div>
        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl">
          {/* Campaign Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Campaign Summary
            </h3>

            <div className="bg-muted/30 rounded-xl border border-border p-4 space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Campaign Name</span>
                <p className="font-semibold">{campaignInfo.name}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <MapPin className="size-3" />
                  <span>Selected Zones ({selectedZones.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedZones.map((z) => (
                    <Badge key={z.id} variant="secondary" className="text-xs">
                      {z.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Car className="size-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Taxis</span>
                    <p className="font-semibold">{campaignTarget.taxiCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Duration</span>
                    <p className="font-semibold">{campaignDays} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Avg. Hours</span>
                    <p className="font-semibold">
                      {avgHoursPerDay.toFixed(avgHoursPerDay % 1 === 0 ? 0 : 1)} hrs/day
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="size-4 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Impressions</span>
                    <p className="font-semibold">{estimatedImpressions.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <span className="text-xs text-muted-foreground">Schedule</span>
                <p className="text-sm font-medium">
                  {campaignTarget.startDate} to {campaignTarget.endDate}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Default: {formatHour(campaignTarget.defaultTimeRange[0])} – {formatHour(campaignTarget.defaultTimeRange[1])} (GMT)
                  {Object.keys(campaignTarget.dayTimeOverrides).length > 0 && (
                    <span> · {Object.keys(campaignTarget.dayTimeOverrides).length} day{Object.keys(campaignTarget.dayTimeOverrides).length !== 1 ? "s" : ""} customized</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Payment Method
            </h3>

            {/* MoMo Option */}
            <button
              onClick={() => setPay((prev) => ({ ...prev, method: "momo" }))}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all",
                pay.method === "momo"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/40"
              )}
              aria-pressed={pay.method === "momo"}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Smartphone className="size-5 text-yellow-500" />
                </div>
                <div>
                  <p className="font-semibold">MTN Mobile Money</p>
                  <p className="text-xs text-muted-foreground">Pay via MoMo prompt</p>
                </div>
                {pay.method === "momo" && (
                  <Check className="size-5 text-primary ml-auto" />
                )}
              </div>
            </button>

            {/* MoMo Phone Input */}
            {pay.method === "momo" && (
              <div className="space-y-2 pl-4 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="momo-phone">Phone Number</Label>
                <Input
                  id="momo-phone"
                  type="tel"
                  placeholder="e.g. 024 XXX XXXX"
                  value={pay.momoPhone}
                  onChange={(e) =>
                    setPay((prev) => ({ ...prev, momoPhone: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  A payment prompt will be sent to your phone for approval.
                </p>
              </div>
            )}

            {/* Stripe Option */}
            <button
              onClick={() => setPay((prev) => ({ ...prev, method: "stripe" }))}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all",
                pay.method === "stripe"
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/40"
              )}
              aria-pressed={pay.method === "stripe"}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="size-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">Credit / Debit Card</p>
                  <p className="text-xs text-muted-foreground">
                    Visa, Mastercard, and international cards
                  </p>
                </div>
                {pay.method === "stripe" && (
                  <Check className="size-5 text-primary ml-auto" />
                )}
              </div>
            </button>

            {pay.method === "stripe" && (
              <div className="space-y-4 pl-4 animate-in fade-in slide-in-from-top-2">
                <p className="text-xs text-muted-foreground">
                  You will be redirected to Stripe's secure checkout to complete payment.
                </p>
              </div>
            )}

            {/* Total */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount</span>
                <span className="text-2xl font-bold">${estimatedCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
