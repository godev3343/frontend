// src/app/(app)/events/[id]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { EventDetailView } from '@/features/events/components/event-detail-view';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Metadata для отдельной страницы события.
 *
 * Почему статичный title, а не fetch с бэка:
 *  - Контент защищён JWT, у server component нет access-токена пользователя
 *    (он живёт в zustand на клиенте + httpOnly refresh cookie, но бэк
 *    /api/events/[id] требует Authorization: Bearer)
 *  - Делать публичный `/api/public/events/[id]` для metadata — отдельный
 *    бэк-таск, не делаем в Pre-MVP
 *  - Для расшаривания в мессенджеры пользователь и так копирует ссылку,
 *    важен sane fallback а не идеальный preview
 *
 * Будет в Этап 1: публичный эндпоинт + динамическая OG-картинка с фото и датой.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Событие #${id}`,
    description: 'Открой событие в Go и узнай, кто идёт',
    openGraph: {
      title: `Событие в Go`,
      description: 'Кто идёт, во сколько, куда — всё в Go',
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 pb-24">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/events">← К афише</Link>
      </Button>
      <EventDetailView eventId={id} />
    </div>
  );
}
