// src/app/(app)/profile/points/page.tsx
"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PointsBadge } from "@/components/brand/points-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/features/auth/hooks";
import { PointsHistoryList } from "@/features/points/components/points-history-list";

export default function PointsHistoryPage() {
  const { data: me, isPending } = useMe();

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Назад в профиль
      </Link>

      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Поинты</h1>
          <p className="text-sm text-muted-foreground">
            Начисления за активность
          </p>
        </div>
        {isPending ? (
          <Skeleton className="h-7 w-16 rounded-full" />
        ) : (
          <PointsBadge
            points={me?.points ?? 0}
            variant="gradient"
            animateChange
          />
        )}
      </header>

      <PointsHistoryList />
    </div>
  );
}
