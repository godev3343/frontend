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
  // Все моки ставим ДО первой навигации, чтобы не было race с монтированием AuthGate.
  // /me — переключаемый: до логина 401, после — юзер без онбординга.
  let loggedIn = false;

  await page.route('**/api/auth/refresh', async (route) =>
    route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
  );

  await page.route('**/api/users/me', async (route) => {
    if (!loggedIn) {
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: '{}',
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        email: 'test@example.com',
        display_name: '',
        bio: '',
        avatar_url: null,
        is_onboarded: false, // OnboardingGate смотрит сюда — без этого поля гард не сработает
        consent_at: null,
        points: 0,
        created_at: new Date().toISOString(),
      }),
    });
  });

  await page.route('**/api/auth/login', async (route) => {
    loggedIn = true; // следующий /me уже отдаст залогиненного юзера без онбординга
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access: 'fake-access',
        refresh: 'fake-refresh',
      }),
    });
  });

  // /api/auth/set-tokens — Next route handler, который кладёт refresh в httpOnly cookie
  // и возвращает access. На бэк он стучится изнутри Node, page.route его не перехватит,
  // если запрос идёт сервер-сайд. Но в нашем случае persistTokens() вызывается с клиента,
  // так что мок сработает.
 await page.route('**/api/auth/set-tokens', async (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: {
      'Set-Cookie': 'refresh_token=fake-refresh; Path=/; HttpOnly; SameSite=Lax',
    },
    body: JSON.stringify({ access: 'fake-access' }),
  }),
);



  // 1) Открыть /, без auth → редирект на /login
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

  // 2) Форма логина рендерится
  const emailField = page.getByLabel(/email|почт/i).first();
  await expect(emailField).toBeVisible();

  await emailField.fill('test@example.com');
  await page.locator('input[type="password"]').first().fill('SuperSecret123!');

  // 3) Сабмит. Ждём что login и set-tokens реально отстрелили,
  //    чтобы URL-проверка дальше не гонялась с зависшим запросом.
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/api/auth/login') && r.ok(),
      { timeout: 10_000 },
    ),
    page.waitForResponse(
      (r) => r.url().includes('/api/auth/set-tokens') && r.ok(),
      { timeout: 10_000 },
    ),
    page.getByRole('button', { name: /войти|login|вход/i }).first().click(),
  ]);

  await page.context().addCookies([{
  name: 'refresh_token',
  value: 'fake-refresh',
  domain: 'localhost',
  path: '/',
  httpOnly: true,
  sameSite: 'Lax',
}]);

  // 4) router.replace('/') → попадаем в (app)/, OnboardingGate видит
  //    is_onboarded: false → редирект на /onboarding
  await expect(page).toHaveURL(/\/onboarding/, { timeout: 10_000 });

  // Форма онбординга
  await expect(page.getByText(/расскажи о себе/i)).toBeVisible();
});