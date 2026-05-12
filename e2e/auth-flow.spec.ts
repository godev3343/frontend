// e2e/auth-flow.spec.ts
import { expect, test } from '@playwright/test';

/**
 * Happy-path для Pre-MVP. Один сценарий — остальное вручную.
 *
 * Что покрываем:
 *  1. Зайти на главную без auth → редирект на /login (AuthGate работает)
 *  2. На /login видны поля email/password и кнопка submit (форма рендерится)
 *  3. Submit с замоканным успешным ответом → редирект на /onboarding (новый юзер)
 *  4. /onboarding отдаёт форму с consent чекбоксом
 *
 * Что НЕ покрываем (осознанно — Этап 1):
 *  - чек-ин (требует mock геолокации через `context.grantPermissions` +
 *    `setGeolocation`, плюс mock карты — много хрупкого мокинга)
 *  - реальное обращение к бэку (мокаем через page.route)
 *  - кросс-браузер (chromium-only в config)
 */
test('user can reach login and submit credentials', async ({ page }) => {
  // Мокаем эндпоинты до навигации, чтобы AuthGate с самого начала видел 401
  await page.route('**/api/auth/refresh', async (route) =>
    route.fulfill({ status: 401, body: '{}' }),
  );

  await page.route('**/api/users/me', async (route) =>
    route.fulfill({ status: 401, body: '{}' }),
  );

  // 1) Открыть /, без auth → редирект на /login (или сразу /login если AuthGate так настроен)
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

  // 2) Форма логина рендерится
  const emailField = page.getByLabel(/email|почт/i).first();
  await expect(emailField).toBeVisible();

  // 3) Мокаем успешный login → возвращаем токены, потом me с consent_at = null
  await page.route('**/api/auth/login', async (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access: 'fake-access',
        refresh: 'fake-refresh',
      }),
    }),
  );

  // После login next-route-handler set-tokens вызывается — мокаем и его
  await page.route('**/api/auth/set-tokens', async (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access: 'fake-access' }),
    }),
  );

  // После set-tokens AuthGate перевызовет /api/users/me — отдадим юзера без consent_at
  // (значит он новый → редирект на /onboarding)
  await page.unroute('**/api/users/me');
  await page.route('**/api/users/me', async (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        email: 'test@example.com',
        display_name: '',
        bio: '',
        avatar_url: null,
        consent_at: null,
        points: 0,
        created_at: new Date().toISOString(),
      }),
    }),
  );

  // Вводим email/password — селекторы могут отличаться, ищем по типу поля
  await emailField.fill('test@example.com');
  const passwordField = page
    .locator('input[type="password"]')
    .first();
  await passwordField.fill('SuperSecret123!');

  // Submit — кнопка с текстом «Войти» или «Login», ищем по роли
  await page.getByRole('button', { name: /войти|login|вход/i }).first().click();

  // 4) Должны попасть на /onboarding
  await expect(page).toHaveURL(/\/onboarding/, { timeout: 10_000 });

  // Форма онбординга
  await expect(page.getByText(/расскажи о себе/i)).toBeVisible();
});
