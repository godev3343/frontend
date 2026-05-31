import { z } from "zod/v4";

import { userStatusSchema } from "@/features/points/status-schema";

/**
 * Бэк отдаёт public_name (computed) и avatar_url (может быть null) —
 * нормализуем в display_name/'' как в friends/schemas.
 */
export const leaderboardRowSchema = z
  .object({
    rank: z.number(),
    id: z.number(),
    public_name: z.string().optional(),
    display_name: z.string().optional(),
    avatar_url: z.string().nullable().optional().default(null),
    points: z.number().default(0),
    status: userStatusSchema.nullable().optional(),
  })
  .transform((d) => ({
    rank: d.rank,
    id: d.id,
    display_name: d.display_name ?? d.public_name ?? "",
    avatar_url: d.avatar_url ?? "",
    points: d.points,
    status: d.status ?? null,
  }));

export type LeaderboardRow = z.infer<typeof leaderboardRowSchema>;

export const leaderboardPageSchema = z.object({
  count: z.number().optional(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(leaderboardRowSchema),
});

export type LeaderboardPage = z.infer<typeof leaderboardPageSchema>;