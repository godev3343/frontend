export const leaderboardKeys = {
  all: ["leaderboard"] as const,
  global: () => [...leaderboardKeys.all, "global"] as const,
  friends: () => [...leaderboardKeys.all, "friends"] as const,
};