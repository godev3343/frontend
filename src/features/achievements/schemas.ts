// src/features/achievements/schemas.ts
import { z } from "zod/v4";

/**
 * Каталог ачивки. Соответствует apps/gamification/serializers/achievements.py
 * ::AchievementSerializer. name/description уже локализованы на бэке (source=name_ru),
 * на фронте никаких трансформаций.
 *
 * icon_url — URL картинки (предположительно R2). Nullable на случай если бэк
 * не успел загрузить иконку — фронт покажет fallback.
 */
export const achievementSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string(),
  icon_url: z.string().url().nullable(),
  order: z.number().int(),
});
export type Achievement = z.infer<typeof achievementSchema>;

/**
 * Разблокированная ачивка юзера. UserAchievementSerializer.
 * achievement вложен (read_only), unlocked_at = created_at алиас.
 */
export const userAchievementSchema = z.object({
  achievement: achievementSchema,
  unlocked_at: z.string().datetime({ offset: true }),
});
export type UserAchievement = z.infer<typeof userAchievementSchema>;

export const achievementsListSchema = z.array(achievementSchema);
export const userAchievementsListSchema = z.array(userAchievementSchema);

/**
 * Объединённый формат для UI. Каталог + флаг unlocked + дата (если получено).
 * Делается merge'ом на фронте: для каждого Achievement из каталога ищем
 * совпадение в UserAchievement по code.
 */
export type AchievementWithStatus = Achievement & {
  unlocked_at: string | null;
};

/**
 * Mini-формат для unlock-нотификации в ответе чек-ина/отзыва/etc.
 * Опционально — бэк может не реализовать это поле, тогда тоста не будет.
 */
export const achievementMiniSchema = z.object({
  code: z.string(),
  name: z.string(),
  icon_url: z.string().url().nullable(),
});
export type AchievementMini = z.infer<typeof achievementMiniSchema>;