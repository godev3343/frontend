// src/features/auth/schemas.ts
import { z } from "zod/v4";

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

/** User shape, который бэк отдаёт в /api/users/me */
export const userSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string().default(''),
  display_name: z.string().default(''),
  avatar_url: z.string().default(''),
  bio: z.string().default(''),
  points: z.number().int().default(0),
  consent_at: z.string().datetime({ offset: true }).nullable(),
  email_verified: z.boolean().default(false),
});

export type User = z.infer<typeof userSchema>;

/** Ответ login/google/refresh */
export const tokenPairSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});
export type TokenPair = z.infer<typeof tokenPairSchema>;