"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from "react-leaflet";
import { Zone } from "@/lib/schemas/campaignData";
import "leaflet/dist/leaflet.css";

interface Props {
  zones: Zone[];
  center: [number, number];
  zoom: number;
  selectedZoneIds: string[];
  hoveredZoneId: string | null;
  onToggleZone: (zoneId: string) => void;
  onHoverZone: (zoneId: string | null) => void;
}

// Zone fill colours: grey = unselected, teal = selected
function zoneColor(zone: Zone, selected: boolean, hovered: boolean) {
  void zone; // zone data retained for tooltip, not needed for colour
  if (selected) return { color: "#4a9a8a", fillColor: "#6FB4A6", fillOpacity: hovered ? 0.65 : 0.45 };
  if (hovered) return { color: "#6FB4A6", fillColor: "#6FB4A6", fillOpacity: 0.2 };
  // Unselected: subtle grey
  return { color: "#9ca3af", fillColor: "#9ca3af", fillOpacity: 0.18 };
}

function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevCenter = useRef(center);
  useEffect(() => {
    if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
      map.setView(center, zoom);
      prevCenter.current = center;
    }
  }, [center, zoom, map]);
  return null;
}

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

export default function AccraZoneMap({ zones, center, zoom, selectedZoneIds, hoveredZoneId, onToggleZone, onHoverZone }: Props) {
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
      <RecenterMap center={center} zoom={zoom} />
      <FitBounds zones={zones} />
      {zones.map((zone) => {
        const selected = selectedZoneIds.includes(zone.id);
        const hovered = hoveredZoneId === zone.id;
        const style = zoneColor(zone, selected, hovered);
        return (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{ ...style, weight: selected ? 2.5 : 1.5 }}
            eventHandlers={{
              click: () => onToggleZone(zone.id),
              mouseover: () => onHoverZone(zone.id),
              mouseout: () => onHoverZone(null),
            }}
          >
            <Tooltip direction="top" sticky>
              <div className="text-xs">
                <p className="font-bold">{zone.name}</p>
                <p>{zone.category} · {zone.trafficDensity} traffic</p>
                <p>{zone.availableTaxis} taxis · {zone.estimatedDailyImpressions.toLocaleString()} imp/day</p>
                <p className="mt-1 font-medium">{selected ? "Click to deselect" : "Click to select"}</p>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
      </MapContainer>
    </div>
  );
}
