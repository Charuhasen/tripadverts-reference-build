"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Car,
  Hash,
  MapPin,
  CalendarDays,
  BadgeCheck,
  MonitorSmartphone,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { INDIVIDUAL_DRIVERS, FLEET_DRIVERS, DEMO_FLEETS } from "@/lib/admin-data";

const DRIVER = INDIVIDUAL_DRIVERS.find((d) => d.id === "id1")!;
const TODAY  = "2026-03-19";

function memberSince(joinedAt: string) {
  return new Date(joinedAt + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function monthsActive(joinedAt: string) {
  const joined = new Date(joinedAt + "T00:00:00");
  const today  = new Date(TODAY + "T00:00:00");
  return (today.getFullYear() - joined.getFullYear()) * 12 + today.getMonth() - joined.getMonth();
}


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-2">{title}</p>
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value, valueClass }: { icon: React.ElementType; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium mt-0.5 truncate", valueClass)}>{value}</p>
      </div>
    </div>
  );
}

export default function DriverProfilePage() {
  const fleetDriver = FLEET_DRIVERS.find((d) => d.id === DRIVER.id);
  const fleet       = fleetDriver ? DEMO_FLEETS.find((f) => f.id === fleetDriver.fleetId) : null;
  const months      = monthsActive(DRIVER.joinedAt);

  return (
    <div className="px-4 pt-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/driver/home" className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center active:bg-zinc-200">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Profile</h1>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
          {DRIVER.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div className="text-center">
          <div className="flex items-center gap-1.5 justify-center">
            <p className="text-lg font-bold">{DRIVER.name}</p>
            <BadgeCheck className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{months} months active</p>
        </div>
      </div>


      {/* Personal */}
      <Section title="Personal">
        <Row icon={Hash}        label="Driver ID"    value={DRIVER.id.toUpperCase()} />
        <Row icon={Phone}       label="Phone"        value={DRIVER.phone} />
        <Row icon={CalendarDays}label="Member since" value={memberSince(DRIVER.joinedAt)} />
      </Section>

      {/* Vehicle */}
      <Section title="Vehicle">
        <Row icon={Car}    label="Make & model"   value={DRIVER.vehicle} />
        <Row icon={Hash}   label="Plate number"   value={DRIVER.plate} />
        <Row icon={MapPin} label="Current zone"  value={DRIVER.zone} />
      </Section>

      {/* Fleet */}
      <Section title="Fleet">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Users className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground">Fleet assignment</p>
            {fleet ? (
              <>
                <p className="text-sm font-medium mt-0.5">{fleet.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Owner: {fleet.owner}</p>
              </>
            ) : (
              <p className="text-sm font-medium mt-0.5 text-muted-foreground">Independent — not assigned to a fleet</p>
            )}
          </div>
          <span className={cn(
            "text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0",
            fleet ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-500"
          )}>
            {fleet ? "Fleet" : "Independent"}
          </span>
        </div>
      </Section>

      {/* Tablet */}
      <Section title="Tablet">
        <Row icon={MonitorSmartphone} label="Tablet ID" value={DRIVER.tabletId} />
      </Section>

      {/* Support */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 active:bg-muted/40">
          <p className="text-sm font-medium">Help &amp; Support</p>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

    </div>
  );
}
