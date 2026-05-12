// src/features/friends/components/profile-header.tsx
"use client";

import { PointsBadge } from "@/components/brand/points-badge";
import { UserAvatar } from "@/components/brand/user-avatar";

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
  stats,
  action,
  animatePoints = false,
  pointsExtra,
}: Props) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border bg-card p-6 sm:flex-row sm:items-start">
      <UserAvatar
        src={avatarUrl}
        name={displayName}
        className="h-24 w-24 shrink-0"
      />

      <div className="flex-1 space-y-3">
        <div>
          <h1 className="text-2xl font-semibold">{displayName}</h1>
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
