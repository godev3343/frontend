// src/features/auth/api.ts
import { apiClient } from '@/lib/api/client';

import {
  type EmailVerifyConfirmInput,
  type EmailVerifyRequestInput,
  type LoginInput,
  type OnboardingInput,
  type PasswordResetConfirmInput,
  type PasswordResetRequestInput,
  type RegisterInput,
  type TokenPair,
  tokenPairSchema,
  type User,
  userSchema,
} from './schemas';

/** Сохраняет refresh в httpOnly cookie и возвращает access. */
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

export async function register(input: RegisterInput): Promise<{ access: string }> {
  const raw = await apiClient.post('api/auth/register', { json: input }).json();
  const tokens = tokenPairSchema.parse(raw);
  const access = await persistTokens(tokens);
  return { access };
}

export async function loginWithGoogle(idToken: string): Promise<{ access: string }> {
  const raw = await apiClient
    .post('api/auth/google', { json: { id_token: idToken } })
    .json();
  const tokens = tokenPairSchema.parse(raw);
  const access = await persistTokens(tokens);
  return { access };
}

export async function logout(): Promise<void> {
  // 1) сказать бэку (он blacklist'ит refresh); если упало — игнорируем
  await apiClient.post('api/auth/logout').json().catch(() => undefined);
  // 2) почистить cookie через наш Route Handler
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
  const { password_confirm: _, ...payload } = input;
  await apiClient.post('api/auth/password/reset/confirm', { json: payload }).json();
}

export async function submitOnboarding(input: OnboardingInput): Promise<User> {
  // consent (boolean) на клиенте — бэк сам ставит consent_at = now()
  const { consent: _, ...payload } = input;
  const raw = await apiClient
    .post('api/users/me/onboarding', { json: payload })
    .json();
  return userSchema.parse(raw);
}