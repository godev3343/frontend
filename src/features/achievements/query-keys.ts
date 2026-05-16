// src/features/achievements/query-keys.ts
export const achievementsKeys = {
  all: ["achievements"] as const,
  catalog: () => [...achievementsKeys.all, "catalog"] as const,
  me: () => [...achievementsKeys.all, "me"] as const,
};