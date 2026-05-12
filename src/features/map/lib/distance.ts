// src/features/map/lib/distance.ts
import type { Location } from "@/features/map/schemas";

/**
 * Haversine — расстояние между двумя точками в метрах.
 * Для UX-проверки 100м-радиуса чек-ина. Финальную валидацию делает бэк.
 */
export function haversineMeters(a: Location, b: Location): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const CHECKIN_RADIUS_METERS = 100;
