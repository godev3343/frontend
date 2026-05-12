// src/features/checkins/query-keys.ts
export const checkinsKeys = {
  all: ["checkins"] as const,
  feed: () => [...checkinsKeys.all, "feed"] as const,
  me: () => [...checkinsKeys.all, "me"] as const,
  place: (placeId: string) =>
    [...checkinsKeys.all, "place", placeId] as const,
} as const;
