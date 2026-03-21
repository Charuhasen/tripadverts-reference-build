"use client";

import Link from "next/link";
import { ChevronLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { INDIVIDUAL_DRIVERS, PAYOUT_RECORDS } from "@/lib/admin-data";

const DRIVER = INDIVIDUAL_DRIVERS.find((d) => d.id === "id1")!;

const STATUS_CONFIG = {
  pending: { label: "Processing",  icon: Clock,         bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-700",  iconColor: "text-amber-500"  },
  paid:    { label: "Paid",        icon: CheckCircle,   bg: "bg-green-50",  border: "border-green-200", text: "text-green-700",  iconColor: "text-green-500"  },
  failed:  { label: "Failed",      icon: XCircle,       bg: "bg-red-50",    border: "border-red-200",   text: "text-red-700",    iconColor: "text-red-500"    },
};

export default function DriverEarningsPage() {
  const myPayouts = PAYOUT_RECORDS
    .filter((p) => p.recipientId === DRIVER.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalEarned = myPayouts
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);

  const pending = myPayouts.find((p) => p.status === "pending");

  return (
    <div className="px-4 pt-8 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/driver/home" className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center active:bg-zinc-200">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Earnings</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card px-4 py-3.5">
          <p className="text-[11px] text-muted-foreground mb-1">Total Earned</p>
          <p className="text-xl font-bold">GH₵ {totalEarned.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">All time (paid)</p>
        </div>
        <div className={cn(
          "rounded-xl border px-4 py-3.5",
          pending ? "border-amber-200 bg-amber-50" : "border-border bg-card"
        )}>
          <p className="text-[11px] text-muted-foreground mb-1">Pending</p>
          <p className={cn("text-xl font-bold", pending ? "text-amber-900" : "text-foreground")}>
            GH₵ {(pending?.amount ?? 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {pending ? pending.period : "Nothing pending"}
          </p>
        </div>
      </div>

      {/* Pending detail card */}
      {pending && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Current period</p>
            <span className="text-[11px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Processing
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-amber-900">Period</p>
              <p className="text-sm font-medium text-amber-900">{pending.period}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-amber-900">Amount</p>
              <p className="text-lg font-bold text-amber-900">GH₵ {pending.amount.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-amber-900">Expected by</p>
              <p className="text-sm font-medium text-amber-900">Mar 20, 2026</p>
            </div>
          </div>
          <p className="text-[11px] text-amber-700 border-t border-amber-200 pt-2">
            Payouts are processed every 2 weeks. Funds arrive via Mobile Money.
          </p>
        </div>
      )}

      {/* History */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Payout history
        </p>
        <div className="space-y-2.5">
          {myPayouts.map((p) => {
            const cfg = STATUS_CONFIG[p.status];
            const Icon = cfg.icon;
            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-xl border px-4 py-3.5 flex items-center justify-between",
                  cfg.bg, cfg.border
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4 h-4 shrink-0", cfg.iconColor)} />
                  <div>
                    <p className={cn("text-sm font-semibold", cfg.text)}>{p.period}</p>
                    <p className={cn("text-[11px] mt-0.5", cfg.text, "opacity-75")}>
                      {cfg.label}
                      {p.status === "paid" && ` · ${new Date(p.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                  </div>
                </div>
                <p className={cn("text-base font-bold tabular-nums", cfg.text)}>
                  GH₵ {p.amount.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info note */}
      <div className="rounded-xl bg-zinc-50 border border-border px-4 py-3.5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Earnings are calculated based on active hours in campaign zones. Contact support if you spot a discrepancy.
        </p>
      </div>

    </div>
  );
}
