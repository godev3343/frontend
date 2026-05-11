// src/app/(auth)/login/page.tsx
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <Logo size="lg" />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">{t('auth.login.title')}</h1>
        <p className="mt-2 text-gray-400">EPIC 2 — Google + SMS</p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <Button variant="brand">{t('auth.login.google')}</Button>
        <Button variant="secondary">{t('auth.login.sms')}</Button>
      </div>
    </div>
  );
}
