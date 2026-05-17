// src/features/friends/components/friends-list.tsx
"use client";

import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import type { Friendship, Paginated } from "../schemas";

type Props = {
  query: UseInfiniteQueryResult<{ pages: Paginated<Friendship>[] }, Error>;
  /**
   * Рендер-функция элемента. Используем `children` (function-as-children),
   * а не отдельный prop `renderItem` — иначе Next.js 16 ругается на пересечение
   * "use client" границы с не-сериализуемым пропсом-функцией (TS71007).
   * Children из этого правила исключён.
   */
  children: (item: Friendship) => React.ReactNode;
  emptyText: string;
};

export function FriendsList({ query, children, emptyText }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        <div key={item.id}>{children(item)}</div>
      ))}
      <div ref={sentinelRef} className="h-4" />
      {query.isFetchingNextPage && (
        <Skeleton className="h-16 w-full rounded-lg" />
      )}
    </div>
  );
}