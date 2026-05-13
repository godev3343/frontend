# Integration patch: фронт ↔ бэк (EPIC 0-7)

## Цель

Привести API-вызовы фронта в соответствие с реальными эндпоинтами бэка
(EPIC 0-7 закрыты). До патча:

- Фронт зовёт пути БЕЗ trailing slash → Django делает 301 + теряет body.
- Фронт ждёт `id: string`, бэк отдаёт `id: int` → zod.parse падает.
- Фронт ждёт `consent_at`, бэк отдаёт `is_onboarded`.
- Фронт после register пытается записать токены — бэк их не отдаёт.
- Фронт зовёт `api/upload/{key}/status` — на бэке `/api/media/{asset_id}`.
- Фронт шлёт purpose=`place_photo`, бэк принимает `place`.
- Фронт шлёт `lat`/`lng` в чек-ине, бэк ждёт `latitude`/`longitude`.
- Фронт пытается зайти на `api/ai/recommend`, `api/users/me/points`,
  `api/events/{id}/rsvp` — этих эндпоинтов на бэке нет.

## Структура патча

| Файл                                                    | Назначение                                                                                                                                                            | Куда положить |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `src/lib/env.ts`                                        | Добавлены фича-флаги: AI, POINTS_HISTORY, RSVP                                                                                                                        | replace       |
| `src/features/auth/schemas.ts`                          | Новый userSchema под бэк (`is_onboarded`, `is_email_verified`, `friends_count`, `checkins_count`); registerResponseSchema; googleAuthResponseSchema                   | replace       |
| `src/features/auth/api.ts`                              | register без токенов; consent шлётся в onboarding; logout через Next route                                                                                            | replace       |
| `src/features/auth/auth-gate.tsx`                       | `me.consent_at` → `me.is_onboarded` для PostHog identify                                                                                                              | replace       |
| `src/features/map/schemas.ts`                           | Нормализация id (int→str), lat/lng → location, category_slug → category, hours_json → hours, vibes[].tag → vibes[].vibe; placesPageSchema принимает массив            | replace       |
| `src/features/map/api.ts`                               | Trailing slash на places; ?vibe (single) вместо ?vibes                                                                                                                | replace       |
| `src/features/checkins/schemas.ts`                      | user → author, public_name → display_name, checkinPlaceMiniSchema; createCheckinSchema.transform: lat/lng → latitude/longitude, place_id (str→int)                    | replace       |
| `src/features/checkins/api.ts`                          | Trailing slash; удалён fetchPlaceCheckins (на бэке нет)                                                                                                               | replace       |
| `src/features/events/schemas.ts`                        | category/vibes/price/attendees_count/user_rsvp/organizer — optional с дефолтами (бэк их не отдаёт в pre-MVP)                                                          | replace       |
| `src/features/events/api.ts`                            | Trailing slash; setRsvp/clearRsvp кидают RsvpNotAvailable если флаг выключен; `from`/`to` вместо `date_from`/`date_to`                                                | replace       |
| `src/features/friends/schemas.ts`                       | Три отдельных трансформа: incomingRequest, outgoingRequest, friendListItem → единый Friendship тип; public_name → display_name                                        | replace       |
| `src/features/friends/api.ts`                           | Корректные сериализаторы по эндпоинтам; sendFriendRequest/accept возвращают синтетический Friendship из shape {id, status} бэка; offset вместо cursor для LimitOffset | replace       |
| `src/features/media/schemas.ts`                         | asset_id, expires_in (не expires_at); purpose=place (не place_photo); HEIC/HEIF; MediaAssetSerializer shape                                                           | replace       |
| `src/features/media/api.ts`                             | confirm по asset_id, status через /api/media/{id}                                                                                                                     | replace       |
| `src/features/media/use-image-upload.ts`                | Полный rewrite под asset_id + новый MediaAsset shape                                                                                                                  | replace       |
| `src/features/media/r2-upload.ts`                       | Убран multipart fallback (бэк его не отдаёт) — чистый PUT                                                                                                             | replace       |
| `src/features/media/query-keys.ts`                      | Ключ poll-а — asset_id (как string в query key)                                                                                                                       | replace       |
| `src/app/(auth)/register/page.tsx`                      | Убран setAccessToken после register                                                                                                                                   | replace       |
| `src/app/(app)/onboarding/page.tsx`                     | `me.consent_at` → `me.is_onboarded`                                                                                                                                   | replace       |
| `src/app/(app)/profile/page.tsx`                        | friends_count/checkins_count из me; History-линк за флагом                                                                                                            | replace       |
| `src/features/ai/components/ai-fab-gated.tsx`           | Обёртка над AiFab с фича-флагом                                                                                                                                       | new           |
| `src/features/ai/components/ai-nav-button-gated.tsx`    | Обёртка над AiNavButton                                                                                                                                               | new           |
| `src/features/events/components/rsvp-buttons-gated.tsx` | Обёртка над RsvpButtons                                                                                                                                               | new           |
| `.env.example`                                          | Добавлены фича-флаги                                                                                                                                                  | replace       |

