"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, useMap, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed } from "lucide-react";
import type { Zone, City } from "@/lib/schemas/campaignData";

function MapUpdater({ city }: { city: City }) {
  const map = useMap();
  useEffect(() => {
    map.setView(city.center, city.zoom);
  }, [city, map]);
  return null;
}

function MapResetButton({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  return (
    <div className="leaflet-bottom leaflet-right mb-4 mr-4 z-[400] relative pointer-events-auto">
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          map.setView(center, zoom, { animate: true });
        }}
        className="bg-background rounded-md shadow-md/50 ring-1 ring-border p-2 hover:bg-muted/80 transition-colors drop-shadow-sm flex items-center justify-center pointer-events-auto"
        title="Reset view to city center"
      >
        <LocateFixed className="w-4 h-4 text-primary" />
      </button>
    </div>
  );
}

export default function ZoneMap({
  city,
  zones,
  selectedIds,
  onZoneClick
}: {
  city: City;
  zones: Zone[];
  selectedIds: string[];
  onZoneClick: (id: string) => void;
}) {
  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-border shadow-inner relative z-0 group">
       <MapContainer center={city.center} zoom={city.zoom} scrollWheelZoom={false} style={{ width: "100%", height: "100%" }}>
         <TileLayer 
           url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
           attribution='&copy; <a href="https://carto.com/">CARTO</a>'
         />
         <MapUpdater city={city} />
         <MapResetButton center={city.center} zoom={city.zoom} />
         {zones.map(zone => {
           const isSelected = selectedIds.includes(zone.id);
           return (
             <Polygon
               key={zone.id}
               positions={zone.polygon}
               pathOptions={{
                 color: isSelected ? "#14b8a6" : "#64748b", // teal vs muted
                 weight: isSelected ? 3 : 1,
                 fillOpacity: isSelected ? 0.3 : 0.05,
                 className: "outline-none focus:outline-none",
               }}
               eventHandlers={{
                 click: () => onZoneClick(zone.id)
               }}
             >
               <Tooltip direction="right" sticky={true} className="font-semibold text-xs border-none shadow-md p-2">
                 <div className="text-center mb-1">{zone.name}</div>
                 <div className="flex flex-col gap-0.5 text-[10px] font-normal text-muted-foreground">
                   <span>{zone.availableTaxis} taxis</span>
                   <span>{zone.estimatedDailyImpressions.toLocaleString()}/day</span>
                   <span className="font-medium text-foreground">{zone.priceMultiplier}x rate</span>
                 </div>
               </Tooltip>
             </Polygon>
           );
         })}
       </MapContainer>
    </div>
  );
}
