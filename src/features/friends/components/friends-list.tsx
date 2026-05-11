// src/features/friends/components/friends-list.tsx
"use client";

import { useEffect, useRef } from "react";
import type { UseInfiniteQueryResult } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";

import type { Friendship, Paginated } from "../schemas";

type Props = {
  query: UseInfiniteQueryResult<{ pages: Paginated<Friendship>[] }, Error>;
  renderItem: (item: Friendship) => React.ReactNode;
  emptyText: string;
};

export function FriendsList({ query, renderItem, emptyText }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          query.hasNextPage &&
          !query.isFetchingNextPage
        ) {
          query.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  if (query.isPending) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <p className="text-sm text-destructive">
        Не удалось загрузить список. Попробуйте обновить страницу.
      </p>
    );
  }

  const items = query.data?.pages.flatMap((p) => p.results) ?? [];

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id}>{renderItem(item)}</div>
      ))}
      <div ref={sentinelRef} className="h-4" />
      {query.isFetchingNextPage && (
        <Skeleton className="h-16 w-full rounded-lg" />
      )}
    </div>
  );
}