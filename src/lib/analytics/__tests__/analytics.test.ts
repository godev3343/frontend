// src/lib/analytics/__tests__/analytics.test.ts
import { describe, expect, it, vi } from 'vitest';

// env замокаем: без NEXT_PUBLIC_POSTHOG_KEY analytics должен быть no-op
vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_POSTHOG_KEY: undefined,
  },
}));

const phMock = {
  capture: vi.fn(),
  identify: vi.fn(),
  reset: vi.fn(),
};

vi.mock('posthog-js', () => ({
  default: phMock,
}));

describe('analytics (без ключа)', () => {
  it('track не падает и не дёргает posthog', async () => {
    const { track } = await import('../index');
    expect(() => track('signup_completed')).not.toThrow();
    // даём микротаску шанс выполниться, если бы dynamic import всё-таки ушёл
    await new Promise((r) => setTimeout(r, 0));
    expect(phMock.capture).not.toHaveBeenCalled();
  });

  it('identify не падает и не дёргает posthog', async () => {
    const { identify } = await import('../index');
    expect(() => identify(42)).not.toThrow();
    await new Promise((r) => setTimeout(r, 0));
    expect(phMock.identify).not.toHaveBeenCalled();
  });

  it('resetAnalytics не падает и не дёргает posthog', async () => {
    const { resetAnalytics } = await import('../index');
    expect(() => resetAnalytics()).not.toThrow();
    await new Promise((r) => setTimeout(r, 0));
    expect(phMock.reset).not.toHaveBeenCalled();
  });
});
