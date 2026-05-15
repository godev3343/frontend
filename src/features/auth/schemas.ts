// src/features/auth/schemas.ts
import { z } from "zod/v4";

import { userStatusSchema } from "@/features/points/status-schema";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Введите email')
  .email('Некорректный email');
export const passwordSchema = z
  .string()
  .min(8, 'Минимум 8 символов')
  .max(128, 'Слишком длинный пароль');
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Введите пароль'),
});
export const registerSchema = z.object({
  email: emailSchema,
  first_name: z.string().trim().min(1, 'Введите имя').max(100),
  password: passwordSchema,
});
export const emailVerifyRequestSchema = z.object({
  email: emailSchema,
});
export const emailVerifyConfirmSchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, '6 цифр'),
});
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});
export const passwordResetConfirmSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    password_confirm: passwordSchema,
  })
  .refine((d) => d.password === d.password_confirm, {
    message: 'Пароли не совпадают',
    path: ['password_confirm'],
  });
export const onboardingSchema = z.object({
  display_name: z.string().trim().min(2, 'Минимум 2 символа').max(100),
  bio: z.string().trim().max(300).default(''),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Нужно согласие на обработку ПДн',
  }),
});
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type EmailVerifyRequestInput = z.infer<typeof emailVerifyRequestSchema>;
export type EmailVerifyConfirmInput = z.infer<typeof emailVerifyConfirmSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
/**
 * User shape, который бэк отдаёт в /api/users/me и в ответе onboarding.
 *
 * Полный (UserMeSerializer из apps/social): id, email, first_name, last_name,
 *   display_name, avatar_url, bio, points, is_email_verified, is_onboarded,
 *   friends_count, checkins_count.
 *
 * Минимальный (UserMeSerializer из apps/users/.../onboarding.py, на ответ
 *   POST /api/users/me/onboarding): без last_name/friends_count/checkins_count.
 *
 * Чтобы не плодить два типа — все «дополнительные» поля делаем optional с
 * дефолтами. UI везде использует `display_name`, `points`, `is_onboarded` —
 * этих полей хватает в обоих ответах.
 *
 * ВАЖНО: бэк отдаёт `avatar_url: null` когда у юзера нет аватара (видно в
 * Network на POST /onboarding — поле приходит null). `z.string().default('')`
 * срабатывает только на undefined, не на null — поэтому `userSchema.parse`
 * падал на свежезареганых юзерах. Решение: nullable + preprocess к ''.
 * То же касается last_name (может прийти '' или null в зависимости от
 * сериализатора). Делаем эти поля nullable через preprocess чтобы UI всегда
 * получал string.
 */
const stringFromNullable = z.preprocess(
  (v) => (v == null ? '' : v),
  z.string(),
);

export const userSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  first_name: stringFromNullable.default(''),
  last_name: stringFromNullable.default(''),
  display_name: stringFromNullable.default(''),
  avatar_url: stringFromNullable.default(''),
  bio: stringFromNullable.default(''),
  points: z.number().int().default(0),
  is_email_verified: z.boolean().default(false),
  is_onboarded: z.boolean().default(false),
  friends_count: z.number().int().default(0),
  checkins_count: z.number().int().default(0),
  status: userStatusSchema.nullable().optional(),   // ← НОВОЕ

});

export type User = z.infer<typeof userSchema>;

/** Ответ login/google/refresh — пара токенов. */
export const tokenPairSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});
export type TokenPair = z.infer<typeof tokenPairSchema>;

/** Ответ register — без токенов; бэк просит сначала верифицировать email. */
export const registerResponseSchema = z.object({
  detail: z.string(),
});
export type RegisterResponse = z.infer<typeof registerResponseSchema>;

/** Ответ Google OAuth — те же токены + флаг новизны юзера. */
export const googleAuthResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
  created: z.boolean().default(false),
});
export type GoogleAuthResponse = z.infer<typeof googleAuthResponseSchema>;
