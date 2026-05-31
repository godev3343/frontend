"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/features/auth/hooks";

import type { useGlobalLeaderboard } from "../hooks";
import { LeaderboardRowItem } from "./leaderboard-row";

// Оба хука (global/friends) возвращают идентичный тип — берём один как референс.
type LeaderboardQuery = ReturnType<typeof useGlobalLeaderboard>;

export function LeaderboardList({
  query,
  emptyText,
}: {
  query: LeaderboardQuery;
  emptyText: string;
}) {
  const { data: me } = useMe();
  const {
    data,
    isPending,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = query;

  if (isPending) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[58px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">Не удалось загрузить рейтинг.</p>
    );
  }

  const rows = data.pages.flatMap((p) => p.results);

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <LeaderboardRowItem key={row.id} row={row} isMe={row.id === me?.id} />
      ))}

      {hasNextPage && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Загрузка…" : "Показать ещё"}
        </Button>
      )}
    </div>
  );
}