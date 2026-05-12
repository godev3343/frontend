// src/lib/analytics/index.ts
/**
 * Тонкая обёртка над posthog-js. Решает три задачи:
 *  1. Не падать в SSR (posthog трогает window).
 *  2. Не падать без NEXT_PUBLIC_POSTHOG_KEY (в dev/staging ключа может не быть).
 *  3. Один источник правды по именам событий — не плодим строки в коде.
 *
 * posthog инициализируется в `PostHogProvider` (один раз, при первом маунте).
 * Здесь только capture/identify/reset.
 */

import { env } from '@/lib/env';

const ENABLED = typeof window !== 'undefined' && Boolean(env.NEXT_PUBLIC_POSTHOG_KEY);

/**
 * Имена событий — единый список. Если событие не в этом union — TS не даст
 * вызвать `track`. Это защищает от опечаток и от случайного дублирования
 * (`checkin_create` vs `checkin_created`).
 */
export type AnalyticsEvent =
  | 'signup_completed'
  | 'login_completed'
  | 'checkin_created'
  | 'friend_request_sent'
  | 'ai_query_sent'
  | 'points_history_viewed'
  | 'place_opened'
  | 'event_opened'
  | 'event_rsvp_changed';

type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

/** Ленивый импорт posthog-js — не тянем его в bundle на SSR. */
async function getPosthog() {
  if (!ENABLED) return null;
  const mod = await import('posthog-js');
  return mod.default;
}

/** Послать событие. Не падает без ключа, не падает в SSR. */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (!ENABLED) return;
  // fire-and-forget. posthog.capture сам по себе синхронный после init,
  // но import — async; используем .then без await чтобы не блокировать.
  void getPosthog().then((ph) => {
    ph?.capture(event, props);
  });
}

/** Привязать события к user_id. Вызывать после успешного login/signup. */
export function identify(userId: number | string, traits?: AnalyticsProps): void {
  if (!ENABLED) return;
  void getPosthog().then((ph) => {
    ph?.identify(String(userId), traits);
  });
}

/** Сбросить identify (на logout). */
export function resetAnalytics(): void {
  if (!ENABLED) return;
  void getPosthog().then((ph) => {
    ph?.reset();
  });
}
