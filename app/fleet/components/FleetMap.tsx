"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type DriverStatus = "active" | "offline";

export interface DriverLocation {
  id: string;
  name: string;
  plate: string;
  status: DriverStatus;
  lat: number;
  lng: number;
  zone: string;
}

interface Props {
  drivers: DriverLocation[];
  center?: [number, number];
  zoom?: number;
  focusedDriverId?: string | null;
}

const STATUS_COLOR: Record<DriverStatus, string> = {
  active: "#22c55e",
  offline: "#6b7280",
};

function FlyTo({ driverId, drivers }: { driverId: string | null | undefined; drivers: DriverLocation[] }) {
  const map = useMap();
  useEffect(() => {
    if (!driverId) return;
    const d = drivers.find((x) => x.id === driverId);
    if (d) map.flyTo([d.lat, d.lng], 15, { duration: 1 });
  }, [driverId, drivers, map]);
  return null;
}

export default function FleetMap({ drivers, center = [5.6037, -0.187], zoom = 12, focusedDriverId }: Props) {
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
        <FlyTo driverId={focusedDriverId} drivers={drivers} />
        {drivers.map((d) => (
          <CircleMarker
            key={d.id}
            center={[d.lat, d.lng]}
            radius={7}
            pathOptions={{
              color: STATUS_COLOR[d.status],
              fillColor: STATUS_COLOR[d.status],
              fillOpacity: d.status === "offline" ? 0.4 : 0.85,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <div className="text-xs min-w-[130px]">
                <p className="font-bold">{d.name}</p>
                <p className="text-gray-500">{d.plate} · {d.zone}</p>
                <p className="capitalize font-medium" style={{ color: STATUS_COLOR[d.status] }}>
                  {d.status}
                </p>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Driver Status</p>
        {(["active", "offline"] as DriverStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[s] }} />
            <span className="capitalize">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
