// src/features/events/query-keys.ts
import type { Bbox, Vibe } from "@/features/map/schemas";

export type DateRange = { from: string; to: string } | null;

export const eventsKeys = {
  all: ["events"] as const,
  /** Markers for the map. Bbox -> different caches. */
  map: (bbox: Bbox | null, vibes: Vibe[], date: DateRange) =>
    [...eventsKeys.all, "map", bbox, [...vibes].sort(), date] as const,
  /** Paged list for /events (no bbox). */
  list: (vibes: Vibe[], date: DateRange) =>
    [...eventsKeys.all, "list", [...vibes].sort(), date] as const,
  detail: (id: string) =>
    [...eventsKeys.all, "detail", id] as const,
} as const;
