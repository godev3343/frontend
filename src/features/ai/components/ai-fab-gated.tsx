// src/features/ai/components/ai-fab-gated.tsx
"use client";

import { env } from "@/lib/env";

import { AiFab } from "./ai-fab";

/**
 * Обёртка над AiFab — рендерит кнопку ТОЛЬКО если бэк EPIC 8 готов
 * (флаг NEXT_PUBLIC_FEATURE_AI=true в .env.local).
 *
 * В pre-MVP по умолчанию выключено: эндпоинт POST /api/ai/recommend
 * на бэке не реализован, любой запрос даст 404 + красный toast у юзера.
 *
 * Использование: в city-map.tsx импортировать AiFabGated вместо AiFab.
 */
export function AiFabGated() {
  if (!env.NEXT_PUBLIC_FEATURE_AI) return null;
  return <AiFab />;
}
