// src/app/_dev/page.tsx
import { notFound } from 'next/navigation';

import { Logo } from '@/components/brand/logo';
import { PointsBadge } from '@/components/brand/points-badge';
import { UserAvatar } from '@/components/brand/user-avatar';
import { VIBE_TAGS, VibeBadge } from '@/components/brand/vibe-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

/**
 * Dev-галерея компонентов. Доступна только в dev (в проде → 404).
 *
 * Используется для:
 *   - быстрой визуальной проверки всех bricks дизайн-системы
 *   - смока после изменений в globals.css / shadcn-примитивах
 *
 * v2 (OKLCH-палитра):
 *   - bg-page-gradient → bg-background
 *   - shadow-glow-purple* / shadow-glow-pink → shadow-glow-accent / shadow-float
 *   - bg-card-gradient → featured-карточка с двойным radial-gradient vibe-цветов
 */
export default function DevGallery() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <div className="bg-background min-h-dvh">
      <div className="mx-auto max-w-5xl space-y-12 p-6 md:p-12">
        <Section title="Logo">
          <div className="flex items-end gap-6">
            <Logo size="sm" />
            <Logo size="md" />
            <Logo size="lg" />
            <Logo size="xl" />
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            {/* default — лайм CTA по дизайн-системе v2 */}
            <Button>Default (lime CTA)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="pill">Pill</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Section title="Inputs">
          <div className="max-w-sm space-y-3">
            <Input placeholder="Имя" />
            <Input type="email" placeholder="email@example.com" />
            <Input disabled placeholder="Disabled" />
          </div>
        </Section>

        <Section title="Vibe badges">
          <div className="flex flex-wrap gap-2">
            {VIBE_TAGS.map((v) => (
              <VibeBadge key={v} vibe={v} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {VIBE_TAGS.map((v) => (
              <VibeBadge key={v} vibe={v} variant="solid" />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {VIBE_TAGS.map((v) => (
              <VibeBadge key={v} vibe={v} variant="outline" />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <VibeBadge vibe="calm" size="sm" />
            <VibeBadge vibe="calm" size="md" />
            <VibeBadge vibe="calm" size="lg" />
          </div>
        </Section>

        <Section title="User avatars">
          <div className="flex items-end gap-3">
            <UserAvatar name="Алия Нурланова" size="sm" />
            <UserAvatar name="Алия Нурланова" size="md" />
            <UserAvatar name="Алия Нурланова" size="lg" />
            <UserAvatar name="Алия Нурланова" size="xl" />
            <UserAvatar name="Алия Нурланова" size="lg" active />
            <UserAvatar name="J" size="lg" />
          </div>
        </Section>

        <Section title="Points">
          <div className="flex items-center gap-3">
            <PointsBadge points={42} />
            <PointsBadge points={1234} />
            <PointsBadge points={5} size="sm" />
            {/*
              Если в твоём points-badge.tsx остался variant="gradient" —
              раскомментируй строку ниже. Я её закомментил, потому что
              старый gradient-вариант устарел и, скорее всего, ты его
              уже почистил при правке bg-brand-gradient → bg-primary.
            */}
            {/* <PointsBadge points={1234} variant="gradient" /> */}
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
              </CardHeader>
              <CardContent>Тело карточки. По design.md v2 — surface / rounded-lg.</CardContent>
            </Card>

            {/*
              Featured Card — двойной радиальный градиент vibe-цветов поверх surface.
              Это паттерн прототипа: hero-карточки событий, profile-header и т.п.
              Заменяет устаревший .bg-card-gradient (фиолетово-серый).
            */}
            <Card
              className="border-0"
              style={{
               background: `
                radial-gradient(120% 100% at 0% 0%, oklch(0.78 0.18 320 / 0.45), transparent 60%),
                radial-gradient(80% 80% at 100% 100%, oklch(0.74 0.18 35 / 0.35), transparent 60%),
                var(--surface)
              `,
            }}
            >
              <CardHeader>
                <CardTitle>Featured Card</CardTitle>
              </CardHeader>
              <CardContent>Двойной radial-gradient vibe-цветов. Для hero-карточек.</CardContent>
            </Card>

            <Card className="glass border-0 bg-transparent">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
              </CardHeader>
              <CardContent>Glassmorphism через .glass — для TabBar и floating-элементов.</CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Shadows">
          <div className="flex gap-4">
            <div className="shadow-glow-accent bg-surface flex size-24 items-center justify-center rounded-2xl text-xs text-[color:var(--text-dim)]">
              glow-accent
            </div>
            <div className="shadow-float bg-surface flex size-24 items-center justify-center rounded-2xl text-xs text-[color:var(--text-dim)]">
              float
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-foreground mb-4 text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}