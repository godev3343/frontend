// src/features/checkins/components/checkins-infinite-list.tsx
"use client";

import { useEffect, useRef } from "react";

import type { CheckIn } from "../schemas";
import { CheckinCard } from "./checkin-card";

type Props = {
  items: CheckIn[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  emptyMessage: string;
};

export function CheckinsInfiniteList({
  items,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  emptyMessage,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((c) => (
        <CheckinCard key={c.id} checkin={c} />
      ))}

      <div ref={sentinelRef} aria-hidden className="h-1" />

      {isFetchingNextPage && (
        <p className="text-muted-foreground text-center text-sm">
          Загружаем...
        </p>
      )}
    </div>
  );
}
