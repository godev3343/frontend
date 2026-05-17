// src/features/ai/components/ai-fab.tsx
'use client';

import { Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * AiChatSheet тащит за собой react-textarea-autosize, sonner, polling-логику —
 * это ~30KB. Большинство пользователей в одной сессии его не открывает.
 * Загружаем только когда пользователь нажал FAB.
 */
const AiChatSheet = dynamic(() => import('./ai-chat-sheet').then((m) => m.AiChatSheet), {
  ssr: false,
});

interface Props {
  className?: string;
}

/**
 * AI-FAB — кнопка вызова AI-помощника поверх контента.
 *
 * Позиционирование не задаём — родитель отвечает за position/inset.
 * См. city-map.tsx — FAB живёт в стэке `absolute bottom-32 right-3`
 * вместе с гео-кнопкой и MapLibre zoom-контролами.
 *
 * v2 (OKLCH): лайм + центрированный глоу.
 */
export function AiFab({ className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть AI-помощник"
        className={cn(
  // shape + size — строго 48x48 как MapLibre-кнопки и Geo-кнопка
          'inline-flex h-12 w-12 items-center justify-center rounded-full border',
  // color + glow
          'bg-primary text-primary-foreground border-primary/40 shadow-glow-accent-center',
  // interactivity
          'transition-all hover:brightness-105 active:opacity-90',
          'pointer-events-auto',
        className,
      )}
      >
        <Sparkles className="size-5" aria-hidden />
      </button>
      {open && <AiChatSheet open={open} onOpenChange={setOpen} />}
    </>
  );
}