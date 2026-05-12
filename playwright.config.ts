// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

/**
 * Минимальный config для Pre-MVP. Один happy-path сценарий.
 *
 * Решения:
 *  - webServer: pnpm dev — поднимаем dev-сервер автоматически. На CI можно
 *    переопределить через env.PLAYWRIGHT_BASE_URL и не запускать webServer.
 *  - chromium only — Pre-MVP, не покрываем кросс-браузер
 *  - retries 1 на CI, 0 локально — детектить хрупкость, но не страдать в дев-цикле
 *  - reuseExistingServer: !CI — если уже руки запустил pnpm dev, не поднимаем второй
 *  - traces только on-first-retry — экономим диск
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // эмулируем мобильный — UI оптимизирован под него (bottom-nav)
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
