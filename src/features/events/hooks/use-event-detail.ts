// src/features/events/hooks/use-event-detail.ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchEventDetail } from "@/features/events/api";
import { eventsKeys } from "@/features/events/query-keys";

export function useEventDetail(id: string | null) {
  return useQuery({
    queryKey: id ? eventsKeys.detail(id) : eventsKeys.detail("__noop__"),
    queryFn: () => fetchEventDetail(id!),
    enabled: id !== null,
    staleTime: 30_000,
  });
}
