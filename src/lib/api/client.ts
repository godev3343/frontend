// src/lib/api/client.ts
import ky, { type HTTPError, type KyResponse } from 'ky';

import { useAuthStore } from '@/features/auth/store';
import { env } from '@/lib/env';

/** Single-flight: пока один запрос обновляет токен, остальные ждут его промис. */
let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { access: string };
      useAuthStore.getState().setAccessToken(data.access);
      return data.access;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export const apiClient = ky.create({
  prefix: env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  retry: { limit: 1, methods: ['get'] },
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const token = useAuthStore.getState().accessToken;
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
      },
    ],
    afterResponse: [
      async ({ request, response }): Promise<KyResponse | undefined> => {
        if (response.status !== 401) return response;

        // защита от бесконечной петли: если это сам refresh упал — не ретраим
        if (request.url.includes('/api/auth/refresh')) return response;

        // защита от ретрая ретрая — кастомный заголовок
        if (request.headers.get('x-retry') === '1') return response;

        const newAccess = await performRefresh();
        if (!newAccess) {
          useAuthStore.getState().clear();
          return response;
        }

        // ретраим оригинальный запрос с новым токеном
        request.headers.set('Authorization', `Bearer ${newAccess}`);
        request.headers.set('x-retry', '1');
        return ky(request);
      },
    ],
  },
});

/** Утилита: распаковать DRF-ошибку из HTTPError */
export async function extractError(err: unknown): Promise<{
  detail: string;
  code?: string;
  status: number;
}> {
  if (err && typeof err === 'object' && 'response' in err) {
    const httpErr = err as HTTPError;
    try {
      const body = (await httpErr.response.clone().json()) as {
        detail?: string;
        code?: string;
      };
      return {
        detail: body.detail ?? `HTTP ${httpErr.response.status}`,
        code: body.code,
        status: httpErr.response.status,
      };
    } catch {
      return {
        detail: `HTTP ${httpErr.response.status}`,
        status: httpErr.response.status,
      };
    }
  }
  return { detail: 'Сетевая ошибка', status: 0 };
}