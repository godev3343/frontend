// src/features/friends/schemas.ts
import { z } from "zod/v4";

/**
 * Минимальная инфа о юзере для списков/карточек.
 * Бэк должен отдавать это поле в любом эндпойнте, где юзер встречается
 * как ссылка (friends, requests, search, posts.author и т.д.)
 */
export const publicUserSchema = z.object({
  id: z.number(),
  display_name: z.string(),
  avatar_url: z.string().nullable().default(""),
  bio: z.string().default(""),
  points: z.number().default(0),
});

export type PublicUser = z.infer<typeof publicUserSchema>;

/**
 * Расширенный профиль для страницы /users/[id].
 * friendship_status вычисляется бэком из таблицы Friendship.
 *
 * - 'none'     — нет связи, можно отправить заявку
 * - 'incoming' — он отправил мне, надо принять/отклонить
 * - 'outgoing' — я отправил ему, можно отменить
 * - 'friends'  — мы друзья, можно удалить
 * - 'self'     — это я сам, рендерим как /profile (или редиректим)
 */
export const friendshipStatusSchema = z.enum([
  "none",
  "incoming",
  "outgoing",
  "friends",
  "self",
]);

export type FriendshipStatus = z.infer<typeof friendshipStatusSchema>;

export const userProfileSchema = publicUserSchema.extend({
  friendship_status: friendshipStatusSchema,
  friendship_id: z.number().nullable().default(null),
  friends_count: z.number().default(0),
  checkins_count: z.number().default(0),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * Запись в списке друзей или входящих/исходящих.
 * id — это id строки Friendship на бэке (нужен для accept/decline/cancel).
 * user — снапшот юзера на момент запроса.
 */
export const friendshipSchema = z.object({
  id: z.number(),
  user: publicUserSchema,
  status: z.enum(["pending", "accepted"]),
  created_at: z.string(),
});

export type Friendship = z.infer<typeof friendshipSchema>;

/**
 * DRF cursor pagination shape.
 * count может отсутствовать у некоторых эндпойнтов — делаем optional.
 */
export const paginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    next: z.string().nullable(),
    previous: z.string().nullable(),
    count: z.number().optional(),
    results: z.array(itemSchema),
  });

export type Paginated<T> = {
  next: string | null;
  previous: string | null;
  count?: number;
  results: T[];
};

/**
 * Форма редактирования своего профиля.
 * display_name: 2–32 символа, без emoji-only.
 * bio: до 280 символов.
 */
export const profileEditSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, "Минимум 2 символа")
    .max(32, "Максимум 32 символа"),
  bio: z.string().trim().max(280, "Максимум 280 символов").default(""),
  avatar_url: z.string().default(""),
});

export type ProfileEditInput = z.infer<typeof profileEditSchema>;