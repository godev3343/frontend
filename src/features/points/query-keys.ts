// src/features/points/query-keys.ts
export const pointsKeys = {
  all: ["points"] as const,
  /** Список транзакций текущего юзера (cursor-paged). */
  history: () => [...pointsKeys.all, "history"] as const,
} as const;
