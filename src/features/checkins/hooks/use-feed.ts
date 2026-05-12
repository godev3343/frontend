// src/features/checkins/hooks/use-feed.ts
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchFeed } from "../api";
import { extractCursor } from "../cursor";
import { checkinsKeys } from "../query-keys";

export function useFeed() {
  return useInfiniteQuery({
    queryKey: checkinsKeys.feed(),
    queryFn: ({ pageParam }) => fetchFeed(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => extractCursor(lastPage.next),
  });
}
