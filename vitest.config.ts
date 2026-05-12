// vitest.config.ts
import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    // Vitest по умолчанию сканит весь репо. Явно ограничиваем тем что
    // лежит в src/ — Playwright-тесты в /e2e имеют свой test() из
    // @playwright/test, несовместимый с vitest, и при подхвате падают
    // "Playwright Test did not expect test() to be called here".
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e', 'test-results', 'playwright-report'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
