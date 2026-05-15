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
  // crypto.randomUUID is available in modern browsers + node
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

  // Auto-scroll to bottom on new messages / loading state
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
      // onError handled inline via mutation.error
    });
  };

  const handleOpenOnMap = (placeId: string) => {
    onOpenChange(false);
    // push, чтобы был back-stack: пользователь может вернуться к открытому чату.
    // CityMap читает selectedId напрямую из useSearchParams, синк автоматический.
    router.push(`/?placeId=${encodeURIComponent(placeId)}`, { scroll: false });
  };

  const isEmpty = messages.length === 0 && !mutation.isPending && !mutation.error;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex h-[90vh] flex-col gap-0 sm:side-right sm:h-full sm:max-w-md"
      >
        <SheetHeader className="border-b border-gray-800 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-purple-400" />
            AI «Куда пойти?»
          </SheetTitle>
          <SheetDescription>
            Расскажите чего хочется — подберу 2–3 места под настроение.
          </SheetDescription>
        </SheetHeader>

        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto py-4 pr-1"
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
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-purple-600 px-4 py-2 text-sm text-white">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="space-y-3">
                {msg.recommendations.length === 0 ? (
                  <p className="text-sm text-gray-400">
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
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="size-2 animate-pulse rounded-full bg-purple-400" />
              <span className="size-2 animate-pulse rounded-full bg-purple-400 [animation-delay:150ms]" />
              <span className="size-2 animate-pulse rounded-full bg-purple-400 [animation-delay:300ms]" />
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

        <div className="border-t border-gray-800 pt-4">
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
