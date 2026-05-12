// src/features/events/hooks/use-events-list.ts
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { extractCursor } from "@/features/checkins/cursor";
import { fetchEvents } from "@/features/events/api";
import { type DateRange,eventsKeys } from "@/features/events/query-keys";
import type { Vibe } from "@/features/map/schemas";

/**
 * Бесконечный список событий для /events.
 * Без bbox — пользователь смотрит афишу как ленту.
 */
export function useEventsList(vibes: Vibe[], date: DateRange) {
  return useInfiniteQuery({
    queryKey: eventsKeys.list(vibes, date),
    queryFn: ({ pageParam }) =>
      fetchEvents({
        vibes,
        date_from: date?.from,
        date_to: date?.to,
        cursor: pageParam,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => extractCursor(lastPage.next),
  });
}
