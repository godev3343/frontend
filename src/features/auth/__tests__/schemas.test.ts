// src/features/auth/__tests__/schemas.test.ts
import { describe, expect, it } from 'vitest';

import {
  loginSchema,
  passwordResetConfirmSchema,
  registerSchema,
} from '../schemas';

describe('auth schemas', () => {
  it('login: rejects empty email', () => {
    const r = loginSchema.safeParse({ email: '', password: 'x' });
    expect(r.success).toBe(false);
  });

  it('login: normalizes email (lowercase + trim)', () => {
    const r = loginSchema.safeParse({ email: '  AbC@ExAmple.com ', password: 'xxxxxxxx' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe('abc@example.com');
  });

  it('register: rejects short password', () => {
    const r = registerSchema.safeParse({
      email: 'a@b.co',
      first_name: 'A',
      password: '123',
    });
    expect(r.success).toBe(false);
  });

  it('reset-confirm: rejects mismatched passwords', () => {
    const r = passwordResetConfirmSchema.safeParse({
      token: 'tok',
      password: 'longenough123',
      password_confirm: 'different12345',
    });
    expect(r.success).toBe(false);
  });
});