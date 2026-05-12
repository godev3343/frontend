// src/features/ai/query-keys.ts
export const aiKeys = {
  all: ["ai"] as const,
  recommend: (query: string) => ["ai", "recommend", query] as const,
};
