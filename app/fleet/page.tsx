"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Car,
  Users,
  MapPin,
  Plus,
  Trash2,
  Search,
  X,
  Loader2,
  WalletCards,
  Phone,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { DriverStatus, DriverLocation } from "./components/FleetMap";

const FleetMap = dynamic(() => import("./components/FleetMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/20">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">Loading map…</span>
    </div>
  ),
});

// ── Types ──

interface Driver {
  id: string;
  name: string;
  phone: string;
  plate: string;
  vehicle: string;
  status: DriverStatus;
  zone: string;
  joinedAt: string;
  lastSeenAt: string;
  lat: number;
  lng: number;
}

// ── Dummy Data ──

const INITIAL_DRIVERS: Driver[] = [
  { id: "d1",  name: "Kwame Asante",    phone: "024 511 2233", plate: "GT 1234-24", vehicle: "Toyota Corolla",  status: "active",  zone: "East Legon",  joinedAt: "2024-01-15", lastSeenAt: "2026-03-16T08:42:00", lat: 5.636, lng: -0.157 },
  { id: "d2",  name: "Abena Mensah",    phone: "055 876 4421", plate: "GT 5567-23", vehicle: "Hyundai Elantra", status: "active",  zone: "Osu",         joinedAt: "2023-11-02", lastSeenAt: "2026-03-16T09:05:00", lat: 5.555, lng: -0.178 },
  { id: "d3",  name: "Yaw Boateng",     phone: "020 334 9900", plate: "GR 8821-22", vehicle: "Kia Cerato",      status: "active",  zone: "Airport City",joinedAt: "2022-07-20", lastSeenAt: "2026-03-16T09:11:00", lat: 5.607, lng: -0.167 },
  { id: "d4",  name: "Ama Owusu",       phone: "054 220 7788", plate: "GT 2290-24", vehicle: "Toyota Vitz",     status: "active",  zone: "Spintex",     joinedAt: "2024-03-10", lastSeenAt: "2026-03-16T08:58:00", lat: 5.623, lng: -0.095 },
  { id: "d5",  name: "Kofi Darko",      phone: "027 441 3366", plate: "GW 4451-23", vehicle: "Nissan Almera",   status: "offline", zone: "Madina",      joinedAt: "2023-06-01", lastSeenAt: "2026-03-13T14:22:00", lat: 5.680, lng: -0.215 },
  { id: "d6",  name: "Efua Boahemaa",   phone: "050 993 1120", plate: "GT 9934-24", vehicle: "Honda Fit",       status: "active",  zone: "Cantonments", joinedAt: "2024-02-28", lastSeenAt: "2026-03-16T09:03:00", lat: 5.567, lng: -0.184 },
  { id: "d7",  name: "Nana Osei",       phone: "024 667 8833", plate: "GN 1122-22", vehicle: "Kia Rio",         status: "active",  zone: "Achimota",    joinedAt: "2022-09-14", lastSeenAt: "2026-03-16T08:50:00", lat: 5.652, lng: -0.237 },
  { id: "d8",  name: "Adwoa Sarpong",   phone: "055 234 6677", plate: "GT 7743-23", vehicle: "Toyota Corolla",  status: "offline", zone: "Legon",       joinedAt: "2023-04-22", lastSeenAt: "2026-03-15T19:47:00", lat: 5.650, lng: -0.186 },
  { id: "d9",  name: "Kweku Appiah",    phone: "020 112 5599", plate: "GE 3345-24", vehicle: "Hyundai Accent",  status: "active",  zone: "East Legon",  joinedAt: "2024-05-05", lastSeenAt: "2026-03-16T09:08:00", lat: 5.640, lng: -0.150 },
  { id: "d10", name: "Akosua Frimpong", phone: "027 885 2211", plate: "GT 6680-22", vehicle: "Suzuki Swift",    status: "active",  zone: "Osu",         joinedAt: "2022-12-08", lastSeenAt: "2026-03-16T08:55:00", lat: 5.551, lng: -0.193 },
  { id: "d11", name: "Fiifi Quaye",     phone: "054 770 4400", plate: "GS 5512-23", vehicle: "Nissan Tiida",    status: "active",  zone: "Circle",      joinedAt: "2023-08-17", lastSeenAt: "2026-03-16T09:00:00", lat: 5.571, lng: -0.213 },
  { id: "d12", name: "Maame Agyei",     phone: "050 330 9988", plate: "GT 4421-24", vehicle: "Toyota Yaris",    status: "offline", zone: "Dansoman",    joinedAt: "2024-01-30", lastSeenAt: "2026-03-16T06:15:00", lat: 5.546, lng: -0.249 },
];

