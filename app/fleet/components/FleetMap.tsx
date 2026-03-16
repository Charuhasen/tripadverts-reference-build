"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
  fitAllTrigger?: number;
  onMarkerClick?: (id: string) => void;
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

function FitBoundsOnDemand({ drivers, trigger }: { drivers: DriverLocation[]; trigger: number }) {
  const map = useMap();
  const prevTrigger = useRef(-1);
  useEffect(() => {
    if (trigger === prevTrigger.current || drivers.length === 0) return;
    prevTrigger.current = trigger;
    const bounds = L.latLngBounds(drivers.map((d) => [d.lat, d.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [trigger, drivers, map]);
  return null;
}

export default function FleetMap({
  drivers,
  center = [5.6037, -0.187],
  zoom = 12,
  focusedDriverId,
  fitAllTrigger = 0,
  onMarkerClick,
}: Props) {
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
        <FitBoundsOnDemand drivers={drivers} trigger={fitAllTrigger} />
        {drivers.map((d) => {
          const isActive = d.status === "active";
          const isFocused = d.id === focusedDriverId;
          return (
            <CircleMarker
              key={d.id}
              center={[d.lat, d.lng]}
              radius={isFocused ? 10 : 7}
              pathOptions={
                isActive
                  ? {
                      color: isFocused ? "#15803d" : STATUS_COLOR.active,
                      fillColor: STATUS_COLOR.active,
                      fillOpacity: 0.85,
                      weight: isFocused ? 3 : 2,
                    }
                  : {
                      color: STATUS_COLOR.offline,
                      fillColor: STATUS_COLOR.offline,
                      fillOpacity: 0.15,
                      weight: 2.5,
                      dashArray: "4 3",
                    }
              }
              eventHandlers={{ click: () => onMarkerClick?.(d.id) }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                <div className="text-xs min-w-[130px]">
                  <p className="font-bold">{d.name}</p>
                  <p className="text-gray-500">{d.plate} · {d.zone}</p>
                  <p className="capitalize font-medium" style={{ color: STATUS_COLOR[d.status] }}>{d.status}</p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Driver Status</p>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLOR.active }} />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className="w-2.5 h-2.5 rounded-full border-2"
            style={{ borderColor: STATUS_COLOR.offline, borderStyle: "dashed" }}
          />
          <span>Offline</span>
        </div>
      </div>
    </div>
  );
}
