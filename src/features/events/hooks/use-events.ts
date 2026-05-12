// src/features/events/hooks/use-events.ts
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchEvents } from "@/features/events/api";
import { type DateRange,eventsKeys } from "@/features/events/query-keys";
import type { Bbox, Vibe } from "@/features/map/schemas";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/**
 * Маркеры событий для карты по bbox + vibes + диапазону дат.
 * Аналог `usePlaces`: bbox дебаунсится, placeholder сохраняется
 * между запросами, чтобы маркеры не мигали при панорамировании.
 * Запрос не уходит пока bbox не известен ИЛИ пока showEvents = false.
 */
export function useEvents(
  bbox: Bbox | null,
  vibes: Vibe[],
  date: DateRange,
  enabled: boolean = true,
) {
  const debouncedBbox = useDebouncedValue(bbox, 250);

  return useQuery({
    queryKey: eventsKeys.map(debouncedBbox, vibes, date),
    queryFn: () =>
      fetchEvents({
        bbox: debouncedBbox ?? undefined,
        vibes,
        date_from: date?.from,
        date_to: date?.to,
      }),
    enabled: enabled && debouncedBbox !== null,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