// ── Helpers ──

const STATUS_DOT: Record<DriverStatus, string> = {
  active: "bg-green-500",
  offline: "bg-zinc-400",
};

const STATUS_LABEL: Record<DriverStatus, string> = {
  active: "Active",
  offline: "Offline",
};

const STATUS_TEXT: Record<DriverStatus, string> = {
  active: "text-green-600",
  offline: "text-zinc-500",
};

function formatGHS(n: number) { return `GH₵${n.toLocaleString()}`; }

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatOfflineDuration(lastSeenAt: string): string {
  const diffMs = new Date("2026-03-16T09:15:00").getTime() - new Date(lastSeenAt).getTime();
  const totalMins = Math.floor(diffMs / 60_000);
  if (totalMins < 60) return `${totalMins}m`;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
}

// ── Simulation routes (active drivers only, roughly following Accra roads) ──
// Each route is a loop of [lat, lng] waypoints

type LatLng = [number, number];

const DRIVER_ROUTES: Record<string, LatLng[]> = {
  // d1 – East Legon: loops around Boundary Rd / Ambassadorial Enclave
  d1:  [[5.6360,-0.1570],[5.6420,-0.1490],[5.6460,-0.1400],[5.6400,-0.1330],[5.6310,-0.1370],[5.6280,-0.1480],[5.6320,-0.1560]],
  // d2 – Osu: Cantonments Rd loop
  d2:  [[5.5550,-0.1780],[5.5500,-0.1710],[5.5480,-0.1630],[5.5550,-0.1590],[5.5630,-0.1640],[5.5630,-0.1740]],
  // d3 – Airport City: Liberation Rd / Airport Rd loop
  d3:  [[5.6070,-0.1670],[5.6000,-0.1600],[5.5960,-0.1690],[5.6010,-0.1790],[5.6070,-0.1760]],
  // d4 – Spintex: Spintex Rd east loop
  d4:  [[5.6230,-0.0950],[5.6170,-0.0880],[5.6090,-0.0940],[5.6110,-0.1040],[5.6190,-0.1030]],
  // d6 – Cantonments: Ring Rd East loop
  d6:  [[5.5670,-0.1840],[5.5600,-0.1760],[5.5560,-0.1850],[5.5620,-0.1950],[5.5700,-0.1920]],
  // d7 – Achimota: Achimota Rd / Ring Rd North
  d7:  [[5.6520,-0.2370],[5.6600,-0.2290],[5.6580,-0.2190],[5.6480,-0.2210],[5.6430,-0.2310],[5.6470,-0.2400]],
  // d9 – East Legon: different inner loop
  d9:  [[5.6400,-0.1500],[5.6460,-0.1430],[5.6450,-0.1350],[5.6370,-0.1360],[5.6320,-0.1440],[5.6350,-0.1520]],
  // d10 – Osu: Airport Rd / Labadi Rd loop
  d10: [[5.5510,-0.1930],[5.5460,-0.1860],[5.5480,-0.1770],[5.5570,-0.1800],[5.5590,-0.1890]],
  // d11 – Circle: Ring Rd West / Kwame Nkrumah loop
  d11: [[5.5710,-0.2130],[5.5660,-0.2060],[5.5630,-0.2160],[5.5690,-0.2250],[5.5760,-0.2210]],
};

