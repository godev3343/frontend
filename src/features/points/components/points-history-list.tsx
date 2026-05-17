// src/features/points/components/points-history-list.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

import { usePointsTransactions } from "../hooks/use-points-transactions";
import { getReasonMeta } from "../lib/reason-meta";
import type { PointsTransaction } from "../schemas";

export function PointsHistoryList() {
  const {
    data,
    isPending,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = usePointsTransactions();

  // PostHog capture — открытие истории. track() сам не падает без ключа.
  useEffect(() => {
    track("points_history_viewed");
  }, []);

  if (isPending) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-muted-foreground">
          Не удалось загрузить историю поинтов.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "Попробуйте позже"}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => void refetch()}
        >
          Повторить
        </Button>
      </div>
    );
  }

  const items = data.pages.flatMap((p) => p.results);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Поинтов пока нет. Сделайте первый чек-ин, чтобы получить +5.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {items.map((tx) => (
          <li key={tx.id}>
            <PointsRow tx={tx} />
          </li>
        ))}
      </ul>

      {hasNextPage && (
        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Загрузка…" : "Загрузить ещё"}
          </Button>
        </div>
      )}
    </div>
  );
}

function PointsRow({ tx }: { tx: PointsTransaction }) {
  const { label, icon: Icon } = getReasonMeta(tx.reason);
  const isPositive = tx.delta >= 0;

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          isPositive
            ? "bg-primary/15 text-primary"
            : "bg-red-500/20 text-red-300",
        )}
        aria-hidden
      >
        <Icon className="size-5" strokeWidth={2.25} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(tx.created_at), {
            addSuffix: true,
            locale: ru,
          })}
        </div>
      </div>

      <div
        className={cn(
          "shrink-0 text-base font-semibold tabular-nums",
          isPositive ? "text-primary" : "text-destructive",
        )}
        aria-label={`${isPositive ? "плюс" : "минус"} ${Math.abs(tx.delta)} поинтов`}
      >
        {isPositive ? "+" : ""}
        {tx.delta}
      </div>
    </div>
  );
}
