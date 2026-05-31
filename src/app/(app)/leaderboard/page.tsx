"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { LeaderboardList } from "@/features/leaderboard/components/leaderboard-list";
import {
  useFriendsLeaderboard,
  useGlobalLeaderboard,
} from "@/features/leaderboard/hooks";
import { cn } from "@/lib/utils";

type Tab = "global" | "friends";

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("global");
  const globalQuery = useGlobalLeaderboard();
  const friendsQuery = useFriendsLeaderboard();

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4 pb-28">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Назад в профиль
      </Link>

      <header>
        <h1 className="text-3xl font-bold leading-[1.05] md:text-4xl">Рейтинг</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Кто активнее всех в городе
        </p>
      </header>

      <div className="grid grid-cols-2 gap-1 rounded-lg border bg-card p-1">
        <TabButton active={tab === "global"} onClick={() => setTab("global")}>
          Все
        </TabButton>
        <TabButton active={tab === "friends"} onClick={() => setTab("friends")}>
          Друзья
        </TabButton>
      </div>

      {tab === "global" ? (
        <LeaderboardList
          query={globalQuery}
          emptyText="Пока никого нет в рейтинге."
        />
      ) : (
        <LeaderboardList
          query={friendsQuery}
          emptyText="Добавьте друзей, чтобы соревноваться."
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-md text-sm font-medium transition-all",
        active
          ? "bg-secondary text-foreground"
          : "text-[color:var(--text-mute)] hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}