// src/features/map/query-keys.ts
import type { Bbox, Vibe } from "@/features/map/schemas";

export const mapKeys = {
  all: ["map"] as const,
  places: (bbox: Bbox | null, vibes: Vibe[]) =>
    ["map", "places", bbox, [...vibes].sort()] as const,
  place: (id: string) => ["map", "place", id] as const,
};
