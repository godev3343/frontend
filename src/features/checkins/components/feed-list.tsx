// src/features/checkins/components/feed-list.tsx
"use client";

import { useFeed } from "../hooks/use-feed";
import { CheckinsInfiniteList } from "./checkins-infinite-list";

export function FeedList() {
  const query = useFeed();

  if (query.isPending) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        Загружаем ленту...
      </p>
    );
  }

  if (query.isError) {
    return (
      <p className="text-destructive py-12 text-center text-sm">
        Не удалось загрузить ленту
      </p>
    );
  }

  const items = query.data.pages.flatMap((p) => p.results);

  return (
    <CheckinsInfiniteList
      items={items}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPage={() => void query.fetchNextPage()}
      emptyMessage="Добавьте друзей чтобы видеть их чек-ины"
    />
  );
}
