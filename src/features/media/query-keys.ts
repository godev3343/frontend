// src/features/media/query-keys.ts
export const mediaKeys = {
  all: ["media"] as const,
  status: (key: string) => ["media", "status", key] as const,
} as const;
