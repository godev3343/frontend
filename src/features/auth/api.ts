// src/features/auth/api.ts
import type { VibeTag } from '@/components/brand/vibe-badge';
import { apiClient } from '@/lib/api/client';

import {
  type EmailVerifyConfirmInput,
  type EmailVerifyRequestInput,
  googleAuthResponseSchema,
  type LoginInput,
  type OnboardingInput,
  type PasswordResetConfirmInput,
  type PasswordResetRequestInput,
  type RegisterInput,
  registerResponseSchema,
  type TokenPair,
  tokenPairSchema,
  type User,
  userSchema,
} from './schemas';


/**
 * Сохраняет refresh в httpOnly cookie через Next route и возвращает access.
 * Access живёт ТОЛЬКО в zustand (in-memory); после reload восстанавливается
 * через AuthGate → POST /api/auth/refresh (тоже Next route, читает cookie).
 */
async function persistTokens(tokens: TokenPair): Promise<string> {
  const res = await fetch('/api/auth/set-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tokens),
  });
  if (!res.ok) throw new Error('Не удалось сохранить токены');
  const data = (await res.json()) as { access: string };
  return data.access;
}

export async function login(input: LoginInput): Promise<{ access: string }> {
  const raw = await apiClient.post('api/auth/login', { json: input }).json();
  const tokens = tokenPairSchema.parse(raw);
  const access = await persistTokens(tokens);
  return { access };
}

/**
 * Register — бэк отдаёт ТОЛЬКО {detail: "..."}, без токенов.
 * Юзер должен сначала подтвердить email (POST /api/auth/email/verify/confirm),
 * а потом залогиниться. Поэтому возвращаем void; страница регистрации
 * сама редиректит на /verify-email.
 */
export async function register(input: RegisterInput): Promise<void> {
  const raw = await apiClient.post('api/auth/register', { json: input }).json();
  // Парсим только чтобы убедиться в shape ответа — детально detail нам не нужен.
  registerResponseSchema.parse(raw);
}

export async function loginWithGoogle(idToken: string): Promise<{ access: string }> {
  const raw = await apiClient
    .post('api/auth/google', { json: { id_token: idToken } })
    .json();
  const parsed = googleAuthResponseSchema.parse(raw);
  const access = await persistTokens({ access: parsed.access, refresh: parsed.refresh });
  return { access };
}

export async function logout(): Promise<void> {
  // Логаут на бэке требует refresh в body — у нас он в httpOnly cookie на стороне Next,
  // поэтому делаем через Next route /api/auth/clear, который чистит cookie.
  // Бэк сам blacklist'ит refresh при следующей попытке использования — нам достаточно
  // забыть cookie на клиенте.
  await fetch('/api/auth/clear', { method: 'POST' });
}

export async function fetchMe(): Promise<User> {
  const raw = await apiClient.get('api/users/me').json();
  return userSchema.parse(raw);
}

export async function requestEmailVerification(input: EmailVerifyRequestInput) {
  await apiClient.post('api/auth/email/verify/request', { json: input }).json();
}

export async function confirmEmailVerification(input: EmailVerifyConfirmInput) {
  await apiClient.post('api/auth/email/verify/confirm', { json: input }).json();
}

export async function requestPasswordReset(input: PasswordResetRequestInput) {
  await apiClient.post('api/auth/password/reset/request', { json: input }).json();
}

export async function confirmPasswordReset(input: PasswordResetConfirmInput) {
  // password_confirm — клиентская валидация, на бэк его не шлём
  const { password_confirm: _pc, ...payload } = input;
  void _pc;
  await apiClient.post('api/auth/password/reset/confirm', { json: payload }).json();
}

export async function submitOnboarding(input: OnboardingInput): Promise<User> {
  // ВАЖНО: consent ОБЯЗАТЕЛЬНОЕ поле на бэке (apps/users/serializers/onboarding.py).
  // Раньше мы его выкидывали — бэк возвращал 400 validation_error. Теперь шлём как есть.
  const raw = await apiClient
    .post('api/users/me/onboarding', { json: input })
    .json();
  return userSchema.parse(raw);
}

export async function updatePreferences(input: {
  preferred_vibes: VibeTag[];
  ai_context: string;
}): Promise<User> {
  await apiClient
    .put('api/users/me/preferences', { json: input })
    .json<{ preferred_vibes: string[]; ai_context: string }>();
  return fetchMe();
}
