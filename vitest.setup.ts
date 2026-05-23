// vitest.setup.ts
import '@testing-library/jest-dom/vitest';

import { vi } from 'vitest';

/**
 * Мокаем @/lib/env до того, как любой импорт (analytics, api-клиент и т.п.)
 * подтянет t3-env. В тестах нет .env loader → валидация падает на пустых
 * NEXT_PUBLIC_API_URL/MAP_STYLE_URL/GOOGLE_CLIENT_ID.
 *
 * Значения подобраны так, чтобы:
 *   - URL-валидация проходила (нужны валидные URL, не "")
 *   - PostHog/Sentry были undefined → analytics стартует в no-op режиме
 *   - все feature-флаги выключены (если тест проверяет фичу — он сам перемокает)
 */
vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_API_URL: 'http://localhost:8000',
    NEXT_PUBLIC_MAP_STYLE_URL: 'http://localhost:8000/style.json',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'test-google-client-id',
    NEXT_PUBLIC_SENTRY_DSN: undefined,
    NEXT_PUBLIC_POSTHOG_KEY: undefined,
    NEXT_PUBLIC_POSTHOG_HOST: undefined,
    NEXT_PUBLIC_FEATURE_AI: false,
    NEXT_PUBLIC_FEATURE_POINTS_HISTORY: false,
    NEXT_PUBLIC_FEATURE_RSVP: false,
  },
}));
