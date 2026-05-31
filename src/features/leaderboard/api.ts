// src/features/leaderboard/api.ts
import { apiClient } from "@/lib/api/client";

import { type LeaderboardPage, leaderboardPageSchema } from "./schemas";

// NB: пути БЕЗ trailing slash — как в social/urls.py (иначе 404).
export async function fetchGlobalLeaderboard(
  offset?: string,
): Promise<LeaderboardPage> {
  const url = offset ? `api/leaderboard?offset=${offset}` : "api/leaderboard";
  const data = await apiClient.get(url).json();
  return leaderboardPageSchema.parse(data);
}

export async function fetchFriendsLeaderboard(
  offset?: string,
): Promise<LeaderboardPage> {
  const url = offset
    ? `api/leaderboard/friends?offset=${offset}`
    : "api/leaderboard/friends";
  const data = await apiClient.get(url).json();
  return leaderboardPageSchema.parse(data);
}