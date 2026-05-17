// src/features/ai/components/ai-fab-gated.tsx
"use client";

import { env } from "@/lib/env";

import { AiFab } from "./ai-fab";

/**
 * Обёртка над AiFab — рендерит кнопку ТОЛЬКО если флаг NEXT_PUBLIC_FEATURE_AI=true.
 */
export function AiFabGated() {
  if (!env.NEXT_PUBLIC_FEATURE_AI) return null;
  return <AiFab />;
}