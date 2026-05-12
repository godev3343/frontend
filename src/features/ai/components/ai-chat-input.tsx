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
    <div className="flex items-end gap-2">
      <TextareaAutosize
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Например: атмосферный бар на район пешком..."
        minRows={1}
        maxRows={5}
        disabled={disabled}
        aria-label="Запрос к AI-помощнику"
        className={cn(
          "flex-1 resize-none rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3",
          "text-sm text-white placeholder:text-gray-500",
          "focus:border-purple-500 focus:outline-none",
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
