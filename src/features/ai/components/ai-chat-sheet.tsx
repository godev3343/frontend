// src/features/ai/components/ai-chat-sheet.tsx
"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useAiRecommend } from "../hooks/use-ai-recommend";
import type { ChatMessage } from "../schemas";
import { AiChatInput } from "./ai-chat-input";
import { RecommendationCard } from "./recommendation-card";
import { SuggestionChips } from "./suggestion-chips";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function AiChatSheet({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const mutation = useAiRecommend();

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages.length, mutation.isPending]);

  const handleSubmit = (text: string) => {
    const userMsg: ChatMessage = {
      id: genId(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);

    mutation.mutate(text, {
      onSuccess: (data) => {
        setMessages((prev) => [
          ...prev,
          {
            id: genId(),
            role: "assistant",
            recommendations: data.items,
          },
        ]);
      },
    });
  };

  const handleOpenOnMap = (placeId: string) => {
    onOpenChange(false);
    router.push(`/?placeId=${encodeURIComponent(placeId)}`, { scroll: false });
  };

  const isEmpty = messages.length === 0 && !mutation.isPending && !mutation.error;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex h-[90vh] flex-col gap-0 sm:side-right sm:h-full sm:max-w-md"
      >
        {/*
          Padding-стратегия Sheet'а:
            - SheetHeader сам внутри p-4 (см. sheet.tsx).
            - Скролл-контейнер и футер с input'ом — px-4, чтобы контент
              не упирался в края Sheet'а (на скрине было видно — чипы
              стояли впритык к border'ам).
            - На крестик закрытия (top-3 right-3) padding контента не влияет.
        */}
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            AI «Куда пойти?»
          </SheetTitle>
          <SheetDescription>
            Расскажите чего хочется — подберу 2–3 места под настроение.
          </SheetDescription>
        </SheetHeader>

        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
          {isEmpty && (
            <SuggestionChips
              onPick={(text) => setInputValue(text)}
              disabled={mutation.isPending}
            />
          )}

          {messages.map((msg) =>
            msg.role === "user" ? (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2 text-sm">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="space-y-3">
                {msg.recommendations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Ничего подходящего не нашлось. Попробуйте другой запрос.
                  </p>
                ) : (
                  msg.recommendations.map((rec) => (
                    <RecommendationCard
                      key={`${msg.id}_${rec.place_id}`}
                      recommendation={rec}
                      onOpenOnMap={handleOpenOnMap}
                    />
                  ))
                )}
              </div>
            ),
          )}

          {mutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              <span className="size-2 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
              <span className="size-2 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
              <span className="ml-1">Думаю…</span>
            </div>
          )}

          {mutation.error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {mutation.error.message}
            </div>
          )}
        </div>

        <div className="border-t border-border px-4 py-4">
          <AiChatInput
            value={inputValue}
            onValueChange={setInputValue}
            onSubmit={handleSubmit}
            disabled={mutation.isPending}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}