## Ручные правки которые tar.gz НЕ делает

После применения архива нужно **руками** подменить два импорта (это
по одной строке в каждом файле — не стал тащить в tar.gz, чтобы не
переписывать весь компонент):

### 1. `src/features/map/components/city-map.tsx`

```diff
-import { AiFab } from "@/features/ai/components/ai-fab";
+import { AiFabGated as AiFab } from "@/features/ai/components/ai-fab-gated";
```

### 2. `src/components/layout/bottom-nav.tsx`

```diff
-import { AiNavButton } from '@/features/ai/components/ai-nav-button';
+import { AiNavButtonGated as AiNavButton } from '@/features/ai/components/ai-nav-button-gated';
```

### 3. `src/features/events/components/event-detail-view.tsx`

```diff
-import { RsvpButtons } from "./rsvp-buttons";
+import { RsvpButtonsGated as RsvpButtons } from "./rsvp-buttons-gated";
```

Alias-импорты — UI код использует `<AiFab />` / `<RsvpButtons />` как и раньше,
работает прозрачно.

## .env.local изменения

Добавь в свой `.env.local`:

```env
NEXT_PUBLIC_FEATURE_AI=false
NEXT_PUBLIC_FEATURE_POINTS_HISTORY=false
NEXT_PUBLIC_FEATURE_RSVP=false
```

Когда бэк EPIC 8/9 выкатится — флипаешь соответствующий флаг и фича
появляется без передеплоя кода.

## Что НЕ исправлено и почему

1. **drf-spectacular на бэке отдаёт пустые responses в openapi.yaml** —
   зависит от `@extend_schema(responses=...)` на каждом view бэка. Не
   блокер для pre-MVP: фронт работает с написанными вручную zod-схемами,
   `openapi-typescript` сейчас бесполезен. Допиливать — после демо.

2. **R2 CORS** — это конфиг bucket-а в Cloudflare dashboard, не код.
   Если `uploadToR2` выдаст `R2UploadError: network error` — нужно
   разрешить `PUT` + `Content-Type` для `localhost:3000` (dev) и
   `<домен фронта>` (prod) в правилах CORS R2.

3. **`points_delta` в чек-ине не отдаётся бэком** — `use-create-checkin`
   корректно обрабатывает undefined (просто не показывает toast о поинтах).
   Это деградация UX, не блокер. Когда бэк добавит — заработает.

4. **`recent_checkins` в карточке места** — бэк отдаёт, фронт пока не
   использует. Добавим в следующей итерации, когда понадобится UI.

## Подводные камни проверки

После применения и `pnpm typecheck`:

- Если упадёт на `src/features/checkins/components/checkin-card.tsx` или
  `feed-item.tsx` с ошибкой «`checkin.place.primary_vibe` отсутствует» —
  это значит UI использует поле, которого в `checkinPlaceMiniSchema` нет.
  Чек-ин-карточка использует только `place.id` и `place.name` (мы это
  проверили в Z6) — но если что-то изменилось, добавь поле в transform-блок
  `checkinPlaceMiniSchema`.

- Если упадёт `src/features/checkins/hooks/use-create-checkin.ts` на
  типе `CreateCheckinInput` — там используется input-тип (lat/lng), не
  output (latitude/longitude). Если хук ждёт output — поменяй импорт
  на `CreateCheckinPayload` (новый exported type).

- Если упадёт где-то на `points_delta` в `useCreateCheckin.onSuccess` —
  ничего страшного, оно `optional` в схеме. Если ругается «possibly undefined»
  — уже в текущем коде есть `typeof delta === "number"` guard.

## E2E sanity check после применения

```bash
# 0. Применили патч
pnpm typecheck   # должен пройти
pnpm lint        # 2 warnings (как было до патча) — норм
pnpm test        # если тесты ругаются на новый shape — это норм, обнови мок-данные
pnpm build       # должен собраться

# 1. Поднимаем оба сервиса
# Бэк: docker compose up + python manage.py runserver
# Фронт: pnpm dev

# 2. Smoke-флоу:
# - /register → ввести email/password/имя → POST 201 /api/auth/register → редирект на /verify-email
# - На почту приходит код (если SMTP настроен) → ввести 6 цифр → POST 200 /api/auth/email/verify/confirm → редирект на /login (или /onboarding если автологин включён)
# - /login → войти → POST 200 /api/auth/login → cookie ставится → редирект на /
# - /onboarding (если ещё не онбординулся) → заполнить → POST 200 /api/users/me/onboarding → /
# - Карта рендерится → маркеры приходят из GET 200 /api/places/?bbox=...
# - Клик на маркер → GET 200 /api/places/{id}/ → карточка
# - /friends → GET 200 /api/friends, /api/friends/requests/incoming, .../outgoing
# - /events → GET 200 /api/events/?from=...&to=...
# - Логаут → cookie чистится
```
