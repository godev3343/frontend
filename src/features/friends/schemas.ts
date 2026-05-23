// src/features/friends/schemas.ts
import { z } from "zod/v4";

import { vibeSchema } from "@/features/auth/schemas";
import { userStatusSchema } from "@/features/points/status-schema";



/**
 * Бэк отдаёт юзеров через `public_name` (computed property), а фронт-UI
 * использует `display_name`. Маппим внутри схемы — UI код не трогаем.
 *
 * Friendship на бэке имеет ТРИ разных shape:
 *   - IncomingFriendRequestSerializer: {id, from_user, created_at}
 *   - OutgoingFriendRequestSerializer: {id, to_user, created_at}
 *   - FriendListItemSerializer: {id, display_name, avatar_url, bio, points} — ПЛОСКО юзер!
 *
 * Фронт-UI ожидает единый Friendship: {id, user, status, created_at}.
 * Делаем три отдельные схемы с трансформами в общий тип.
 */

export const publicUserSchema = z
  .object({
    id: z.number(),
    public_name: z.string().optional(),
    display_name: z.string().optional(),
    avatar_url: z.string().nullable().optional().default(null),
    bio: z.string().default(''),
    points: z.number().default(0),
    status: userStatusSchema.nullable().optional(),
    preferred_vibes: z.array(vibeSchema).default([]), 
    // /api/users/search возвращает friendship_status (см. UserSearchResultSerializer
    // в apps/social/serializers/user_public.py). Без него фронт всегда рендерит
    // "Добавить" → бэк возвращает 409 при попытке отправить дубль-заявку.
    // На /users/{id} это поле тоже есть; на /api/friends/* — нет (там другие
    // сериализаторы для уже-известных дружб). Делаем optional с дефолтом 'none'.
    friendship_status: z
      .string()
      .optional()
      .transform((v) => {
        if (!v) return 'none' as const;
        const parsed = friendshipStatusSchema.safeParse(v);
        return parsed.success ? parsed.data : ('none' as const);
      }),
    // friendship_id бэк в поиске пока не отдаёт → новый бэк-долг #5
    // (см. PR_HANDOFF). Без него кнопка "Отменить заявку" будет disabled,
    // но это всё равно лучше чем нынешнее 409.
    friendship_id: z.number().nullable().optional().default(null),
  })
  .transform((d) => ({
    id: d.id,
    display_name: d.display_name ?? d.public_name ?? '',
    avatar_url: d.avatar_url ?? '',
    bio: d.bio,
    points: d.points,
    status: d.status ?? null,
    friendship_status: d.friendship_status,
    friendship_id: d.friendship_id,
  }));

export type PublicUser = z.infer<typeof publicUserSchema>;

/**
 * 'self' добавлен для случая, когда смотришь свой профиль через /users/{me.id}.
 * Бэк отдаёт friendship_status в UserPublicSerializer (CharField — без enum check).
 */
/**
 * Friendship-статус юзера относительно текущего.
 * Имена выровнены с бэком (apps/social/views — annotate-логика):
 *   - none — никаких отношений
 *   - pending_outgoing — я отправил заявку, жду ответа
 *   - pending_incoming — мне отправили, надо принять/отклонить
 *   - friends — взаимная дружба
 *   - self — это я сам (используется для редиректа на /profile)
 */
export const friendshipStatusSchema = z.enum([
  "none",
  "pending_incoming",
  "pending_outgoing",
  "friends",
  "self",
]);
export type FriendshipStatus = z.infer<typeof friendshipStatusSchema>;

