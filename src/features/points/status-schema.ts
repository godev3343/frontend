// src/features/points/status-schema.ts
import { z } from "zod/v4";

/**
 * Бэк отдаёт status встроенным полем в UserMe / UserPublic / FriendListItem.
 * Источник: apps/gamification/serializers/status.py → UserStatusSerializer.
 *
 * Коды (apps/gamification/services/status.py):
 *   guest (0) → explorer (100) → navigator (500) → insider (2000) → legend (10000)
 *
 * Формат: { code, name, threshold }.
 *   name — уже локализованная строка (бэк отдаёт name_ru), не пытаемся переводить.
 *
 * Делаем status nullable+optional на фронте: если поле не пришло (старый бэк,
 * закешированный ответ) — деградируем без падений. UI решит сам что показать
 * через fallback от points.
 */
export const statusCodeSchema = z.enum([
  "guest",
  "explorer",
  "navigator",
  "insider",
  "legend",
]);
export type StatusCode = z.infer<typeof statusCodeSchema>;

export const userStatusSchema = z.object({
  code: statusCodeSchema,
  name: z.string(),
  threshold: z.number().int().nonnegative(),
});
export type UserStatus = z.infer<typeof userStatusSchema>;

/**
 * Источник истины для фронта на случай, когда бэк status НЕ прислал
 * (старый кеш в react-query, незамигрированные коллеги, и т.п.).
 * Должно совпадать с apps/gamification/services/status._STATUSES.
 */
const STATUS_TABLE: readonly UserStatus[] = [
  { code: "legend", name: "Легенда города", threshold: 10_000 },
  { code: "insider", name: "Инсайдер", threshold: 2_000 },
  { code: "navigator", name: "Навигатор города", threshold: 500 },
  { code: "explorer", name: "Исследователь", threshold: 100 },
  { code: "guest", name: "Гость города", threshold: 0 },
] as const;

export function deriveStatusFromPoints(points: number): UserStatus {
  for (const s of STATUS_TABLE) {
    if (points >= s.threshold) return s;
  }
  return STATUS_TABLE[STATUS_TABLE.length - 1]!; // guest
}

/**
 * Возвращает следующий по порядку статус (если есть) — для UI «до следующего N поинтов».
 */
export function getNextStatus(current: StatusCode): UserStatus | null {
  // STATUS_TABLE отсортирован по убыванию threshold; «следующий» — это предыдущий элемент
  const idx = STATUS_TABLE.findIndex((s) => s.code === current);
  if (idx <= 0) return null;
  return STATUS_TABLE[idx - 1] ?? null;
}