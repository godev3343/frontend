// src/app/(app)/onboarding/page.tsx
'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitOnboarding } from '@/features/auth/api';
import { ME_QUERY_KEY, useMe } from '@/features/auth/hooks';
import { onboardingSchema } from '@/features/auth/schemas';
import { track } from '@/lib/analytics';
import { extractError } from '@/lib/api/client';

/**
 * Онбординг: первый раз заполняет display_name + bio + consent.
 *
 * ВАЖНО:
 *   - consent ОБЯЗАТЕЛЬНО шлём на бэк (apps/users/serializers/onboarding.py
 *     требует BooleanField без default). Раньше выкидывали — бэк возвращал 400.
 *   - Бэк не отдаёт consent_at — проверяем готовность через is_onboarded.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useMe();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<
    z.input<typeof onboardingSchema>,
    unknown,
    z.output<typeof onboardingSchema>
  >({
    resolver: standardSchemaResolver(onboardingSchema),
    defaultValues: {
      display_name: '',
      bio: '',
      consent: false,
    },
  });

  // если уже онбордился — на главную
  useEffect(() => {
    if (me?.is_onboarded) router.replace('/');
  }, [me, router]);

  async function onSubmit(values: z.output<typeof onboardingSchema>) {
    setSubmitting(true);
    try {
      const user = await submitOnboarding(values);
      queryClient.setQueryData(ME_QUERY_KEY, user);
      track('signup_completed');
      router.replace('/');
    } catch (err) {
      const e = await extractError(err);
      toast.error(e.detail);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="bg-background flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Расскажи о себе</h1>
          <p className="text-muted-foreground text-sm">
            Это увидят друзья и люди в твоих чек-инах
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Имя в приложении</Label>
            <Input
              id="display_name"
              placeholder="Например, Aman G."
              {...form.register('display_name')}
            />
            {form.formState.errors.display_name && (
              <p className="text-destructive text-xs">
                {form.formState.errors.display_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">О себе (необязательно)</Label>
            <Input id="bio" placeholder="Кофе, лонгборд, синтвейв" {...form.register('bio')} />
            {form.formState.errors.bio && (
              <p className="text-destructive text-xs">{form.formState.errors.bio.message}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              checked={form.watch('consent')}
              onCheckedChange={(v: boolean | 'indeterminate') =>
                form.setValue('consent', v === true, { shouldValidate: true })
              }
            />
            <Label htmlFor="consent" className="text-muted-foreground text-xs leading-relaxed">
              Согласен с обработкой персональных данных и Условиями использования
            </Label>
          </div>
          {form.formState.errors.consent && (
            <p className="text-destructive text-xs">{form.formState.errors.consent.message}</p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Сохраняем...' : 'Поехали'}
          </Button>
        </form>
      </div>
    </main>
  );
}
