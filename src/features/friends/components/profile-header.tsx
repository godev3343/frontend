// src/features/friends/components/profile-header.tsx
"use client";

import { PointsBadge } from "@/components/brand/points-badge";
import { StatusBadge } from "@/components/brand/status-badge";
import { UserAvatar } from "@/components/brand/user-avatar";
import { getProfileGradient } from "@/features/map/lib/vibe-colors";
import type { Vibe } from "@/features/map/schemas";
import {
  deriveStatusFromPoints,
  type UserStatus,
} from "@/features/points/status-schema";

type Stats = {
  friends: number;
  checkins: number;
  points: number;
};

type Props = {
  displayName: string;
  avatarUrl: string;
  bio: string;
  stats: Stats;
  status?: UserStatus | null;
  /**
   * Топовые вайбы юзера — для vibe-gradient фона шапки.
   * Если массив пуст (бэк ещё не отдаёт top_vibes на /me и /users/{id}),
   * рендерится lime-accent фолбэк — см. getProfileGradient.
   * Бэк-долг #4 — добавить top_vibes в MeSerializer + UserPublicSerializer.
   */
  topVibes?: readonly Vibe[];

  /** Слот под кнопки: «Редактировать» для self, FriendshipButton для чужого. */
  action: React.ReactNode;
  /**
   * Анимировать бейдж поинтов на увеличение. Включаем только на self-профиле:
   * у чужого профиля поинты не меняются в рамках сессии.
   */
  animatePoints?: boolean;
  /** Опциональный слот под бейджем (например, ссылка «История поинтов»). */
  pointsExtra?: React.ReactNode;
};

export function ProfileHeader({
  displayName,
  avatarUrl,
  bio,
  status,
  stats,
  topVibes = [],
  action,
  animatePoints = false,
  pointsExtra,
}: Props) {
  const effectiveStatus = status ?? deriveStatusFromPoints(stats.points);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-card p-6"
      style={{ backgroundImage: getProfileGradient(topVibes) }}
    >
      {/* Контент — два колонки на sm+, одна на mobile. */}
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
        <UserAvatar
          src={avatarUrl}
          name={displayName}
          className="h-24 w-24 shrink-0"
        />

        <div className="flex-1 space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold leading-[1.05] md:text-4xl">
                {displayName}
              </h1>
              <StatusBadge status={effectiveStatus} />
            </div>

            {bio && <p className="mt-1 text-muted-foreground">{bio}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Stat label="Друзей" value={stats.friends} />
            <Stat label="Чек-инов" value={stats.checkins} />
            <div className="flex items-center gap-2">
              <PointsBadge points={stats.points} animateChange={animatePoints} />
              {pointsExtra}
            </div>
          </div>

          <div className="pt-2">{action}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}