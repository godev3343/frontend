// src/features/friends/components/search-users-panel.tsx
"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { useSearchUsers } from "../hooks";
import { FriendshipButton } from "./friendship-button";
import { UserCard } from "./user-card";

/**
 * Поиск пользователей с inline-кнопкой действия по статусу дружбы.
 *
 * v2: используем FriendshipButton вместо голой "Добавить" — он сам решает
 * что рендерить по friendship_status (none/pending_outgoing/pending_incoming/
 * friends/self). Это устраняет 409 при попытке отправить дубль-заявку.
 *
 * Бэк-долг #5: UserSearchResultSerializer не отдаёт friendship_id.
 * Для pending_outgoing/incoming это значит кнопки "Отменить"/"Принять"
 * disabled. Юзер всё ещё может перейти на /users/{id} и сделать действие
 * там (UserPublicSerializer friendship_id отдаёт).
 */
export function SearchUsersPanel() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  const search = useSearchUsers(debouncedQuery);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск пользователей…"
          className="pl-9"
        />
      </div>

      {debouncedQuery.trim().length < 2 ? (
        <p className="text-sm text-muted-foreground">
          Введите минимум 2 символа.
        </p>
      ) : search.isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : search.isError ? (
        <p className="text-sm text-destructive">Ошибка поиска</p>
      ) : search.data && search.data.results.length === 0 ? (
        <p className="text-sm text-muted-foreground">Никого не нашли</p>
      ) : (
        <div className="space-y-2">
          {search.data?.results.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              href={`/users/${user.id}`}
              action={
                <FriendshipButton
                  userId={user.id}
                  status={user.friendship_status}
                  friendshipId={user.friendship_id}
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}