// How far each driver advances per tick (higher = faster)
const DRIVER_SPEEDS: Record<string, number> = {
  d1: 0.0028, d2: 0.0032, d3: 0.0025, d4: 0.0030,
  d6: 0.0027, d7: 0.0022, d9: 0.0035, d10: 0.0029, d11: 0.0031,
};

const ZONES = [
  "East Legon", "Osu", "Airport City", "Spintex", "Madina",
  "Cantonments", "Achimota", "Legon", "Circle", "Dansoman",
];

// ── Add Driver Modal (multi-step) ──

interface AddDriverModalProps {
  onClose: () => void;
  onAdd: (driver: Driver) => void;
}

const WIZARD_STEPS = ["Personal", "Vehicle", "Ghana Card", "Biometrics", "Face Photo"] as const;

const FINGERPRINT_SLOTS = [
  { id: "left_thumb",  label: "Left Thumb" },
  { id: "left_index",  label: "Left Index" },
  { id: "right_thumb", label: "Right Thumb" },
  { id: "right_index", label: "Right Index" },
] as const;

function AddDriverModal({ onClose, onAdd }: AddDriverModalProps) {
  const [step, setStep] = useState(0);

  const [personal, setPersonal] = useState({
    name: "", phone: "", dob: "", gender: "",
    address: "", emergencyName: "", emergencyPhone: "",
  });

  const [vehicle, setVehicle] = useState({
    plate: "", make: "", model: "", year: "", color: "", zone: "",
  });

  const [ghanaCard, setGhanaCard] = useState({
    number: "", issueDate: "", expiryDate: "", cardPhoto: null as File | null, cardPhotoUrl: "",
  });

  const [captured, setCaptured] = useState<Record<string, boolean>>({});
  const [scanning, setScanning] = useState<string | null>(null);

  const [facePhoto, setFacePhoto] = useState<{ file: File | null; url: string }>({ file: null, url: "" });

  const handleNext = () => {
    if (step < WIZARD_STEPS.length - 1) { setStep(step + 1); return; }
    const newDriver: Driver = {
      id: `d${Date.now()}`,
      name: personal.name.trim() || "New Driver",
      phone: personal.phone.trim() || "—",
      plate: vehicle.plate.trim().toUpperCase() || "—",
      vehicle: `${vehicle.make} ${vehicle.model}`.trim() || "—",
      zone: vehicle.zone || ZONES[0],
      status: "offline",
      joinedAt: new Date().toISOString().split("T")[0],
      lastSeenAt: new Date().toISOString(),
      lat: 5.58 + Math.random() * 0.12,
      lng: -0.25 + Math.random() * 0.12,
    };
    onAdd(newDriver);
    onClose();
  };

  const handleScanFinger = (id: string) => {
    if (captured[id] || scanning) return;
    setScanning(id);
    setTimeout(() => {
      setCaptured((prev) => ({ ...prev, [id]: true }));
      setScanning(null);
    }, 1800);
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );

  const SelectField = ({ value, onChange, placeholder, options }: {
    value: string; onChange: (v: string) => void; placeholder: string; options: string[];
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg flex flex-col" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border shrink-0">
          <div>
            <h3 className="text-sm font-semibold">Add New Driver</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Step {step + 1} of {WIZARD_STEPS.length} — {WIZARD_STEPS[step]}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-border shrink-0">
          {WIZARD_STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className={cn(
                "flex items-center gap-1.5 text-[10px] font-medium transition-colors",
                i === step ? "text-primary" : i < step ? "text-muted-foreground" : "text-muted-foreground/40"
              )}>
                <span className={cn(
                  "size-4 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all shrink-0",
                  i === step ? "bg-primary text-primary-foreground border-primary" :
                  i < step ? "bg-muted border-border" : "border-border/40"
                )}>
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline whitespace-nowrap">{label}</span>
              </div>
              {i < WIZARD_STEPS.length - 1 && <div className="flex-1 h-px bg-border/60 mx-1" />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="h-[380px] overflow-y-auto px-6 py-5 space-y-4">

          {/* ── Step 0: Personal ── */}
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name">
                  <Input placeholder="Kwame Asante" value={personal.name} onChange={(e) => setPersonal({ ...personal, name: e.target.value })} className="h-9" />
                </Field>
                <Field label="Phone Number">
                  <Input placeholder="024 511 2233" value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} className="h-9" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date of Birth">
                  <Input type="date" value={personal.dob} onChange={(e) => setPersonal({ ...personal, dob: e.target.value })} className="h-9" />
                </Field>
                <Field label="Gender">
                  <SelectField value={personal.gender} onChange={(v) => setPersonal({ ...personal, gender: v })} placeholder="Select…" options={["Male", "Female", "Other"]} />
                </Field>
              </div>
              <Field label="Home Address">
                <Input placeholder="e.g. 12 Osu Badu St, Accra" value={personal.address} onChange={(e) => setPersonal({ ...personal, address: e.target.value })} className="h-9" />
              </Field>
              <div className="pt-1 border-t border-border">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-3 mb-3">Emergency Contact</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name">
                    <Input placeholder="Full name" value={personal.emergencyName} onChange={(e) => setPersonal({ ...personal, emergencyName: e.target.value })} className="h-9" />
                  </Field>
                  <Field label="Phone">
                    <Input placeholder="050 XXX XXXX" value={personal.emergencyPhone} onChange={(e) => setPersonal({ ...personal, emergencyPhone: e.target.value })} className="h-9" />
                  </Field>
                </div>
              </div>
            </>
          )}

          {/* ── Step 1: Vehicle ── */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Plate Number">
                  <Input placeholder="GT 1234-24" value={vehicle.plate} onChange={(e) => setVehicle({ ...vehicle, plate: e.target.value })} className="h-9" />
                </Field>
                <Field label="Assigned Zone">
                  <SelectField value={vehicle.zone} onChange={(v) => setVehicle({ ...vehicle, zone: v })} placeholder="Select zone…" options={ZONES} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Make">
                  <Input placeholder="Toyota" value={vehicle.make} onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })} className="h-9" />
                </Field>
                <Field label="Model">
                  <Input placeholder="Corolla" value={vehicle.model} onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })} className="h-9" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Year">
                  <SelectField value={vehicle.year} onChange={(v) => setVehicle({ ...vehicle, year: v })} placeholder="Select…" options={Array.from({ length: 15 }, (_, i) => String(2025 - i))} />
                </Field>
                <Field label="Color">
                  <Input placeholder="e.g. White" value={vehicle.color} onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })} className="h-9" />
                </Field>
              </div>
            </>
          )}

          {/* ── Step 2: Ghana Card ── */}
          {step === 2 && (
            <>
              <Field label="Ghana Card Number">
                <Input
                  placeholder="GHA-000000000-0"
                  value={ghanaCard.number}
                  onChange={(e) => setGhanaCard({ ...ghanaCard, number: e.target.value.toUpperCase() })}
                  className="h-9 font-mono"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Format: GHA-XXXXXXXXX-X</p>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Issue Date">
                  <Input type="date" value={ghanaCard.issueDate} onChange={(e) => setGhanaCard({ ...ghanaCard, issueDate: e.target.value })} className="h-9" />
                </Field>
                <Field label="Expiry Date">
                  <Input type="date" value={ghanaCard.expiryDate} onChange={(e) => setGhanaCard({ ...ghanaCard, expiryDate: e.target.value })} className="h-9" />
                </Field>
              </div>
              <Field label="Ghana Card Photo">
                {ghanaCard.cardPhotoUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-border bg-muted h-36">
                    <img src={ghanaCard.cardPhotoUrl} alt="Ghana Card" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setGhanaCard({ ...ghanaCard, cardPhoto: null, cardPhotoUrl: "" })}
                      className="absolute top-2 right-2 bg-card/90 border border-border rounded-md p-1 hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 rounded-lg border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/30 transition-colors cursor-pointer">
                    <WalletCards className="size-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Click to upload card photo</span>
                    <span className="text-[10px] text-muted-foreground/60 mt-1">JPG, PNG up to 10MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setGhanaCard({ ...ghanaCard, cardPhoto: file, cardPhotoUrl: URL.createObjectURL(file) });
                    }} />
                  </label>
                )}
              </Field>
            </>
          )}

          {/* ── Step 3: Biometrics ── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Place each finger on the scanner and tap the button to capture.</p>
              <div className="grid grid-cols-2 gap-3">
                {FINGERPRINT_SLOTS.map((slot) => {
                  const done = captured[slot.id];
                  const isScanning = scanning === slot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => handleScanFinger(slot.id)}
                      disabled={!!scanning || done}
                      className={cn(
                        "flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer",
                        done ? "border-green-500/40 bg-green-500/5"
                          : isScanning ? "border-primary bg-primary/5 animate-pulse"
                          : "border-border hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      <svg viewBox="0 0 24 24" className={cn("size-10 stroke-current fill-none", done ? "text-green-500" : isScanning ? "text-primary" : "text-muted-foreground")} strokeWidth={1.3}>
                        <path d="M12 1C6.5 1 2 5.5 2 11c0 3.5 1.8 6.6 4.5 8.5" strokeLinecap="round"/>
                        <path d="M12 1c5.5 0 10 4.5 10 10 0 3.5-1.8 6.6-4.5 8.5" strokeLinecap="round"/>
                        <path d="M12 5c-3.3 0-6 2.7-6 6 0 2.5 1.5 4.7 3.7 5.7" strokeLinecap="round"/>
                        <path d="M12 5c3.3 0 6 2.7 6 6 0 2.5-1.5 4.7-3.7 5.7" strokeLinecap="round"/>
                        <path d="M12 9c-1.1 0-2 .9-2 2 0 1.5.8 2.8 2 3.5 1.2-.7 2-2 2-3.5 0-1.1-.9-2-2-2z" strokeLinecap="round"/>
                      </svg>
                      <div className="text-center">
                        <p className={cn("text-xs font-semibold", done ? "text-green-600" : "text-foreground")}>{slot.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {done ? "Captured" : isScanning ? "Scanning…" : "Tap to scan"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="rounded-lg bg-muted/50 border border-border px-3 py-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{Object.values(captured).filter(Boolean).length} / {FINGERPRINT_SLOTS.length} captured</span>
              </div>
            </div>
          )}

          {/* ── Step 4: Face Photo ── */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Upload a clear front-facing photo of the driver for identity verification.</p>
              {facePhoto.url ? (
                <div className="relative rounded-xl overflow-hidden border border-border bg-muted aspect-square max-w-[220px] mx-auto">
                  <img src={facePhoto.url} alt="Driver face" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setFacePhoto({ file: null, url: "" })}
                    className="absolute top-2 right-2 bg-card/90 border border-border rounded-md p-1 hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-square max-w-[220px] mx-auto rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-muted/30 transition-colors cursor-pointer">
                  <svg viewBox="0 0 24 24" className="size-12 text-muted-foreground stroke-current fill-none mb-3" strokeWidth={1.2}>
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs text-muted-foreground">Upload face photo</span>
                  <span className="text-[10px] text-muted-foreground/60 mt-1">JPG, PNG recommended</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFacePhoto({ file, url: URL.createObjectURL(file) });
                  }} />
                </label>
              )}
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-[11px] text-amber-700">
                Ensure the photo is well-lit, front-facing, and the driver's full face is clearly visible.
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-border shrink-0">
          {step > 0 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>Back</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          )}
          <div className="flex-1" />
          <Button size="sm" onClick={handleNext}>
            {step === WIZARD_STEPS.length - 1 ? "Add Driver" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Remove Confirm Modal ──

function RemoveDriverModal({ driver, onConfirm, onClose }: { driver: Driver; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-semibold mb-1">Remove driver?</h3>
        <p className="text-xs text-muted-foreground">
          <strong>{driver.name}</strong> ({driver.plate}) will be removed from your fleet. This cannot be undone.
        </p>
        <div className="flex gap-2 mt-5">
          <Button onClick={onConfirm} variant="destructive" size="sm" className="flex-1">Remove</Button>
          <Button onClick={onClose} variant="outline" size="sm">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ── StatCard ──

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  color: "green" | "blue" | "zinc" | "primary";
}) {
  const bg: Record<string, string> = {
    green: "bg-green-500/10",
    blue: "bg-blue-500/10",
    zinc: "bg-zinc-500/10",
    primary: "bg-primary/10",
  };
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", bg[color])}>
        {icon}
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

// ── Page ──

type Tab = "overview" | "drivers" | "map";

export default function FleetDashboardPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [driverSearch, setDriverSearch] = useState("");
  const [driverStatusFilter, setDriverStatusFilter] = useState<DriverStatus | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Driver | null>(null);
  const [mapFocusId, setMapFocusId] = useState<string | null>(null);

  const active = drivers.filter((d) => d.status === "active").length;
  const offline = drivers.filter((d) => d.status === "offline").length;
  const monthlyEarnings = 38_640;

  // ── Map simulation ──
  // Tracks each driver's current position along their route
  const routeProgressRef = useRef<Record<string, { idx: number; t: number }>>(
    Object.fromEntries(
      Object.keys(DRIVER_ROUTES).map((id) => {
        const route = DRIVER_ROUTES[id];
        return [id, { idx: Math.floor(Math.random() * route.length), t: Math.random() }];
      })
    )
  );

  const [simPositions, setSimPositions] = useState<Record<string, LatLng>>({});

  useEffect(() => {
    const tick = () => {
      const next: Record<string, LatLng> = {};
      for (const [id, route] of Object.entries(DRIVER_ROUTES)) {
        const p = routeProgressRef.current[id];
        if (!p) continue;
        const from = route[p.idx];
        const to = route[(p.idx + 1) % route.length];
        next[id] = [
          from[0] + (to[0] - from[0]) * p.t,
          from[1] + (to[1] - from[1]) * p.t,
        ];
        p.t += DRIVER_SPEEDS[id] ?? 0.003;
        if (p.t >= 1) {
          p.t -= 1;
          p.idx = (p.idx + 1) % route.length;
        }
      }
      setSimPositions(next);
    };

    const interval = setInterval(tick, 120);
    return () => clearInterval(interval);
  }, []);

  const filteredDrivers = drivers.filter((d) => {
    if (driverStatusFilter !== "all" && d.status !== driverStatusFilter) return false;
    if (driverSearch && !d.name.toLowerCase().includes(driverSearch.toLowerCase()) &&
        !d.plate.toLowerCase().includes(driverSearch.toLowerCase())) return false;
    return true;
  });

  const driverLocations: DriverLocation[] = drivers.map((d) => {
    const sim = d.status === "active" ? simPositions[d.id] : undefined;
    return {
      id: d.id, name: d.name, plate: d.plate, status: d.status,
      lat: sim ? sim[0] : d.lat,
      lng: sim ? sim[1] : d.lng,
      zone: d.zone,
    };
  });

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "drivers",  label: `Drivers (${drivers.length})` },
    { id: "map",      label: "Live Map" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Fleet Dashboard</h1>
            <p className="text-sm text-muted-foreground">{drivers.length} drivers · {active} active · {offline} offline</p>
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="size-3.5 mr-1.5" />
            Add Driver
          </Button>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 mb-6 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap",
                tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={<Users className="size-4 text-green-500" />} label="Online" value={active} sub="Displaying Ads" color="green" />
              <StatCard icon={<Car className="size-4 text-zinc-400" />} label="Offline" value={offline} sub="Power Off" color="zinc" />
              <StatCard icon={<WalletCards className="size-4 text-primary" />} label="Monthly Earnings" value={formatGHS(monthlyEarnings)} sub="March 2026" color="primary" />
            </div>

            {/* Offline drivers panel */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Offline Drivers</h2>
              {(() => {
                const offlineDrivers = [...drivers]
                  .filter((d) => d.status === "offline")
                  .sort((a, b) => new Date(a.lastSeenAt).getTime() - new Date(b.lastSeenAt).getTime());

                return offlineDrivers.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
                    All drivers are currently active.
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_100px] px-4 py-2.5 bg-muted/50 border-b border-border text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <span>Driver</span>
                      <span>Vehicle</span>
                      <span>Zone</span>
                      <span className="text-right">Offline for</span>
                    </div>
                    {/* Rows */}
                    {offlineDrivers.map((d) => (
                      <div key={d.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_100px] px-4 py-3 border-b border-border last:border-b-0 items-center">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{d.name}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="size-2.5 shrink-0" />{d.phone}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{d.vehicle}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{d.plate}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            <MapPin className="size-2.5 shrink-0" />{d.zone}
                          </p>
                        </div>
                        <p className="text-xs font-bold text-zinc-500 tabular-nums text-right whitespace-nowrap">
                          {formatOfflineDuration(d.lastSeenAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── DRIVERS ── */}
        {tab === "drivers" && (
          <div>
            {/* Filter bar */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                {([["all", "All"], ["active", "Active"], ["offline", "Offline"]] as [DriverStatus | "all", string][]).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setDriverStatusFilter(val)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap",
                      driverStatusFilter === val ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {val !== "all" && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", STATUS_DOT[val as DriverStatus])} />}
                    {label}
                    <span className="text-muted-foreground">
                      {val === "all" ? drivers.length : drivers.filter((d) => d.status === val).length}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or plate…"
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-background text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Drivers table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_80px] px-4 py-2.5 bg-muted/50 border-b border-border text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Driver</span>
                <span>Vehicle</span>
                <span>Zone</span>
                <span>Status</span>
                <span>Joined</span>
                <span />
              </div>
              {filteredDrivers.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">No drivers match this filter.</div>
              ) : filteredDrivers.map((d) => (
                <div key={d.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_80px] px-4 py-3 border-b border-border last:border-b-0 items-center">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{d.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="size-2.5 shrink-0" />{d.phone}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{d.vehicle}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{d.plate}</p>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <MapPin className="size-2.5 shrink-0" />{d.zone}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", STATUS_DOT[d.status])} />
                    <span className={cn("text-xs font-medium", STATUS_TEXT[d.status])}>{STATUS_LABEL[d.status]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="size-2.5 shrink-0" />{formatDate(d.joinedAt)}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      title="Show on map"
                      onClick={() => { setMapFocusId(d.id); setTab("map"); }}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      <MapPin className="size-3.5" />
                    </button>
                    <button
                      title="Remove driver"
                      onClick={() => setRemoveTarget(d)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MAP ── */}
        {tab === "map" && (
          <div className="grid lg:grid-cols-[1fr_280px] gap-4 h-[calc(100vh-14rem)]">
            <div className="rounded-xl overflow-hidden border border-border h-full">
              <FleetMap drivers={driverLocations} focusedDriverId={mapFocusId} />
            </div>

            {/* Driver sidebar */}
            <div className="border border-border rounded-xl overflow-hidden flex flex-col h-full">
              <div className="px-4 py-3 bg-muted/50 border-b border-border shrink-0">
                <p className="text-xs font-semibold">All Drivers</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{active} active · {offline} offline</p>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {drivers.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setMapFocusId(d.id === mapFocusId ? null : d.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                      mapFocusId === d.id ? "bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full shrink-0 mt-0.5", STATUS_DOT[d.status])} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-semibold truncate", mapFocusId === d.id ? "text-primary" : "text-foreground")}>{d.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{d.vehicle} · {d.plate}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                        <MapPin className="size-2.5 shrink-0" />{d.zone}
                      </p>
                    </div>
                    <span className={cn("text-[10px] font-medium shrink-0", STATUS_TEXT[d.status])}>
                      {STATUS_LABEL[d.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      {showAddModal && (
        <AddDriverModal
          onClose={() => setShowAddModal(false)}
          onAdd={(d) => setDrivers((prev) => [...prev, d])}
        />
      )}
      {removeTarget && (
        <RemoveDriverModal
          driver={removeTarget}
          onConfirm={() => { setDrivers((prev) => prev.filter((d) => d.id !== removeTarget.id)); setRemoveTarget(null); }}
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
