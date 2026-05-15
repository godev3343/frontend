// src/features/reviews/query-keys.ts
export const reviewsKeys = {
  all: ["reviews"] as const,
  /** Список отзывов конкретного места. */
  place: (placeId: string) => [...reviewsKeys.all, "place", placeId] as const,
} as const;