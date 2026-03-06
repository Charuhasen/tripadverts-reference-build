import { GPS_ZONES, DEFAULT_MULTIPLIER } from "./constants";
import type { GPSZone } from "./types";

export function findGPSZone(lat: number, lon: number): GPSZone | null {
  for (const zone of GPS_ZONES) {
    const dist = haversineDistance(lat, lon, zone.lat, zone.lon);
    if (dist <= zone.radiusMeters) {
      return zone;
    }
  }
  return null;
}

export function getAccelerometerMultiplier(
  acceleration: { x: number; y: number; z: number } | null
): number {
  if (!acceleration) return DEFAULT_MULTIPLIER;

  // Higher movement = more impressions in transit environment
  const magnitude = Math.sqrt(
    acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
  );

  // Static ≈ 9.8 (gravity), moving adds more
  if (magnitude > 12) return 1.2; // In motion (vehicle)
  if (magnitude > 10.5) return 1.1; // Walking
  return DEFAULT_MULTIPLIER;
}

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export async function getCurrentPosition(): Promise<{ lat: number; lon: number } | null> {
  if (typeof window === "undefined" || !navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}
