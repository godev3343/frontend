// src/features/auth/__tests__/store.test.ts
import { beforeEach, describe, expect, it } from 'vitest';

import { useAuthStore } from '../store';

describe('auth store', () => {
  beforeEach(() => useAuthStore.getState().clear());

  it('starts with null token', () => {
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('sets and clears token', () => {
    useAuthStore.getState().setAccessToken('abc');
    expect(useAuthStore.getState().accessToken).toBe('abc');
    useAuthStore.getState().clear();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});