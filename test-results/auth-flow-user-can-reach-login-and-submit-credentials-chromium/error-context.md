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
    24 × unexpected value "http://localhost:3000/login?next=%2F"

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
  4   | /**
  5   |  * Happy-path для Pre-MVP. Один сценарий — остальное вручную.
  6   |  *
  7   |  * Что покрываем:
  8   |  *  1. Зайти на главную без auth → редирект на /login (AuthGate работает)
  9   |  *  2. На /login видны поля email/password и кнопка submit (форма рендерится)
  10  |  *  3. Submit с замоканным успешным ответом → редирект на /onboarding (новый юзер)
  11  |  *  4. /onboarding отдаёт форму с consent чекбоксом
  12  |  *
  13  |  * Что НЕ покрываем (осознанно — Этап 1):
  14  |  *  - чек-ин (требует mock геолокации через `context.grantPermissions` +
  15  |  *    `setGeolocation`, плюс mock карты — много хрупкого мокинга)
  16  |  *  - реальное обращение к бэку (мокаем через page.route)
  17  |  *  - кросс-браузер (chromium-only в config)
  18  |  */
  19  | test('user can reach login and submit credentials', async ({ page }) => {
  20  |   // Все моки ставим ДО первой навигации, чтобы не было race с монтированием AuthGate.
  21  |   // /me — переключаемый: до логина 401, после — юзер без онбординга.
  22  |   let loggedIn = false;
  23  | 
  24  |   await page.route('**/api/auth/refresh', async (route) =>
  25  |     route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
  26  |   );
  27  | 
  28  |   await page.route('**/api/users/me', async (route) => {
  29  |     if (!loggedIn) {
  30  |       return route.fulfill({
  31  |         status: 401,
  32  |         contentType: 'application/json',
  33  |         body: '{}',
  34  |       });
  35  |     }
  36  |     return route.fulfill({
  37  |       status: 200,
  38  |       contentType: 'application/json',
  39  |       body: JSON.stringify({
  40  |         id: 1,
  41  |         email: 'test@example.com',
  42  |         display_name: '',
  43  |         bio: '',
  44  |         avatar_url: null,
  45  |         is_onboarded: false, // OnboardingGate смотрит сюда — без этого поля гард не сработает
  46  |         consent_at: null,
  47  |         points: 0,
  48  |         created_at: new Date().toISOString(),
  49  |       }),
  50  |     });
  51  |   });
  52  | 
  53  |   await page.route('**/api/auth/login', async (route) => {
  54  |     loggedIn = true; // следующий /me уже отдаст залогиненного юзера без онбординга
  55  |     return route.fulfill({
  56  |       status: 200,
  57  |       contentType: 'application/json',
  58  |       body: JSON.stringify({
  59  |         access: 'fake-access',
  60  |         refresh: 'fake-refresh',
  61  |       }),
  62  |     });
  63  |   });
  64  | 
  65  |   // /api/auth/set-tokens — Next route handler, который кладёт refresh в httpOnly cookie
  66  |   // и возвращает access. На бэк он стучится изнутри Node, page.route его не перехватит,
  67  |   // если запрос идёт сервер-сайд. Но в нашем случае persistTokens() вызывается с клиента,
  68  |   // так что мок сработает.
  69  |   await page.route('**/api/auth/set-tokens', async (route) =>
  70  |     route.fulfill({
  71  |       status: 200,
  72  |       contentType: 'application/json',
  73  |       body: JSON.stringify({ access: 'fake-access' }),
  74  |     }),
  75  |   );
  76  | 
  77  |   // 1) Открыть /, без auth → редирект на /login
  78  |   await page.goto('/');
  79  |   await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  80  | 
  81  |   // 2) Форма логина рендерится
  82  |   const emailField = page.getByLabel(/email|почт/i).first();
  83  |   await expect(emailField).toBeVisible();
  84  | 
  85  |   await emailField.fill('test@example.com');
  86  |   await page.locator('input[type="password"]').first().fill('SuperSecret123!');
  87  | 
  88  |   // 3) Сабмит. Ждём что login и set-tokens реально отстрелили,
  89  |   //    чтобы URL-проверка дальше не гонялась с зависшим запросом.
  90  |   await Promise.all([
  91  |     page.waitForResponse(
  92  |       (r) => r.url().includes('/api/auth/login') && r.ok(),
  93  |       { timeout: 10_000 },
  94  |     ),
  95  |     page.waitForResponse(
  96  |       (r) => r.url().includes('/api/auth/set-tokens') && r.ok(),
  97  |       { timeout: 10_000 },
  98  |     ),
  99  |     page.getByRole('button', { name: /войти|login|вход/i }).first().click(),
  100 |   ]);
  101 | 
  102 |   // 4) router.replace('/') → попадаем в (app)/, OnboardingGate видит
  103 |   //    is_onboarded: false → редирект на /onboarding
> 104 |   await expect(page).toHaveURL(/\/onboarding/, { timeout: 10_000 });
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  105 | 
  106 |   // Форма онбординга
  107 |   await expect(page.getByText(/расскажи о себе/i)).toBeVisible();
  108 | });
```