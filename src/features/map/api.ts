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
 * Округляет bbox до 3 знаков, чтобы попадать в Redis-кеш на бэке.
 */
function roundBbox(bbox: Bbox): Bbox {
  return bbox.map((n) => Math.round(n * 1000) / 1000) as Bbox;
}

export async function fetchPlaces(bbox: Bbox, vibes: Vibe[]): Promise<PlacesPage> {
  const rounded = roundBbox(bbox);
  const searchParams = new URLSearchParams({
    bbox: rounded.join(","),
  });
  if (vibes.length > 0) {
    searchParams.set("vibes", vibes.join(","));
  }
  const data = await apiClient.get(`api/places?${searchParams.toString()}`).json();
  return placesPageSchema.parse(data);
}

export async function fetchPlaceDetail(id: string): Promise<PlaceDetail> {
  const data = await apiClient.get(`api/places/${id}`).json();
  return placeDetailSchema.parse(data);
}
