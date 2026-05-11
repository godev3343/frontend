// src/app/(auth)/reset-password/page.tsx
'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { confirmPasswordReset } from '@/features/auth/api';
import {
  type PasswordResetConfirmInput,
  passwordResetConfirmSchema,
} from '@/features/auth/schemas';
import { extractError } from '@/lib/api/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PasswordResetConfirmInput>({
    resolver: standardSchemaResolver(passwordResetConfirmSchema),
    defaultValues: { token, password: '', password_confirm: '' },
  });

  useEffect(() => {
    if (!token) router.replace('/forgot-password');
  }, [token, router]);

  async function onSubmit(values: PasswordResetConfirmInput) {
    setSubmitting(true);
    try {
      await confirmPasswordReset(values);
      toast.success('Пароль обновлён, войди заново');
      router.replace('/login');
    } catch (err) {
      const e = await extractError(err);
      toast.error(e.detail);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Новый пароль</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...form.register('token')} />

        <div className="space-y-2">
          <Label htmlFor="password">Новый пароль</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_confirm">Повтори пароль</Label>
          <Input
            id="password_confirm"
            type="password"
            autoComplete="new-password"
            {...form.register('password_confirm')}
          />
          {form.formState.errors.password_confirm && (
            <p className="text-destructive text-xs">
              {form.formState.errors.password_confirm.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Сохраняем...' : 'Сохранить пароль'}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        <Link href="/login" className="hover:text-foreground">
          ← Назад
        </Link>
      </p>
    </div>
  );
}