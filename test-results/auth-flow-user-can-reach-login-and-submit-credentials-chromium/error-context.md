# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-flow.spec.ts >> user can reach login and submit credentials
- Location: e2e/auth-flow.spec.ts:19:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/onboarding/
Received string:  "http://localhost:3000/login?next=%2F"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    23 × unexpected value "http://localhost:3000/login?next=%2F"

```

```yaml
- main:
    - heading "Вход в Go" [level=1]
    - paragraph: Оживи свой город — войди, чтобы увидеть карту вайбов
    - button "Вход через аккаунт Google. Откроется в новой вкладке.":
        - img
        - text: Вход через аккаунт Google
    - iframe
    - text: или Email
    - textbox "Email": test@example.com
    - text: Пароль
    - link "Забыли?":
        - /url: /forgot-password
    - textbox "Пароль": SuperSecret123!
    - button "Войти"
    - paragraph:
        - text: Нет аккаунта?
        - link "Зарегистрироваться":
            - /url: /register
- region "Notifications alt+T"
- button "Open Tanstack query devtools":
    - img
- alert
```

# Test source

```ts
  1  | // e2e/auth-flow.spec.ts
  2  | import { expect, test } from '@playwright/test';
  3  |
  4  | /**
  5  |  * Happy-path для Pre-MVP. Один сценарий — остальное вручную.
  6  |  *
  7  |  * Что покрываем:
  8  |  *  1. Зайти на главную без auth → редирект на /login (AuthGate работает)
  9  |  *  2. На /login видны поля email/password и кнопка submit (форма рендерится)
  10 |  *  3. Submit с замоканным успешным ответом → редирект на /onboarding (новый юзер)
  11 |  *  4. /onboarding отдаёт форму с consent чекбоксом
  12 |  *
  13 |  * Что НЕ покрываем (осознанно — Этап 1):
  14 |  *  - чек-ин (требует mock геолокации через `context.grantPermissions` +
  15 |  *    `setGeolocation`, плюс mock карты — много хрупкого мокинга)
  16 |  *  - реальное обращение к бэку (мокаем через page.route)
  17 |  *  - кросс-браузер (chromium-only в config)
  18 |  */
  19 | test('user can reach login and submit credentials', async ({ page }) => {
  20 |   // Мокаем эндпоинты до навигации, чтобы AuthGate с самого начала видел 401
  21 |   await page.route('**/api/auth/refresh', async (route) =>
  22 |     route.fulfill({ status: 401, body: '{}' }),
  23 |   );
  24 |
  25 |   await page.route('**/api/users/me', async (route) =>
  26 |     route.fulfill({ status: 401, body: '{}' }),
  27 |   );
  28 |
  29 |   // 1) Открыть /, без auth → редирект на /login (или сразу /login если AuthGate так настроен)
  30 |   await page.goto('/');
  31 |   await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  32 |
  33 |   // 2) Форма логина рендерится
  34 |   const emailField = page.getByLabel(/email|почт/i).first();
  35 |   await expect(emailField).toBeVisible();
  36 |
  37 |   // 3) Мокаем успешный login → возвращаем токены, потом me с consent_at = null
  38 |   await page.route('**/api/auth/login', async (route) =>
  39 |     route.fulfill({
  40 |       status: 200,
  41 |       contentType: 'application/json',
  42 |       body: JSON.stringify({
  43 |         access: 'fake-access',
  44 |         refresh: 'fake-refresh',
  45 |       }),
  46 |     }),
  47 |   );
  48 |
  49 |   // После login next-route-handler set-tokens вызывается — мокаем и его
  50 |   await page.route('**/api/auth/set-tokens', async (route) =>
  51 |     route.fulfill({
  52 |       status: 200,
  53 |       contentType: 'application/json',
  54 |       body: JSON.stringify({ access: 'fake-access' }),
  55 |     }),
  56 |   );
  57 |
  58 |   // После set-tokens AuthGate перевызовет /api/users/me — отдадим юзера без consent_at
  59 |   // (значит он новый → редирект на /onboarding)
  60 |   await page.unroute('**/api/users/me');
  61 |   await page.route('**/api/users/me', async (route) =>
  62 |     route.fulfill({
  63 |       status: 200,
  64 |       contentType: 'application/json',
  65 |       body: JSON.stringify({
  66 |         id: 1,
  67 |         email: 'test@example.com',
  68 |         display_name: '',
  69 |         bio: '',
  70 |         avatar_url: null,
  71 |         consent_at: null,
  72 |         points: 0,
  73 |         created_at: new Date().toISOString(),
  74 |       }),
  75 |     }),
  76 |   );
  77 |
  78 |   // Вводим email/password — селекторы могут отличаться, ищем по типу поля
  79 |   await emailField.fill('test@example.com');
  80 |   const passwordField = page
  81 |     .locator('input[type="password"]')
  82 |     .first();
  83 |   await passwordField.fill('SuperSecret123!');
  84 |
  85 |   // Submit — кнопка с текстом «Войти» или «Login», ищем по роли
  86 |   await page.getByRole('button', { name: /войти|login|вход/i }).first().click();
  87 |
  88 |   // 4) Должны попасть на /onboarding
> 89 |   await expect(page).toHaveURL(/\/onboarding/, { timeout: 10_000 });
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  90 |
  91 |   // Форма онбординга
  92 |   await expect(page.getByText(/расскажи о себе/i)).toBeVisible();
  93 | });
  94 |
```
