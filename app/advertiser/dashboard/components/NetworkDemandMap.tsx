"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from "react-leaflet";
import { Zone } from "@/lib/schemas/campaignData";
import "leaflet/dist/leaflet.css";

export type DemandLevel = "high" | "medium" | "low";

export interface ZoneDemand {
  zone: Zone;
  demand: DemandLevel;
  bookedTaxis: number;
  activeCampaigns: number;
}

const DEMAND_STYLES: Record<DemandLevel, { color: string; fillColor: string }> = {
  high: { color: "#dc2626", fillColor: "#ef4444" },
  medium: { color: "#d97706", fillColor: "#f59e0b" },
  low: { color: "#16a34a", fillColor: "#22c55e" },
};

const DEMAND_LABELS: Record<DemandLevel, string> = {
  high: "High Demand",
  medium: "Medium Demand",
  low: "Available",
};

function FitBounds({ zones }: { zones: Zone[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || zones.length === 0) return;
    const allCoords = zones.flatMap((z) => z.polygon);
    if (allCoords.length > 0) {
      const lats = allCoords.map((c) => c[0]);
      const lngs = allCoords.map((c) => c[1]);
      map.fitBounds([
        [Math.min(...lats) - 0.01, Math.min(...lngs) - 0.01],
        [Math.max(...lats) + 0.01, Math.max(...lngs) + 0.01],
      ]);
      fitted.current = true;
    }
  }, [zones, map]);
  return null;
}

function FlyToZone({ zone }: { zone: Zone | null }) {
  const map = useMap();
  useEffect(() => {
    if (!zone) return;
    map.flyTo(zone.center, 14, { duration: 0.8 });
  }, [zone, map]);
  return null;
}

interface Props {
  zoneDemands: ZoneDemand[];
  center: [number, number];
  zoom: number;
  focusedZoneId?: string | null;
}

export default function NetworkDemandMap({ zoneDemands, center, zoom, focusedZoneId }: Props) {
  const focusedZone = focusedZoneId
    ? zoneDemands.find((zd) => zd.zone.id === focusedZoneId)?.zone ?? null
    : null;

  return (
    <div className="w-full h-full min-h-[500px] relative">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full absolute inset-0 rounded-xl z-0"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />
        <FitBounds zones={zoneDemands.map((zd) => zd.zone)} />
        <FlyToZone zone={focusedZone} />
        {zoneDemands.map((zd) => {
          const style = DEMAND_STYLES[zd.demand];
          const available = zd.zone.availableTaxis - zd.bookedTaxis;
          const isFocused = zd.zone.id === focusedZoneId;
          return (
            <Polygon
              key={zd.zone.id}
              positions={zd.zone.polygon}
              pathOptions={{
                color: isFocused ? "#3b82f6" : style.color,
                fillColor: isFocused ? "#3b82f6" : style.fillColor,
                fillOpacity: isFocused ? 0.5 : zd.demand === "high" ? 0.45 : zd.demand === "medium" ? 0.35 : 0.25,
                weight: isFocused ? 3 : 2,
              }}
            >
              <Tooltip direction="top" sticky>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold">{zd.zone.name}</p>
                  <p>{zd.zone.availableTaxis} total · {available} available</p>
                  <p>~{zd.zone.estimatedDailyImpressions.toLocaleString()} daily impressions</p>
                  <p>{zd.activeCampaigns} active campaign{zd.activeCampaigns !== 1 ? "s" : ""}</p>
                  <p className="font-semibold mt-1" style={{ color: style.color }}>
                    {DEMAND_LABELS[zd.demand]}
                  </p>
                </div>
              </Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Demand</p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500/60 border border-red-500" /> High
          </span>
          <span className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400/50 border border-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-500/40 border border-green-500" /> Available
          </span>
        </div>
      </div>
    </div>
  );
}
