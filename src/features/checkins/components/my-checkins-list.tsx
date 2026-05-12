// src/features/checkins/components/my-checkins-list.tsx
"use client";

import { useMyCheckins } from "../hooks/use-my-checkins";
import { CheckinsInfiniteList } from "./checkins-infinite-list";

export function MyCheckinsList() {
  const query = useMyCheckins();

  if (query.isPending) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        Загружаем чек-ины...
      </p>
    );
  }

  if (query.isError) {
    return (
      <p className="text-destructive py-12 text-center text-sm">
        Не удалось загрузить чек-ины
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
      emptyMessage="Пока нет чек-инов — сделайте первый на карте"
    />
  );
}