export const userProfileSchema = z
  .object({
    id: z.number(),
    public_name: z.string().optional(),
    display_name: z.string().optional(),
    avatar_url: z.string().nullable().optional().default(null),
    bio: z.string().default(''),
    points: z.number().default(0),
// safeParse-fallback — на случай если бэк добавит новый статус и пока не
    // выкатили фронт под него. Логируем в консоль явно, чтобы рассинхрон было
    // видно в dev-tools и Sentry breadcrumbs, а не диагностировать через
    // "кнопка не работает" в проде.
    friendship_status: z.string().transform((v) => {
      const parsed = friendshipStatusSchema.safeParse(v);
      if (parsed.success) return parsed.data;
      console.warn(
        `[schemas] Unknown friendship_status from API: "${v}". Falling back to "none". ` +
          `Update friendshipStatusSchema in schemas.ts.`,
      );
      return "none" as const;
    }),
    friendship_id: z.number().nullable().default(null),
    friends_count: z.number().default(0),
    checkins_count: z.number().default(0),
    status: userStatusSchema.nullable().optional(),
    preferred_vibes: z.array(vibeSchema).default([]),   // ← ДОБАВИТЬ

  })
  .transform((d) => ({
    ...d,
    display_name: d.display_name ?? d.public_name ?? '',
    avatar_url: d.avatar_url ?? '',
    status: d.status ?? null,                          // ← НОВОЕ (нормализуем undefined → null)

  }));

export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * Общий тип Friendship, который ожидает UI (списки друзей, заявок).
 */
export interface Friendship {
  id: number;
  user: PublicUser;
  status: 'pending' | 'accepted';
  created_at: string;
}

/**
 * Incoming заявка: бэк → {id, from_user, created_at}.
 */
export const incomingRequestSchema = z
  .object({
    id: z.number(),
    from_user: publicUserSchema,
    created_at: z.string(),
  })
  .transform<Friendship>((d) => ({
    id: d.id,
    user: d.from_user,
    status: 'pending',
    created_at: d.created_at,
  }));

/**
 * Outgoing заявка: бэк → {id, to_user, created_at}.
 */
export const outgoingRequestSchema = z
  .object({
    id: z.number(),
    to_user: publicUserSchema,
    created_at: z.string(),
  })
  .transform<Friendship>((d) => ({
    id: d.id,
    user: d.to_user,
    status: 'pending',
    created_at: d.created_at,
  }));

/**
 * FriendListItem: бэк отдаёт ПЛОСКО юзера, БЕЗ Friendship.id и created_at.
 * UI компоненты ожидают Friendship.id — но для accept/cancel/decline он не нужен
 * (для удаления используется user_id через DELETE /api/friends/{user_id}).
 * Кладём user.id как Friendship.id — это безопасно: эта запись попадает только
 * в список «друзья», а accept/decline по ней не делаются (заявки уже приняты).
 */
export const friendListItemSchema = publicUserSchema
  .transform<Friendship>((user) => ({
    id: user.id, // synthetic — это id юзера, не Friendship.id; UI использует только для key
    user,
    status: 'accepted' as const,
    created_at: '',
  }));

/** Тип-совместимость с прежним `friendshipSchema` экспортом. */
export const friendshipSchema = z.union([
  incomingRequestSchema,
  outgoingRequestSchema,
  friendListItemSchema,
]);

/**
 * DRF paginated shape — LimitOffsetPagination: {count, next, previous, results}.
 * Cursor-пагинация не используется для friends/social (только для checkins/feed).
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
 * Бэк UserMeUpdateSerializer принимает: first_name, last_name, display_name, bio.
 * avatar_url отправляется отдельно через /api/upload/* (media-флоу),
 * на PATCH /me бэк его НЕ принимает. Оставляем в форме как visual, на бэк не шлём.
 */
export const profileEditSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, "Минимум 2 символа")
    .max(32, "Максимум 32 символа"),
  bio: z.string().trim().max(280, "Максимум 280 символов").default(""),
  avatar_url: z.string().default(""),
  // AI-предпочтения. Бэк UserMeUpdateSerializer (apps/social/serializers/user_me.py)
  // принимает оба поля как required=False — отправляем всегда (массив пустой ok).
  // Лимит 5 — бэк, и для фронт-UX ограничивает VibeSelector через max=5.
  preferred_vibes: z.array(vibeSchema).max(5).default([]),
  ai_context: z.string().trim().max(500, "Максимум 500 символов").default(""),
});

export type ProfileEditInput = z.infer<typeof profileEditSchema>;
