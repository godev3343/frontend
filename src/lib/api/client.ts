// src/lib/api/client.ts
import ky, { type HTTPError, type KyResponse } from 'ky';
import { ZodError } from 'zod/v4';

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

/**
 * Формат ошибок API (apps/core/exception_handler.py):
 *   { detail: string, code: string, errors?: { [field]: string[] | string } }
 *
 * errors появляется при ValidationError — там detail = "Validation error",
 * а полезная инфа лежит в errors[field][]. Без вытаскивания errors юзер
 * видит безликое "Validation error" / "HTTP 400" — это плохой UX.
 *
 * extractError также различает три класса ошибок:
 *   - HTTPError (ky)        — бэк ответил с не-2xx статусом → парсим body
 *   - ZodError              — бэк ответил 2xx, но schema.parse упал →
 *                              значит наш контракт расходится с реальностью
 *                              бэка. Это БАГ ФРОНТА, не сетевая проблема.
 *   - всё остальное          — реальный сетевой сбой, timeout, CORS, и т.д.
 *
 * Раньше всё, что не HTTPError, помечалось как "Сетевая ошибка" — это
 * скрывало ZodError'ы и юзер видел "Сетевая ошибка" хотя бэк ответил 200.
 */
export interface ExtractedError {
  detail: string;
  code?: string;
  status: number;
  errors?: Record<string, string[] | string>;
}

/** Маппинг snake_case field-names бэка → русские лейблы для UI. */
const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  password: 'Пароль',
  first_name: 'Имя',
  last_name: 'Фамилия',
  display_name: 'Имя в приложении',
  bio: 'О себе',
  code: 'Код',
  token: 'Ссылка',
  consent: 'Согласие',
  to_user_id: 'Пользователь',
  place_id: 'Место',
  latitude: 'Координаты',
  longitude: 'Координаты',
  comment: 'Комментарий',
  photo_key: 'Фото',
  content_type: 'Тип файла',
  content_length: 'Размер файла',
  purpose: 'Назначение',
  asset_id: 'Файл',
  q: 'Поиск',
  id_token: 'Google токен',
  refresh: 'Сессия',
  // non_field_errors — DRF-конвенция для общих ошибок без поля
  non_field_errors: '',
};

function formatErrors(errors: Record<string, string[] | string>): string {
  const parts: string[] = [];

  for (const [field, messages] of Object.entries(errors)) {
    const label = FIELD_LABELS[field] ?? field;
    const msgArray = Array.isArray(messages) ? messages : [messages];
    const text = msgArray.join('. ');
    parts.push(label ? `${label}: ${text}` : text);
  }

  return parts.join('; ');
}

/** Утилита: распаковать ошибку из ky/zod/etc */
export async function extractError(err: unknown): Promise<ExtractedError> {
  // 1. ZodError — наш контракт не совпал с реальным ответом бэка.
  // Это баг фронта: либо бэк изменил формат, либо мы что-то не учли.
  // Показываем человеку нейтральное сообщение, а в console — детали для девелопера.
  if (err instanceof ZodError) {
     
    console.error('[extractError] ZodError — schema vs API mismatch:', err.issues);
    const firstIssue = err.issues[0];
    const path = firstIssue?.path?.join('.') ?? 'response';
    return {
      detail: `Не удалось разобрать ответ сервера (${path})`,
      code: 'schema_mismatch',
      status: 200,
    };
  }

  // 2. HTTPError от ky — бэк ответил не-2xx.
  if (err && typeof err === 'object' && 'response' in err) {
    const httpErr = err as HTTPError;
    try {
      const body = (await httpErr.response.clone().json()) as {
        detail?: string;
        code?: string;
        errors?: Record<string, string[] | string>;
      };

      // Если есть errors — строим человеческое сообщение из них.
      // Это перебивает безликое "Validation error" в detail.
      let displayDetail = body.detail ?? `HTTP ${httpErr.response.status}`;
      if (body.errors && Object.keys(body.errors).length > 0) {
        displayDetail = formatErrors(body.errors);
      }

      return {
        detail: displayDetail,
        code: body.code,
        status: httpErr.response.status,
        errors: body.errors,
      };
    } catch {
      return {
        detail: `HTTP ${httpErr.response.status}`,
        status: httpErr.response.status,
      };
    }
  }

  // 3. Всё остальное — реальная сеть/timeout/CORS/AbortError/etc.
   
  console.error('[extractError] non-HTTP, non-Zod error:', err);
  return { detail: 'Сетевая ошибка', status: 0 };
}
