"use client";

import Link from "next/link";

import { UserAvatar } from "@/components/brand/user-avatar";
import { cn } from "@/lib/utils";

import type { LeaderboardRow } from "../schemas";

export function LeaderboardRowItem({
  row,
  isMe,
}: {
  row: LeaderboardRow;
  isMe: boolean;
}) {
  const isTop3 = row.rank <= 3;

  return (
    <Link
      href={isMe ? "/profile" : `/users/${row.id}`}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-3 transition-all hover:brightness-110",
        isMe && "border-primary/50 shadow-glow-accent",
      )}
    >
      <span
        className={cn(
          "w-7 shrink-0 text-center font-mono text-sm tabular-nums",
          isTop3
            ? "font-semibold text-primary"
            : "text-[color:var(--text-mute)]",
        )}
      >
        {row.rank}
      </span>

      <UserAvatar
        src={row.avatar_url}
        name={row.display_name}
        className="size-10 shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-medium">{row.display_name}</span>
          {isMe && <span className="text-mono-label text-primary">вы</span>}
        </div>
        {row.status && (
          <div className="truncate text-xs text-muted-foreground">
            {row.status.name}
          </div>
        )}
      </div>

      <span className="shrink-0 font-semibold tabular-nums">
        {row.points.toLocaleString("ru-RU")}
      </span>
    </Link>
  );
}