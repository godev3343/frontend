// src/app/(auth)/forgot-password/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPasswordReset } from '@/features/auth/api';
import {
  type PasswordResetRequestInput,
  passwordResetRequestSchema,
} from '@/features/auth/schemas';
import { extractError } from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: PasswordResetRequestInput) {
    setSubmitting(true);
    try {
      await requestPasswordReset(values);
      setSent(true);
    } catch (err) {
      const e = await extractError(err);
      toast.error(e.detail);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Письмо отправлено</h1>
        <p className="text-muted-foreground text-sm">
          Если такой email зарегистрирован — ссылка для сброса пришла в почту.
        </p>
        <Link href="/login" className="text-primary text-sm hover:underline">
          ← Назад ко входу
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Восстановление пароля</h1>
        <p className="text-muted-foreground text-sm">Отправим ссылку на твой email</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
          {form.formState.errors.email && (
            <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Отправляем...' : 'Отправить ссылку'}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        <Link href="/login" className="hover:text-foreground">
          ← Назад ко входу
        </Link>
      </p>
    </div>
  );
}