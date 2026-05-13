// src/features/auth/onboarding-gate.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useMe } from "./hooks";

/**
 * Гард для маршрутов внутри (app)/.
 *
 * Семантика:
 *   - Если юзер реально не залогинен (нет токена + нет refresh-cookie) →
 *     редирект на /login. Это уже делает большинство страниц (см. profile/page.tsx),
 *     но дублируем здесь как защиту "глубокой ссылки": если кто-то открыл
 *     /friends прямо из URL, страница успеет смонтироваться, useMe()
 *     ещё не вернёт ничего, а гард не даст увидеть пустой UI.
 *
 *   - Если юзер залогинен, но НЕ онбордился (consent + display_name не заполнены)
 *     → редирект на /onboarding.
 *
 * Почему именно client-component, не middleware:
 *   - AuthGate (на уровне корневого layout) делает refresh через httpOnly
 *     cookie на клиенте. SSR-middleware не видит accessToken (он только в
 *     zustand memory), поэтому в middleware гарантированно нельзя проверить
 *     is_onboarded.
 *   - middleware пришлось бы дополнительно дёргать /api/users/me, что
 *     удвоило бы трафик. На клиенте useMe() уже даёт нам это бесплатно.
 *
 * Возможный flash:
 *   В первый момент рендера, пока useMe() в полёте, дети уже смонтированы.
 *   Это ок для большинства страниц — они сами показывают skeleton при
 *   me === undefined. Если нужен жёсткий гард — раскомментируй блок ниже,
 *   но это даёт лишний spinner после каждой навигации.
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: me, isUnauthenticated } = useMe();

  useEffect(() => {
    // 1) Нет сессии — на логин.
    if (isUnauthenticated) {
      // не редиректим если уже на auth-страницах — но (app)/ их и не содержит.
      router.replace("/login");
      return;
    }
    // 2) Есть сессия, но не онбордился — на /onboarding.
    //    Исключаем сам /onboarding чтобы не зациклить.
    if (me && !me.is_onboarded && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [me, isUnauthenticated, pathname, router]);

  // Опционально: блокировать рендер до решения. Сейчас не блокируем,
  // пусть страницы сами решают свой loading-state.
  return <>{children}</>;
}
