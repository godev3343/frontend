// src/features/friends/components/user-card.tsx
"use client";

import Link from "next/link";

import { UserAvatar } from "@/components/brand/user-avatar";
import { Button } from "@/components/ui/button";

import type { PublicUser } from "../schemas";

type Props = {
  user: PublicUser;
  /** Кнопки/контролы справа. Передаются снаружи — карточка их не знает. */
  action?: React.ReactNode;
  href?: string;
};

export function UserCard({ user, action, href }: Props) {
  const inner = (
    <div className="flex flex-1 items-center gap-3 min-w-0">
      <UserAvatar
        src={user.avatar_url}
        name={user.display_name}
        className="h-10 w-10 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{user.display_name}</div>
        {user.bio && (
          <div className="truncate text-sm text-muted-foreground">{user.bio}</div>
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