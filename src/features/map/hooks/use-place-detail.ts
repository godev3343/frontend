// src/features/map/hooks/use-place-detail.ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPlaceDetail } from "@/features/map/api";
import { mapKeys } from "@/features/map/query-keys";

export function usePlaceDetail(id: string | null) {
  return useQuery({
    queryKey: mapKeys.place(id ?? "__none__"),
    queryFn: () => fetchPlaceDetail(id!),
    enabled: id !== null,
    staleTime: 60_000,
  });
}
