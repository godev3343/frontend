// src/features/friends/components/user-card.tsx
"use client";

import Link from "next/link";

import { StatusBadge } from "@/components/brand/status-badge";
import { UserAvatar } from "@/components/brand/user-avatar";
import { deriveStatusFromPoints } from "@/features/points/status-schema";

import type { PublicUser } from "../schemas";

type Props = {
  user: PublicUser;
  /** Кнопки/контролы справа. Передаются снаружи — карточка их не знает. */
  action?: React.ReactNode;
  href?: string;
};

export function UserCard({ user, action, href }: Props) {
  // Бэк теперь отдаёт status в PublicUser. Старые кешированные ответы
  // (или несинхронизированные эндпоинты) могут прийти без него — тогда
  // считаем сами из points, чтобы карточка не пустовала.
  const status = user.status ?? deriveStatusFromPoints(user.points);

  const inner = (
    <div className="flex flex-1 items-center gap-3 min-w-0">
      <UserAvatar
        src={user.avatar_url}
        name={user.display_name}
        className="h-10 w-10 shrink-0"
      />
      <div className="min-w-0 flex-1">
        {/* Имя и статус в одной строке. min-w-0 на имени — чтобы оно
            могло truncate, а бейдж (shrink-0) всегда оставался видимым. */}
        <div className="flex items-center gap-2">
          <span className="min-w-0 truncate font-medium">
            {user.display_name}
          </span>
          <StatusBadge status={status} iconOnly className="shrink-0" />
        </div>
        {user.bio && (
          <div className="truncate text-sm text-muted-foreground">
            {user.bio}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/30">
      {href ? (
        <Link href={href} className="flex flex-1 items-center gap-3 min-w-0">
          {inner}
        </Link>
      ) : (
        inner
      )}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}