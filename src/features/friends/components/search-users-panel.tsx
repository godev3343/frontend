// src/features/friends/components/search-users-panel.tsx
"use client";

import { Search, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { useSearchUsers, useSendFriendRequest } from "../hooks";
import { UserCard } from "./user-card";

export function SearchUsersPanel() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  const search = useSearchUsers(debouncedQuery);
  const send = useSendFriendRequest();

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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => send.mutate(user.id)}
                  disabled={send.isPending}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Добавить
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}