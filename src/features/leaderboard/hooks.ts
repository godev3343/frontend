"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchFriendsLeaderboard, fetchGlobalLeaderboard } from "./api";
import { leaderboardKeys } from "./query-keys";
import type { LeaderboardPage } from "./schemas";

/**
 * LimitOffsetPagination отдаёт next как полный URL с параметром `offset`
 * (не `cursor`!). Достаём именно offset.
 */
function extractOffset(nextUrl: string | null): string | undefined {
  if (!nextUrl) return undefined;
  try {
    return new URL(nextUrl).searchParams.get("offset") ?? undefined;
  } catch {
    const m = nextUrl.match(/[?&]offset=(\d+)/);
    return m ? m[1] : undefined;
  }
}

export function useGlobalLeaderboard() {
  return useInfiniteQuery({
    queryKey: leaderboardKeys.global(),
    queryFn: ({ pageParam }) => fetchGlobalLeaderboard(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: LeaderboardPage) => extractOffset(last.next),
    staleTime: 30_000,
  });
}

export function useFriendsLeaderboard() {
  return useInfiniteQuery({
    queryKey: leaderboardKeys.friends(),
    queryFn: ({ pageParam }) => fetchFriendsLeaderboard(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: LeaderboardPage) => extractOffset(last.next),
    staleTime: 30_000,
  });
}