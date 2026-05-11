// src/app/(auth)/login/page.tsx
'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { GoogleLogin } from '@react-oauth/google';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { login, loginWithGoogle } from '@/features/auth/api';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';
import { useAuthStore } from '@/features/auth/store';
import { extractError } from '@/lib/api/client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm<LoginInput>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginInput) {
    setSubmitting(true);
    try {
      const { access } = await login(values);
      setAccessToken(access);
      router.replace(next);
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
        <h1 className="text-2xl font-semibold">Вход в Go</h1>
        <p className="text-muted-foreground text-sm">
          Оживи свой город — войди, чтобы увидеть карту вайбов
        </p>
      </div>

      {/* Google-кнопка отрисовывается сервисом Google. Если идёт обмен токенов — показываем оверлей */}
      <div className="flex justify-center">
        {googleLoading ? (
          <div className="text-muted-foreground py-2 text-sm">Подключаемся...</div>
        ) : (
          <GoogleLogin
            onSuccess={async (resp) => {
              if (!resp.credential) {
                toast.error('Google не вернул токен');
                return;
              }
              setGoogleLoading(true);
              try {
                const { access } = await loginWithGoogle(resp.credential);
                setAccessToken(access);
                router.replace(next);
              } catch (err) {
                const e = await extractError(err);
                toast.error(e.detail);
              } finally {
                setGoogleLoading(false);
              }
            }}
            onError={() => toast.error('Не удалось войти через Google')}
            useOneTap={false}
            theme="filled_black"
            shape="rectangular"
            width="320"
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs">или</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Пароль</Label>
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Забыли?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <p className="text-destructive text-xs">{form.formState.errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Входим...' : 'Войти'}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Нет аккаунта?{' '}
        <Link href="/register" className="text-foreground hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}