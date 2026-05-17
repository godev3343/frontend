// src/app/(app)/profile/achievements/page.tsx
"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { AchievementsGrid } from "@/features/achievements/components/achievements-grid";
import { useAchievements } from "@/features/achievements/hooks/use-achievements";
import { track } from "@/lib/analytics";

export default function AchievementsPage() {
  const { data } = useAchievements();
  const unlockedCount = data?.filter((a) => a.unlocked_at !== null).length ?? 0;
  const totalCount = data?.length ?? 0;

  useEffect(() => {
    track("achievements_viewed");
  }, []);

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Назад в профиль
      </Link>

      <header>
        <h1 className="text-3xl font-bold leading-[1.05] md:text-4xl">Достижения</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalCount > 0
        ? `Получено ${unlockedCount} из ${totalCount} — бейджи не сгорают между сезонами`
        : "Бейджи за активность"}
        </p>
      </header>

      <AchievementsGrid />
    </div>
  );
}