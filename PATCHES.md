# Epic 10 — патчи существующих файлов

Файлы которые я **не могу полностью переписать** (не вижу содержимого) — здесь даны **минимальные диффы**: показан контекст и что добавить. Применяй вручную, по строчке.

После применения всех патчей пайплайн должен пройти.

---

## 1. `src/features/auth/auth-gate.tsx` — добавить PostHog identify после загрузки `me`

**Зачем:** связываем events с user_id для аналитики.

**Где вставлять:** там где `useMe()` возвращает `data` (или после успешного refresh). Если AuthGate просто чекает auth и не использует `useMe` напрямую — добавь useEffect внутри компонента.

```tsx
// src/features/auth/auth-gate.tsx
// ── добавь импорт сверху:
import { identify, resetAnalytics } from '@/lib/analytics';
import { useMe } from '@/features/auth/hooks'; // если ещё не импортирован

// ── внутри компонента AuthGate (или эквивалент):
const { data: me } = useMe();

useEffect(() => {
  if (me?.id) {
    identify(me.id, {
      // не шлём email — PII; шлём только то что нужно для сегментации
      has_consent: Boolean(me.consent_at),
    });
  }
}, [me?.id, me?.consent_at]);
```

Если в AuthGate уже есть logout-хэндлер — добавь в него `resetAnalytics()`.

---

## 2. `src/app/(app)/onboarding/page.tsx` — capture `signup_completed`

**Где:** в `onSubmit` после успешного `submitOnboarding`, перед `router.replace('/')`.

```tsx
// src/app/(app)/onboarding/page.tsx
// ── добавь импорт:
import { track } from '@/lib/analytics';

// ── внутри onSubmit:
async function onSubmit(values: z.output<typeof onboardingSchema>) {
  setSubmitting(true);
  try {
    const user = await submitOnboarding(values);
    queryClient.setQueryData(ME_QUERY_KEY, user);
    track('signup_completed'); // ← добавь
    router.replace('/');
  } catch (err) {
    const e = await extractError(err);
    toast.error(e.detail);
  } finally {
    setSubmitting(false);
  }
}
```

---

## 3. `src/features/checkins/hooks/use-create-checkin.ts` — capture `checkin_created`

**Где:** в `onSuccess`, прямо после `toast.success` веток (или до них — порядок не критичен).

```ts
// src/features/checkins/hooks/use-create-checkin.ts
// ── добавь импорт:
import { track } from '@/lib/analytics';

// ── внутри onSuccess, после блока с toast:
onSuccess: (checkin) => {
  const delta = checkin.points_delta;
  if (typeof delta === "number" && delta > 0) {
    if (delta >= 15) {
      toast.success(`+${delta} поинтов — бонус!`, {
        description: "Первый в этом месте или с фото",
      });
    } else {
      toast.success(`+${delta} поинтов`);
    }
  }

  track('checkin_created', {                     // ← добавь
    place_id: checkin.place.id,
    has_photos: (checkin.photos?.length ?? 0) > 0,
    points_delta: delta ?? 0,
  });

  // ... остальные invalidateQueries без изменений
},
```

---

## 4. `src/features/friends/hooks.ts` — capture `friend_request_sent`

**Где:** в `useSendFriendRequest`, в `onSuccess` ПОСЛЕ `toast.success("Заявка отправлена")`.

```ts
// src/features/friends/hooks.ts
// ── добавь импорт сверху:
import { track } from '@/lib/analytics';

// ── в useSendFriendRequest, onSuccess:
onSuccess: (friendship, toUserId) => {
  setProfileStatus(qc, toUserId, {
    friendship_status: "outgoing",
    friendship_id: friendship.id,
  });
  qc.invalidateQueries({ queryKey: friendsKeys.outgoing() });
  toast.success("Заявка отправлена");
  track('friend_request_sent', { to_user_id: toUserId });  // ← добавь
},
```

---

## 5. `src/features/ai/hooks/use-ai-recommend.ts` — заменить прямой posthog на `track()`

**Зачем:** единообразие, type-safe события.

**Текущий код (по разведке):**

```ts
import posthog from 'posthog-js';
// ...
posthog.capture?.('ai_query_sent', { query_len: query.length });
```

**Заменить на:**

```ts
import { track } from '@/lib/analytics';
// ...
track('ai_query_sent', { query_len: query.length });
```

И удалить `import posthog from "posthog-js"` если он больше нигде не используется в файле.

---

## 6. `src/features/points/components/points-history-list.tsx` — то же самое

**Текущий код:**

```ts
void import('posthog-js').then(({ default: posthog }) => {
  posthog.capture?.('points_history_viewed');
});
```

**Заменить на:**

```ts
import { track } from '@/lib/analytics';
// ...
track('points_history_viewed');
```

Убрать `void import("posthog-js")`.

---

## 7. `src/features/auth/logout-button.tsx` — `resetAnalytics()` на logout

```tsx
// src/features/auth/logout-button.tsx
// ── добавь импорт:
import { resetAnalytics } from '@/lib/analytics';

// ── в handle(), в finally блоке после clearAuth() и queryClient.clear():
async function handle() {
  setLoading(true);
  try {
    await logout();
  } finally {
    clearAuth();
    queryClient.clear();
    resetAnalytics(); // ← добавь
    router.replace('/login');
  }
}
```

---

## 8. `src/app/(app)/feed/page.tsx` — generateMetadata уже есть, ничего не делаем

Файл уже содержит `export const metadata = { title: "Лента" }` — на этом достаточно.

---

## 9. Проверь что `tsconfig.json` подхватывает `query-meta.d.ts`

Файл `src/lib/api/query-meta.d.ts` должен попасть в `include` через `**/*.ts` — он уже там по дефолту. После распаковки tar.gz просто запусти `pnpm typecheck` — если ругается на `mutationMeta`, проверь что файл на месте.

---

## Готово?

После всех правок:

```bash
pnpm lint --fix
pnpm typecheck
pnpm test
pnpm build
```

Если build падает на opengraph-image — проверь что Next 16 поддерживает edge runtime (должен). При проблемах с шрифтами — отдельный fix.

Playwright запускается отдельно (после установки):

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
pnpm exec playwright test
```
