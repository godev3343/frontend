// src/app/(auth)/register/page.tsx
'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register as registerApi, requestEmailVerification } from '@/features/auth/api';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { extractError } from '@/lib/api/client';

/**
 * Регистрация → подтверждение email → логин.
 *
 * Бэк (apps/users/views/register.py::RegisterView) на POST /api/auth/register
 * возвращает ТОЛЬКО {detail: "..."} — без токенов. Юзер обязан подтвердить
 * email (POST /api/auth/email/verify/confirm), и только после этого
 * залогиниться через POST /api/auth/login.
 *
 * Поэтому здесь больше НЕТ setAccessToken — просто отправляем код и редиректим
 * на /verify-email. Если код-отправка упала по rate-limit или другой причине —
 * не блокируем юзера, он всегда может запросить код повторно с /verify-email.
 */
export default function RegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: standardSchemaResolver(registerSchema),
    defaultValues: { email: '', first_name: '', password: '' },
  });

  async function onSubmit(values: RegisterInput) {
    setSubmitting(true);
    try {
      await registerApi(values);
      // Бэк сам шлёт код при регистрации (см. RegisterView.send_email_verification
      // в AuthService.register). Дублирующий вызов ниже — best effort на случай
      // если шаг проглотился; rate-limit обрабатывается тихо.
      await requestEmailVerification({ email: values.email }).catch(() => undefined);
      router.replace(`/verify-email?email=${encodeURIComponent(values.email)}`);
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
        <h1 className="text-2xl font-semibold">Создать аккаунт</h1>
        <p className="text-muted-foreground text-sm">Минимум формальностей</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Имя</Label>
          <Input id="first_name" autoComplete="given-name" {...form.register('first_name')} />
          {form.formState.errors.first_name && (
            <p className="text-destructive text-xs">
              {form.formState.errors.first_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
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

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Создаём...' : 'Создать аккаунт'}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Уже есть аккаунт?{' '}
        <Link href="/login" className="text-foreground hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
