// src/features/reviews/hooks/use-place-reviews.ts
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchPlaceReviews } from "../api";
import { reviewsKeys } from "../query-keys";

/** Извлекает offset из next-URL DRF LimitOffsetPagination. */
function extractOffset(nextUrl: string | null): string | undefined {
  if (!nextUrl) return undefined;
  try {
    return new URL(nextUrl).searchParams.get("offset") ?? undefined;
  } catch {
    const m = nextUrl.match(/[?&]offset=(\d+)/);
    return m ? m[1] : undefined;
  }
}

export function usePlaceReviews(placeId: string | null) {
  return useInfiniteQuery({
    queryKey: placeId ? reviewsKeys.place(placeId) : reviewsKeys.place("__noop__"),
    queryFn: ({ pageParam }) => fetchPlaceReviews(placeId!, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => extractOffset(lastPage.next),
    enabled: placeId !== null,
    staleTime: 30_000,
  });
}