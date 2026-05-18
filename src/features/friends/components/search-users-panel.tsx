// src/features/friends/components/search-users-panel.tsx
"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { useIncomingRequests, useOutgoingRequests } from "../hooks";
import { useSearchUsers } from "../hooks";
import { FriendshipButton } from "./friendship-button";
import { UserCard } from "./user-card";

/**
 * Поиск пользователей с inline-кнопкой действия по статусу дружбы.
 *
 * Дебаунс 300мс применяется только когда юзер ВВОДИТ — при стирании поля
 * ниже 2 символов мы мгновенно показываем плейсхолдер, без 300мс залипа
 * со старыми результатами.
 *
 * Бэк-долг #5: UserSearchResultSerializer не отдаёт friendship_id, поэтому
 * для pending_outgoing/incoming некоторые кнопки disabled.
 */
export function SearchUsersPanel() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  // Если query короче 2 символов — игнорируем дебаунс, чтобы плейсхолдер
  // появлялся мгновенно при стирании. Когда query валидный — берём
  // дебаунсный (минимум сетевых запросов при печати).
  const effectiveQuery = query.trim().length < 2 ? query : debouncedQuery;
  const hasQuery = effectiveQuery.trim().length >= 2;

  const search = useSearchUsers(effectiveQuery);

  useOutgoingRequests();
  useIncomingRequests();

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

      {!hasQuery ? (
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
                  size="sm"
                />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

