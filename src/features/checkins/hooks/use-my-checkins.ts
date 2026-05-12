// src/features/checkins/hooks/use-my-checkins.ts
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchMyCheckins } from "../api";
import { extractCursor } from "../cursor";
import { checkinsKeys } from "../query-keys";

export function useMyCheckins() {
  return useInfiniteQuery({
    queryKey: checkinsKeys.me(),
    queryFn: ({ pageParam }) => fetchMyCheckins(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => extractCursor(lastPage.next),
  });
}
