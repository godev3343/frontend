// src/app/(app)/layout.tsx
import { AppShell } from "@/components/layout/app-shell";
import { OnboardingGate } from "@/features/auth/onboarding-gate";

/**
 * Маршрут-группа (app) — всё что доступно после авторизации.
 *
 * AppShell остаётся серверным компонентом — обёртка OnboardingGate
 * сама "use client". Так не размываем границы и проще тестировать гард
 * в изоляции.
 *
 * Гард делает два дела:
 *   1) Редиректит на /login если нет сессии.
 *   2) Редиректит на /onboarding если юзер залогинен, но не онбордился —
 *      раньше после Google OAuth юзер попадал сразу на главную и
 *      получал пустой профиль (display_name пустой, consent_at не выставлен).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingGate>
      <AppShell>{children}</AppShell>
    </OnboardingGate>
  );
}
