// src/features/achievements/components/achievement-card.tsx
"use client";

import { Check, Lock, Trophy } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

import type { AchievementWithStatus } from "../schemas";

type Props = {
  achievement: AchievementWithStatus;
};

export function AchievementCard({ achievement }: Props) {
  const isUnlocked = achievement.unlocked_at !== null;

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl border p-4 transition-opacity",
        isUnlocked ? "bg-card" : "bg-card/60",
      )}
    >
      {/* Замок/чек в углу — не делаем grayscale всей карточки, чтобы юзер
          понимал к чему стремится */}
      {isUnlocked ? (
        <Check
          className="absolute right-3 top-3 size-5 text-purple-400"
          strokeWidth={3}
        />
      ) : (
        <Lock className="absolute right-3 top-3 size-4 text-muted-foreground" />
      )}

      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-full",
          isUnlocked ? "bg-purple-500/20" : "bg-muted",
        )}
      >
        {achievement.icon_url ? (
          <Image
            src={achievement.icon_url}
            alt=""
            width={32}
            height={32}
            className={cn("size-8", !isUnlocked && "grayscale opacity-60")}
          />
        ) : (
          // Fallback на случай если бэк не отдал icon_url
          <Trophy
            className={cn(
              "size-7",
              isUnlocked ? "text-purple-400" : "text-muted-foreground",
            )}
          />
        )}
      </div>

      <div className="space-y-1">
        <h3
          className={cn(
            "font-semibold leading-tight",
            !isUnlocked && "text-muted-foreground",
          )}
        >
          {achievement.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {achievement.description}
        </p>
      </div>

      {isUnlocked && (
        <p className="text-xs text-purple-400">
          Получено{" "}
          {new Date(achievement.unlocked_at!).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}