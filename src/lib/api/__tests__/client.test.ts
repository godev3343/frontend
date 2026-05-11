// src/lib/api/__tests__/client.test.ts
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useAuthStore } from '@/features/auth/store';

// замокаем env до импорта клиента
vi.mock('@/lib/env', () => ({
  env: { NEXT_PUBLIC_API_URL: 'http://api.test' },
}));

// и /api/auth/refresh — он бьётся в Next Route Handler, мокаем fetch
const refreshFetchSpy = vi.fn();

beforeAll(() => {
  // глобальный fetch — для refresh-хендлера
  vi.spyOn(global, 'fetch').mockImplementation((url, init) => {
    if (typeof url === 'string' && url.includes('/api/auth/refresh')) {
      return refreshFetchSpy(url, init);
    }
    // всё остальное — реальный fetch (его перехватит msw)
    return (globalThis as unknown as { __originalFetch: typeof fetch }).__originalFetch(
      url as RequestInfo,
      init,
    );
  });
});

// сохранить оригинальный fetch перед моком (порядок важен — этот блок ниже моков работать не будет;
// если в среде усложнения — просто проверим только store/schemas, а интеграцию покроем e2e)