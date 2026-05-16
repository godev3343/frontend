// src/features/achievements/hooks/use-achievements.ts
"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuthStore } from "@/features/auth/store";

import {
  fetchAchievementsCatalog,
  fetchMyAchievements,
} from "../api";
import { achievementsKeys } from "../query-keys";
import type { AchievementWithStatus } from "../schemas";

/**
 * Объединяет каталог и мои ачивки. Возвращает массив в порядке `order` с бэка
 * (бэк уже сортирует), с unlocked_at либо string, либо null.
 *
 * useQueries — потому что нам нужны оба запроса параллельно. Loading/error
 * считается агрегатно: если оба ещё грузятся → isPending; если хоть один упал
 * → isError. Это упрощение — для каталога без my-ачивок можно показать grid
 * со всеми locked, но в pre-MVP не оптимизируем.
 */
export function useAchievements() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [catalogQ, myQ] = useQueries({
    queries: [
      {
        queryKey: achievementsKeys.catalog(),
        queryFn: fetchAchievementsCatalog,
        // Каталог стабилен — обновляется только когда админ через Django
        // добавит новую ачивку. Кэшим надолго.
        staleTime: 30 * 60 * 1000,
        enabled: Boolean(accessToken),
      },
      {
        queryKey: achievementsKeys.me(),
        queryFn: fetchMyAchievements,
        // Мои — инвалидируем после чек-ина/отзыва, см. use-create-checkin.
        staleTime: 5 * 60 * 1000,
        enabled: Boolean(accessToken),
      },
    ],
  });

  const merged = useMemo<AchievementWithStatus[] | undefined>(() => {
    if (!catalogQ.data || !myQ.data) return undefined;

    // map по code для O(1) lookup
    const unlockedByCode = new Map(
      myQ.data.map((ua) => [ua.achievement.code, ua.unlocked_at]),
    );

    return catalogQ.data.map((a) => ({
      ...a,
      unlocked_at: unlockedByCode.get(a.code) ?? null,
    }));
  }, [catalogQ.data, myQ.data]);

  return {
    data: merged,
    isPending: catalogQ.isPending || myQ.isPending,
    isError: catalogQ.isError || myQ.isError,
    error: catalogQ.error ?? myQ.error,
    refetch: () => {
      void catalogQ.refetch();
      void myQ.refetch();
    },
  };
}