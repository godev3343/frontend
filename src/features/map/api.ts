// src/features/map/api.ts
import {
  type Bbox,
  type PlaceDetail,
  placeDetailSchema,
  type PlacesPage,
  placesPageSchema,
  type Vibe,
} from "@/features/map/schemas";
import { apiClient } from "@/lib/api/client";

/**
 * Округляет bbox до 3 знаков, чтобы попадать в Redis-кеш на бэке (cache_key
 * округляется до тех же 3 знаков, см. apps/places/services/cache.py).
 */
function roundBbox(bbox: Bbox): Bbox {
  return bbox.map((n) => Math.round(n * 1000) / 1000) as Bbox;
}

/**
 * GET /api/places/?bbox=lng_min,lat_min,lng_max,lat_max&vibe=calm,active
 *
 * Бэк (EPIC 5): vibe — query-param 'vibe' (single, CSV-список), не 'vibes'.
 * Trailing slash обязателен — Django иначе делает 301.
 */
export async function fetchPlaces(bbox: Bbox, vibes: Vibe[]): Promise<PlacesPage> {
  const rounded = roundBbox(bbox);
  const searchParams = new URLSearchParams({
    bbox: rounded.join(","),
  });
  if (vibes.length > 0) {
    searchParams.set("vibe", vibes.join(","));
  }
  const data = await apiClient.get(`api/places/?${searchParams.toString()}`).json();
  return placesPageSchema.parse(data);
}

export async function fetchPlaceDetail(id: string): Promise<PlaceDetail> {
  // trailing slash + path-id числом, но id у нас уже string из schema-нормализации
  const data = await apiClient.get(`api/places/${id}/`).json();
  return placeDetailSchema.parse(data);
}
