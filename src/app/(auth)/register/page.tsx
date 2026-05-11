// src/app/(auth)/register/page.tsx
'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register as registerApi, requestEmailVerification } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';
import { extractError } from '@/lib/api/client';

export default function RegisterPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: standardSchemaResolver(registerSchema),
    defaultValues: { email: '', first_name: '', password: '' },
  });

  async function onSubmit(values: RegisterInput) {
    setSubmitting(true);
    try {
      const { access } = await registerApi(values);
      setAccessToken(access);
      // отправляем код на email (не блокируем регистрацию, если упало)
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