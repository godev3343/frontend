# Epic 8 — AI «Куда пойти?»

## Состав

### Новые файлы (фича `src/features/ai/`)

- `schemas.ts` — Zod-схемы request/response + ChatMessage type
- `api.ts` — `requestRecommendations(query)`, timeout 30s, retry 0
- `query-keys.ts` — ключи (на будущее, если потащим в кэш)
- `lib/suggestions.ts` — массив подсказок-чипов
- `hooks/use-ai-recommend.ts` — useMutation + маппинг 429/502/timeout + PostHog
- `components/suggestion-chips.tsx` — чипы пустого состояния
- `components/ai-chat-input.tsx` — textarea-autosize, Enter/Shift+Enter
- `components/recommendation-card.tsx` — карточка с lazy place via `usePlaceDetail`, прячется на 404 + Sentry
- `components/ai-chat-sheet.tsx` — корневой Sheet (history в local state, теряется при reload — по ТЗ)
- `components/ai-fab.tsx` — FAB для карты
- `components/ai-nav-button.tsx` — пункт в bottom-nav
- `__tests__/schemas.test.ts` — 11 кейсов на zod

### Патчи существующих файлов

- `src/components/layout/bottom-nav.tsx` — добавлен пункт AI между Лента и Афиша, `grid-cols-5` → `grid-cols-6`
- `src/features/map/components/city-map.tsx` — добавлен `<AiFab />` над Crosshair-кнопкой; добавлен `useEffect` синк `selectedId` ← `searchParams.get('placeId')`, чтобы `router.push('/?placeId=X')` с той же страницы открывал PlaceSheet

## Применение

```bash
# 1. Распаковать в корень проекта (поверх существующих файлов)
cd /path/to/reality-map-web
tar -xzvf epic8.tar.gz

# 2. Поставить новую зависимость
pnpm add react-textarea-autosize

# 3. Прогнать пайплайн
pnpm lint --fix && pnpm typecheck && pnpm test && pnpm build
```

## Зависимости

- `react-textarea-autosize` — новая (autosize textarea с min/maxRows)
- `@sentry/nextjs` — уже есть в проекте, импортируется как `import * as Sentry from "@sentry/nextjs"`
- `posthog-js` — уже есть, используется через `posthog.capture?.()` (safe-call если ключ не настроен)
- `lucide-react`, `react-hook-form`, `@tanstack/react-query`, `ky`, `zod`, `sonner` — все уже есть

## Подводные камни — на что смотреть в первую очередь

1. **`Sheet side="bottom" sm:side-right`** — твоя же конвенция из `place-sheet.tsx`. Не менял.
2. **`vibeSchema` импортируется из `@/features/map/schemas`** — единый источник правды для вайбов.
3. **`Sentry.captureMessage` в recommendation-card** — если у вас Sentry init нет в dev, импорт не упадёт (модуль no-op), но если хотите — можно обернуть в `if (env.NEXT_PUBLIC_SENTRY_DSN)`. Сейчас оставил как есть — короче.
4. **PostHog `capture?.()`** — optional call: если posthog не инициализирован (ключа нет), не падаем.
5. **history чата** — local `useState` в `AiChatSheet`. Если Sheet закрыли — state сохранён, при следующем открытии чат всё ещё там. Если refresh — теряется. Это требование 8.5.
6. **Tests**: один файл `schemas.test.ts`. Можно добавить тесты на маппинг ошибок (`use-ai-recommend`), но они требуют моков ky — оставлю под отдельный PR если нужно.

## Что НЕ сделано осознанно

- **Zustand store для чата** — оверкилл, теряется при reload по ТЗ, локального state достаточно
- **OpenAPI кодген для `/api/ai/recommend`** — в проекте `src/lib/api/generated/` пустой, фича использует рукописные Zod (как events). Не вводим новый паттерн ради одной фичи
- **Отдельный route `/ai`** — Sheet поверх любой страницы, как в декомпозиции 8.1
- **Streaming response** — Sonnet через DRF проще делать non-streaming; на Этапе 0 ожидание 5–15с покрывается loader-ом
