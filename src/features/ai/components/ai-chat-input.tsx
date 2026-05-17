// src/features/ai/components/ai-chat-input.tsx
"use client";

import { Send } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  /** External value override (e.g. when picking a chip). */
  value?: string;
  onValueChange?: (text: string) => void;
}

export function AiChatInput({
  onSubmit,
  disabled = false,
  value,
  onValueChange,
}: Props) {
  const [internal, setInternal] = useState("");
  const text = value ?? internal;

  const setText = (v: string) => {
    if (onValueChange) onValueChange(v);
    else setInternal(v);
  };

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    // items-center — кнопка вертикально центрируется относительно textarea.
    // При 1 строке textarea (h-11) и Button (size-11) ровно совпадают по высоте.
    // При росте textarea до 2-5 строк кнопка остаётся посередине — для коротких
    // запросов AI это читается естественнее чем items-end (Telegram-style).
    <div className="flex items-center gap-2">
      <TextareaAutosize
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Атмосферный бар в районе пешком..."
        minRows={1}
        maxRows={5}
        disabled={disabled}
        aria-label="Запрос к AI-помощнику"
        className={cn(
          // База: те же h-11 что у Button — на 1 строке совпадают идеально.
          // py-2.5 + leading-tight даёт визуально 44px высоту при minRows=1.
          "flex-1 resize-none rounded-2xl px-4 py-2.5 leading-tight",
          // Цвета через токены — input/border/foreground, как в shadcn Input.
          "bg-input/40 border border-input text-foreground placeholder:text-muted-foreground",
          // Focus — лайм-кольцо через --ring токен (как у shadcn Input).
          "focus:outline-none focus:ring-2 focus:ring-ring/60",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      />
      <Button
        type="button"
        size="icon"
        onClick={send}
        disabled={disabled || text.trim().length === 0}
        aria-label="Отправить запрос"
        className="size-11 shrink-0 rounded-2xl"
      >
        <Send className="size-5" />
      </Button>
    </div>
  );
}