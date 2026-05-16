// src/features/achievements/components/achievements-grid.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useAchievements } from "../hooks/use-achievements";
import { AchievementCard } from "./achievement-card";

export function AchievementsGrid() {
  const { data, isPending, isError, error, refetch } = useAchievements();

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <p className="text-muted-foreground">
          Не удалось загрузить достижения.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "Попробуйте позже"}
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={refetch}>
          Повторить
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {data.map((a) => (
        <AchievementCard key={a.code} achievement={a} />
      ))}
    </div>
  );
}