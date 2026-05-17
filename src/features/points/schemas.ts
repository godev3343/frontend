// src/features/points/schemas.ts
import { z } from "zod/v4";

/**
 * Известные нам reason'ы — синхронизированы с apps/gamification/models.PointsReason
 * на бэке. Источник правды у бэка — apps/gamification/services/points.py::POINTS_BY_REASON.
 *
 * ⚠ Для парсинга API-ответа используем pointsReasonSchema (z.string()) ниже,
 * а KNOWN_REASONS — только для UI-маппинга (см. reason-meta.ts).
 *
 * Это решает прод-баг: раньше при добавлении нового reason бэком (например
 * "review_posted") старая узкая zod-схема падала с invalid_value и юзер
 * видел raw JSON. Теперь принимаем любую строку, неизвестные значения
 * корректно деградируют до humanize()-метки через getReasonMeta().
 */
export const KNOWN_REASONS = [
  "checkin",
  "first_checkin",
  "friend_added",
  "review_posted",
] as const;

export type KnownPointsReason = (typeof KNOWN_REASONS)[number];

/**
 * Reason для парсинга — z.string() вместо z.enum().
 * Бэк может добавлять новые значения без падений фронта; неизвестные
 * рендерятся через fallback в reason-meta.ts.
 *
 * Если в Sentry/console увидишь много неизвестных reason — это сигнал
 * синхронизироваться с бэкендером и обновить KNOWN_REASONS + REASON_META.
 */
export const pointsReasonSchema = z.string();

/** Сохранён для обратной совместимости с типами в других местах кода. */
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