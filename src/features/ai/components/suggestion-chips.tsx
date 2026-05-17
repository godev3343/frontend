// src/features/ai/components/suggestion-chips.tsx
"use client";

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

import { SUGGESTION_CHIPS } from "../lib/suggestions";

interface Props {
  onPick: (text: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ onPick, disabled = false }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="size-4 text-primary" aria-hidden />
        <span>Не знаете что спросить? Попробуйте:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTION_CHIPS.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onPick(text)}
            disabled={disabled}
            className={cn(
              "rounded-full border border-border bg-secondary/60 px-3 py-1.5",
              "text-sm text-foreground transition-colors",
              "hover:border-primary hover:bg-secondary",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}