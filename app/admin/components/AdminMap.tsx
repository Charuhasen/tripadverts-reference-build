"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { DriverStatus } from "@/lib/admin-data";

export interface AdminDriverMarker {
  id: string;
  name: string;
  plate: string;
  status: DriverStatus;
  lat: number;
  lng: number;
  zone: string;
  type: "individual" | "fleet";
  fleetName?: string;
}

interface Props {
  drivers: AdminDriverMarker[];
  center?: [number, number];
  zoom?: number;
}

const COLORS = {
  individual: "#22c55e",
  fleet: "#0ea5e9",
  offline: "#6b7280",
};

function FitBounds({ drivers }: { drivers: AdminDriverMarker[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || drivers.length === 0) return;
    fitted.current = true;
    const bounds = L.latLngBounds(drivers.map((d) => [d.lat, d.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  }, [drivers, map]);

  return null;
}

export default function AdminMap({ drivers, center = [5.6037, -0.187], zoom = 12 }: Props) {
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full absolute inset-0 z-0"
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />
        <FitBounds drivers={drivers} />
        {drivers.map((d) => {
          const isActive = d.status === "active";
          const color = isActive ? (d.type === "fleet" ? COLORS.fleet : COLORS.individual) : COLORS.offline;
          return (
            <CircleMarker
              key={d.id}
              center={[d.lat, d.lng]}
              radius={7}
              pathOptions={
                isActive
                  ? { color, fillColor: color, fillOpacity: 0.85, weight: 2 }
                  : { color: COLORS.offline, fillColor: COLORS.offline, fillOpacity: 0.15, weight: 2.5, dashArray: "4 3" }
              }
            >
              <Tooltip direction="top" offset={[0, -6]}>
                <div className="text-xs min-w-[140px]">
                  <p className="font-bold">{d.name}</p>
                  <p className="text-gray-500">{d.plate} · {d.zone}</p>
                  {d.fleetName && <p className="text-gray-400 text-[11px]">{d.fleetName}</p>}
                  <p className="capitalize font-medium mt-0.5" style={{ color }}>{d.status}</p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Legend</p>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS.individual }} />
          <span>Individual · Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS.fleet }} />
          <span>Fleet · Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className="w-2.5 h-2.5 rounded-full border-2 shrink-0"
            style={{ borderColor: COLORS.offline, borderStyle: "dashed" }}
          />
          <span>Offline</span>
        </div>
      </div>
    </div>
  );
}
