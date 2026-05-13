// src/lib/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from "zod/v4";

/**
 * Фича-флаги для эндпоинтов которые на бэке ещё не реализованы:
 *   - AI: POST /api/ai/recommend (бэк EPIC 8)
 *   - POINTS_HISTORY: GET /api/users/me/points (бэк EPIC 9)
 *   - RSVP: POST/DELETE /api/events/{id}/rsvp (Этап 1, не pre-MVP)
 *
 * Дефолт всех — false. Когда бэк выкатит — флипаешь в .env.local:
 *   NEXT_PUBLIC_FEATURE_AI=true
 *   NEXT_PUBLIC_FEATURE_POINTS_HISTORY=true
 *
 * NB: zod v4 — .default() ПОСЛЕ .transform() принимает уже трансформированный
 * тип (boolean), а не исходный (string). До трансформа дефолт надо ставить
 * на самом union — но удобнее держать здесь, так yаsне видно намерение.
 */
const boolFromEnv = z
  .union([z.literal('true'), z.literal('false'), z.literal('1'), z.literal('0'), z.literal('')])
  .transform((v) => v === 'true' || v === '1')
  .default(false);

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_MAP_STYLE_URL: z.string().url(),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
    NEXT_PUBLIC_FEATURE_AI: boolFromEnv,
    NEXT_PUBLIC_FEATURE_POINTS_HISTORY: boolFromEnv,
    NEXT_PUBLIC_FEATURE_RSVP: boolFromEnv,
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MAP_STYLE_URL: process.env.NEXT_PUBLIC_MAP_STYLE_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_FEATURE_AI: process.env.NEXT_PUBLIC_FEATURE_AI,
    NEXT_PUBLIC_FEATURE_POINTS_HISTORY: process.env.NEXT_PUBLIC_FEATURE_POINTS_HISTORY,
    NEXT_PUBLIC_FEATURE_RSVP: process.env.NEXT_PUBLIC_FEATURE_RSVP,
  },
  emptyStringAsUndefined: true,
});
