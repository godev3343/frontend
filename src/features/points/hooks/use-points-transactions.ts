// src/features/points/hooks/use-points-transactions.ts
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/store";

import { fetchMyPoints } from "../api";
import { pointsKeys } from "../query-keys";
import type { PointsPage } from "../schemas";

/**
 * История поинтов текущего юзера. Cursor-пагинация по образцу checkins/events.
 *
 * `next` бэка — это полная URL со встроенным cursor. Достаём cursor из query,
 * чтобы передать его как чистый параметр (apiClient сам соберёт search).
 */
export function usePointsTransactions() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useInfiniteQuery({
    queryKey: pointsKeys.history(),
    queryFn: ({ pageParam }: { pageParam: string | null }) =>
      fetchMyPoints({ cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last: PointsPage) => {
      if (!last.next) return undefined;
      try {
        const u = new URL(last.next);
        return u.searchParams.get("cursor");
      } catch {
        return undefined;
      }
    },
    enabled: Boolean(accessToken),
    staleTime: 60 * 1000,
  });
}
