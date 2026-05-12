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
 *
 * ssr: false ок — компонент клиентский, на SSR не рендерится в любом случае.
 */
const AiChatSheet = dynamic(
  () => import('./ai-chat-sheet').then((m) => m.AiChatSheet),
  { ssr: false },
);

interface Props {
  className?: string;
}

export function AiFab({ className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть AI-помощник"
        className={cn(
          'pointer-events-auto rounded-full p-3 text-white shadow-lg border',
          'bg-purple-600 border-purple-400/40 hover:bg-purple-500',
          'transition-colors',
          className,
        )}
      >
        <Sparkles className="size-5" aria-hidden />
      </button>
      {/* Sheet монтируется только когда open=true, что отложит загрузку
          до первого клика. Дальше react-кэш — повторно не качаем. */}
      {open && <AiChatSheet open={open} onOpenChange={setOpen} />}
    </>
  );
}
