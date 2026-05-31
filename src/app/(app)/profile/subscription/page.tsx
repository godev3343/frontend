"use client";

import { ArrowLeft, Check, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const PREMIUM_FEATURES = [
  "Безлимитные AI-рекомендации мест и людей",
  "Расширенные фильтры по вайбам и времени",
  "Приоритет в Connect — тебя видят раньше",
  "Ранний доступ к закрытым ивентам",
  "Бейдж Premium в профиле",
] as const;

const FREE_FEATURES = [
  "Карта вайбов и чек-ины",
  "Базовые AI-рекомендации",
  "До 10 друзей в Connect",
] as const;

export default function SubscriptionPage() {
  function handleSubscribe() {
    toast.info("Оплата скоро будет доступна", {
      description: "Подключаем платёжный провайдер. Заглушка для демо.",
    });
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-8 p-4 pb-28">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Назад в профиль
      </Link>

      <header className="space-y-2">
        <span className="text-mono-label inline-flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-primary" />
          для пользователей
        </span>
        <h1 className="text-3xl font-bold leading-[1.05] md:text-4xl">
          Go Premium
        </h1>
        <p className="text-sm text-muted-foreground">
          Больше AI, меньше шума. Заглушка-текст про то, как премиум делает
          карту города персональной именно под твою волну.
        </p>
      </header>

      {/* Premium — featured-карточка с lime-радиалкой */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: `
            radial-gradient(120% 100% at 0% 0%, oklch(0.88 0.18 130 / 0.22), transparent 60%),
            radial-gradient(80% 80% at 100% 100%, oklch(0.78 0.18 320 / 0.16), transparent 60%),
            var(--surface)
          `,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-mono-label inline-flex items-center gap-1.5 text-primary">
              <Crown className="size-3.5" strokeWidth={2} />
              premium
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold">990 ₸</span>
              <span className="text-mono-label">/ мес</span>
            </div>
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {PREMIUM_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.5} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <Button
          className="mt-6 w-full shadow-glow-accent"
          size="lg"
          onClick={handleSubscribe}
        >
          Оформить Premium
        </Button>
      </div>

      {/* Free — обычная surface-карточка */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-baseline justify-between">
          <span className="text-mono-label">free · текущий план</span>
          <span className="text-sm font-semibold text-muted-foreground">0 ₸</span>
        </div>
        <ul className="mt-4 space-y-2.5">
          {FREE_FEATURES.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2.5 text-sm text-muted-foreground"
            >
              <Check className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-xs text-[color:var(--text-mute)]">
        Заглушка. Отмена в любой момент, без скрытых платежей.
      </p>
    </div>
  );
}