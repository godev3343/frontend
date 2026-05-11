// src/features/friends/query-keys.ts

/**
 * Централизованная фабрика queryKey. Использовать ВЕЗДЕ, никаких inline-массивов.
 * Иначе invalidate легко промахнётся (порядок аргументов, типы).
 */
export const friendsKeys = {
  all: ["friends"] as const,
  lists: () => [...friendsKeys.all, "list"] as const,
  friendsList: () => [...friendsKeys.lists(), "friends"] as const,
  incoming: () => [...friendsKeys.lists(), "incoming"] as const,
  outgoing: () => [...friendsKeys.lists(), "outgoing"] as const,
  search: (q: string) => [...friendsKeys.all, "search", q] as const,
  profile: (userId: number) => ["user-profile", userId] as const,
};