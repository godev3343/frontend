// src/features/media/query-keys.ts
export const mediaKeys = {
  all: ["media"] as const,
  /** Статус asset'а для polling-а: ключ — asset_id (но мы держим string в query key). */
  status: (asset_id: string) => ["media", "status", asset_id] as const,
} as const;
