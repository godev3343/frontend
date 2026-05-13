// src/features/ai/components/ai-nav-button-gated.tsx
"use client";

import { env } from "@/lib/env";

import { AiNavButton } from "./ai-nav-button";

/**
 * Обёртка над AiNavButton — рендерит кнопку в bottom-nav ТОЛЬКО если
 * бэк EPIC 8 готов (NEXT_PUBLIC_FEATURE_AI=true).
 *
 * Использование: в bottom-nav.tsx импортировать AiNavButtonGated вместо AiNavButton.
 */
export function AiNavButtonGated() {
  if (!env.NEXT_PUBLIC_FEATURE_AI) return null;
  return <AiNavButton />;
}
