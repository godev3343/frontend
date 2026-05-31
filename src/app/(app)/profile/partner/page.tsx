// src/app/(app)/profile/partner/page.tsx
"use client";

import {
  ArrowLeft,
  BarChart3,
  Check,
  Headphones,
  MapPin,
  Megaphone,
  Store,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const PERKS = [
  { icon: MapPin, title: "Верификация места", text: "Заглушка: подтверждённая карточка с логотипом и приоритетом на карте." },
  { icon: BarChart3, title: "Аналитика вайбов", text: "Заглушка: кто и с каким настроением приходит, пики по часам." },
  { icon: Megaphone, title: "Промо и афиша", text: "Заглушка: продвижение событий заведения в ленте и рекомендациях." },
  { icon: Headphones, title: "Поддержка", text: "Заглушка: персональный менеджер и приоритетный ответ." },
] as const;

type Plan = {
  name: string;
  price: string;
  features: readonly string[];
  featured?: boolean;
};

const PLANS: readonly Plan[] = [
  {
    name: "Старт",
    price: "19 900 ₸ / мес",
    features: ["1 заведение", "Базовая аналитика", "До 3 промо в месяц"],
  },
  {
    name: "Бизнес",
    price: "49 900 ₸ / мес",
    features: ["До 5 заведений", "Полная аналитика вайбов", "Безлимит промо", "Менеджер"],
    featured: true,
  },
];

export default function PartnerPage() {
  function handleContact() {
    toast.info("Спасибо за интерес", {
      description: "Форма для партнёров скоро появится. Заглушка для демо.",
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
          <Store className="size-3.5 text-primary" strokeWidth={2} />
          для партнёров · b2b
        </span>
        <h1 className="text-3xl font-bold leading-[1.05] md:text-4xl">
          Go for Business
        </h1>
        <p className="text-sm text-muted-foreground">
          Заглушка-текст: приведи живую аудиторию Астаны в своё заведение —
          с реальной картиной настроений и продвижением событий.
        </p>
      </header>

      {/* Преимущества */}
      <section className="grid gap-3 sm:grid-cols-2">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border bg-card p-4">
            <div className="flex size-9 items-center justify-center rounded-full bg-secondary">
              <Icon className="size-4 text-primary" strokeWidth={2} />
            </div>
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      {/* Тарифы */}
      <section className="space-y-3">
        <h2 className="text-mono-label">тарифы</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {PLANS.map((plan) =>
            plan.featured ? (
              <div
                key={plan.name}
                className="relative overflow-hidden rounded-2xl p-5"
                style={{
                  background: `
                    radial-gradient(120% 100% at 0% 0%, oklch(0.82 0.12 165 / 0.22), transparent 60%),
                    radial-gradient(80% 80% at 100% 100%, oklch(0.88 0.18 130 / 0.18), transparent 60%),
                    var(--surface)
                  `,
                }}
              >
                <PlanBody plan={plan} onSelect={handleContact} />
              </div>
            ) : (
              <div key={plan.name} className="rounded-2xl border bg-card p-5">
                <PlanBody plan={plan} onSelect={handleContact} />
              </div>
            ),
          )}
        </div>
      </section>

      <p className="text-center text-xs text-[color:var(--text-mute)]">
        Заглушка. Цены и условия — демонстрационные.
      </p>
    </div>
  );
}

function PlanBody({ plan, onSelect }: { plan: Plan; onSelect: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{plan.name}</span>
        {plan.featured && (
          <span className="text-mono-label text-primary">популярный</span>
        )}
      </div>
      <div className="mt-1 text-xl font-bold">{plan.price}</div>

      <ul className="mt-4 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.5} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Button
        className={plan.featured ? "mt-5 w-full shadow-glow-accent" : "mt-5 w-full"}
        variant={plan.featured ? "default" : "secondary"}
        onClick={onSelect}
      >
        Оставить заявку
      </Button>
    </>
  );
}