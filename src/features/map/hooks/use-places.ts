// src/features/map/hooks/use-places.ts
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchPlaces } from "@/features/map/api";
import { mapKeys } from "@/features/map/query-keys";
import type { Bbox, Vibe } from "@/features/map/schemas";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/**
 * Загрузка маркеров по bbox + vibes.
 * - bbox дебаунсится 250мс, чтобы не дёргать сеть на каждый кадр панорамирования
 * - placeholderData: keepPreviousData чтобы маркеры не мигали между запросами
 */
export function usePlaces(bbox: Bbox | null, vibes: Vibe[]) {
  const debouncedBbox = useDebouncedValue(bbox, 250);

  return useQuery({
    queryKey: mapKeys.places(debouncedBbox, vibes),
    queryFn: () => fetchPlaces(debouncedBbox!, vibes),
    enabled: debouncedBbox !== null,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
