// src/features/points/schemas.ts
import { z } from "zod/v4";

/**
 * Соответствует apps/gamification/models.PointsReason на бэке.
 * Если бэк добавит новый reason — zod упадёт на unknown enum value,
 * и это правильно: фронт должен явно решить как его показать.
 */
export const pointsReasonSchema = z.enum([
  "checkin",
  "first_checkin",
  "friend_added"
]);
export type PointsReason = z.infer<typeof pointsReasonSchema>;

export const pointsTransactionSchema = z.object({
  id: z.number().int(),
  delta: z.number().int(),
  reason: pointsReasonSchema,
  ref_type: z.string().default(""),
  ref_id: z.number().int().nullable().default(null),
  created_at: z.string().datetime({ offset: true }),
});
export type PointsTransaction = z.infer<typeof pointsTransactionSchema>;

/** Cursor-пагинация в стиле DRF, как в checkins/events. */
export const pointsPageSchema = z.object({
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(pointsTransactionSchema),
});
export type PointsPage = z.infer<typeof pointsPageSchema>;
