// src/app/_dev/page.tsx
import { notFound } from 'next/navigation';

import { Logo } from '@/components/brand/logo';
import { PointsBadge } from '@/components/brand/points-badge';
import { UserAvatar } from '@/components/brand/user-avatar';
import { VIBE_TAGS, VibeBadge } from '@/components/brand/vibe-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function DevGallery() {
  // Доступно только в dev — в проде отдаём 404
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <div className="bg-page-gradient min-h-dvh">
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
            <Button variant="brand">Primary CTA</Button>
            <Button variant="default">Default</Button>
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
            <PointsBadge points={42} variant="gradient" />
            <PointsBadge points={1234} variant="gradient" />
            <PointsBadge points={5} size="sm" />
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
              </CardHeader>
              <CardContent>Тело карточки. По design.md gray-800 / rounded-2xl.</CardContent>
            </Card>
            <Card className="bg-card-gradient border-0">
              <CardHeader>
                <CardTitle>Gradient Card</CardTitle>
              </CardHeader>
              <CardContent>Покрашена через .bg-card-gradient.</CardContent>
            </Card>
            <Card className="glass border-0 bg-transparent">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
              </CardHeader>
              <CardContent>Glassmorphism через .glass.</CardContent>
            </Card>
          </div>
        </Section>

        <Section title="Glow shadows">
          <div className="flex gap-4">
            <div className="shadow-glow-purple flex size-24 items-center justify-center rounded-2xl bg-gray-800 text-xs text-gray-400">
              purple
            </div>
            <div className="shadow-glow-purple-lg flex size-24 items-center justify-center rounded-2xl bg-gray-800 text-xs text-gray-400">
              purple-lg
            </div>
            <div className="shadow-glow-pink flex size-24 items-center justify-center rounded-2xl bg-gray-800 text-xs text-gray-400">
              pink
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
      <h2 className="mb-4 text-2xl font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}
