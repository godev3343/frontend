// src/app/(app)/onboarding/page.tsx
'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod/v4';

import type { VibeTag } from '@/components/brand/vibe-badge';
import { VibeSelector } from '@/components/brand/vibe-selector';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitOnboarding, updatePreferences } from '@/features/auth/api';
import { ME_QUERY_KEY, useMe } from '@/features/auth/hooks';
import { onboardingSchema } from '@/features/auth/schemas';
import { track } from '@/lib/analytics';
import { extractError } from '@/lib/api/client';
import { cn } from '@/lib/utils';

/**
 * Двухэтапный онбординг.
 *
 * Step 1 — display_name + bio + consent (POST /api/users/me/onboarding).
 *          Бэк проставляет consent_at и is_onboarded=true.
 * Step 2 — preferred_vibes (≥1 на фронте, бэк допускает 0..5) +
 *          ai_context (опционально, до 500 символов).
 *          PUT /api/users/me/preferences → fetchMe для полного юзера.
 *
 * Важно про кеш после step 1:
 *   submitOnboarding возвращает МИНИМАЛЬНЫЙ UserMeSerializer
 *   (apps/users/serializers/onboarding.py) — там нет points/friends_count/
 *   checkins_count и других полей с required=True у нашей userSchema.
 *   userSchema.parse() в submitOnboarding отрабатывает потому что у нас
 *   все эти поля .default(...), но КЛАСТЬ такой объект в ME_QUERY_KEY
 *   через setQueryData означает что useMe вернёт юзера с пустыми статами.
 *   Решение: invalidateQueries — useMe сам пере-фетчнет полный /me
 *   (где UserMeSerializer из apps/social — полный с status, vibes и т.д.).
 *
 * BottomNav и Sidebar на /onboarding скрыты (см. их файлы). AppShell
 * всё равно навешивает pb-28 / md:pl-64 на main — компенсируем
 * отрицательным margin-bottom/margin-left на этой странице.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useMe();

  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [vibes, setVibes] = useState<VibeTag[]>([]);
  const [aiContext, setAiContext] = useState('');

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

  // Если уже онбордился — на главную. Сработает если юзер вернётся на
  // /onboarding вручную через адресную строку. На step 2 это не помешает —
  // мы переключим step ПЕРЕД тем как me пере-fetch'нется с is_onboarded=true,
  // так что юзер увидит step 2, а не редирект.
  useEffect(() => {
    if (step === 1 && me?.is_onboarded) router.replace('/');
  }, [me, router, step]);

  async function handleStep1(values: z.output<typeof onboardingSchema>) {
    setSubmitting(true);
    try {
      await submitOnboarding(values);
      // Инвалидируем — useMe сделает GET /api/users/me (полный сериализатор).
      // НЕ используем setQueryData с ответом /onboarding (минимальный shape).
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      track('signup_completed');
      setStep(2);
    } catch (err) {
      const e = await extractError(err);
      toast.error(e.detail);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStep2() {
    if (vibes.length === 0) return; // защита от случайного клика
    setSubmitting(true);
    try {
      const user = await updatePreferences({
        preferred_vibes: vibes,
        ai_context: aiContext.trim(),
      });
      // updatePreferences вернул полный me через fetchMe — кеш можно проставить.
      queryClient.setQueryData(ME_QUERY_KEY, user);
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
    <main
      className={cn(
        'bg-background flex min-h-svh items-center justify-center p-4',
        // Компенсация padding'ов AppShell — BottomNav/Sidebar на /onboarding
        // скрыты (см. их файлы), а AppShell всё равно навешивает отступы.
        '-mb-[calc(7rem+env(safe-area-inset-bottom))] md:mb-0 md:-ml-64',
      )}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Прогресс — 2 пилюли */}
        <div className="flex gap-1.5" aria-hidden>
          <span
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              step >= 1 ? 'bg-primary' : 'bg-secondary',
            )}
          />
          <span
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              step >= 2 ? 'bg-primary' : 'bg-secondary',
            )}
          />
        </div>

        {step === 1 ? (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold leading-[1.05] md:text-4xl">
                Расскажи о себе
              </h1>
              <p className="text-muted-foreground text-sm">
                Это увидят друзья и люди в твоих чек-инах
              </p>
            </div>

            <form
              onSubmit={form.handleSubmit(handleStep1)}
              className="space-y-4"
            >
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
                <Input
                  id="bio"
                  placeholder="Кофе, лонгборд, синтвейв"
                  {...form.register('bio')}
                />
                {form.formState.errors.bio && (
                  <p className="text-destructive text-xs">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  checked={form.watch('consent')}
                  onCheckedChange={(v: boolean | 'indeterminate') =>
                    form.setValue('consent', v === true, { shouldValidate: true })
                  }
                />
                <Label
                  htmlFor="consent"
                  className="text-muted-foreground text-xs leading-relaxed"
                >
                  Согласен с обработкой персональных данных и Условиями использования
                </Label>
              </div>
              {form.formState.errors.consent && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.consent.message}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Сохраняем...' : 'Дальше'}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold leading-[1.05] md:text-4xl">
                Что тебе по вайбу?
              </h1>
              <p className="text-muted-foreground text-sm">
                AI подберёт места и события под твой ритм. До 5 вайбов — можно
                поменять позже.
              </p>
            </div>

            <div className="space-y-4">
              <VibeSelector value={vibes} onChange={setVibes} max={5} size="md" />

              <div className="space-y-2">
                <Label htmlFor="ai_context" className="text-sm">
                  Расскажи об интересах (необязательно)
                </Label>
                <Textarea
                  id="ai_context"
                  rows={3}
                  maxLength={500}
                  placeholder="Вегетарианец, работаю удалённо, люблю джаз и настолки"
                  value={aiContext}
                  onChange={(e) => setAiContext(e.target.value)}
                />
                <p className="text-muted-foreground text-xs">
                  {aiContext.length} / 500
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                >
                  <ArrowLeft className="mr-2 size-4" />
                  Назад
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleStep2}
                  disabled={vibes.length === 0 || submitting}
                >
                  {submitting ? 'Сохраняем...' : 'Поехали'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}