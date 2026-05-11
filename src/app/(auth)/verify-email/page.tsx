// src/app/(auth)/verify-email/page.tsx
'use client';

import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import {
  confirmEmailVerification,
  requestEmailVerification,
} from '@/features/auth/api';
import {
  type EmailVerifyConfirmInput,
  emailVerifyConfirmSchema,
} from '@/features/auth/schemas';
import { extractError } from '@/lib/api/client';

const RESEND_TIMEOUT = 60;

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_TIMEOUT);

  const form = useForm<EmailVerifyConfirmInput>({
    resolver: standardSchemaResolver(emailVerifyConfirmSchema),
    defaultValues: { email, code: '' },
  });

  // обратный отсчёт для повторной отправки
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // если пришли без email в query — назад на /login
  useEffect(() => {
    if (!email) router.replace('/login');
  }, [email, router]);

  async function onSubmit(values: EmailVerifyConfirmInput) {
    setSubmitting(true);
    try {
      await confirmEmailVerification(values);
      toast.success('Email подтверждён');
      router.replace('/onboarding');
    } catch (err) {
      const e = await extractError(err);
      toast.error(e.detail);
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    try {
      await requestEmailVerification({ email });
      toast.success('Код отправлен ещё раз');
      setResendIn(RESEND_TIMEOUT);
    } catch (err) {
      const e = await extractError(err);
      toast.error(e.detail);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Подтвердите email</h1>
        <p className="text-muted-foreground text-sm">
          Код отправлен на <span className="text-foreground">{email}</span>
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <Label>Код из письма</Label>
          <Controller
            control={form.control}
            name="code"
            render={({ field }) => (
              <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            )}
          />
          {form.formState.errors.code && (
            <p className="text-destructive text-xs">{form.formState.errors.code.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Проверяем...' : 'Подтвердить'}
        </Button>
      </form>

      <div className="text-center">
        <Button type="button" variant="link" disabled={resendIn > 0} onClick={resend}>
          {resendIn > 0 ? `Отправить снова через ${resendIn}с` : 'Отправить код снова'}
        </Button>
      </div>
    </div>
  );
}