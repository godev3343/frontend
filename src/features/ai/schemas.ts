// src/features/ai/schemas.ts
import { z } from "zod/v4";

import { vibeSchema } from "@/features/map/schemas";

/**
 * Contract: POST /api/ai/recommend
 *
 * Request:  { query: string }
 * Response: {
 *   items: Array<{ place_id: number, name: string, reasoning: string, vibe_match: string[] }>,
 *   request_id: number
 * }
 *
 * Бэк (apps/ai/serializers/response.py + apps/ai/services/recommend.py) — источник истины.
 * Поэтому здесь: items (не recommendations), place_id как number → string в transform,
 * vibe_match массивом. UI-код работает с z.infer типом, где place_id уже string и
 * vibe_match нормализован в один Vibe для подсветки.
 */

export const aiRequestSchema = z.object({
  query: z.string().min(1).max(500),
});
export type AiRequest = z.infer<typeof aiRequestSchema>;

export const aiRecommendationSchema = z
  .object({
    // Бэк: PositiveBigIntegerField → number; в UI плейсы адресуются строкой
    // (usePlaceDetail принимает string из URL). Конвертим один раз здесь.
    place_id: z.number().int(),
    name: z.string(),
    reasoning: z.string().min(1),
    // Бэк отдаёт массив строк (модель часто кидает 1-3 вайба).
    // Фильтруем неизвестные — модель может галлюцинировать вайб не из enum.
    vibe_match: z.array(z.string()).default([]),
  })
  .transform((d) => {
    const knownVibes = d.vibe_match.filter(
      (v): v is z.infer<typeof vibeSchema> =>
        vibeSchema.safeParse(v).success,
    );
    return {
      place_id: String(d.place_id),
      name: d.name,
      reasoning: d.reasoning,
      // Для подсветки цветом нужен один primary vibe. Если модель вернула
      // пустой/неизвестный массив — null, тогда RecommendationCard упадёт на
      // place.primary_vibe (см. recommendation-card.tsx).
      vibe_match: knownVibes[0] ?? null,
      // Сохраняем полный массив на случай если UI захочет рендерить чипы.
      vibe_match_all: knownVibes,
    };
  });
export type AiRecommendation = z.infer<typeof aiRecommendationSchema>;

export const aiResponseSchema = z.object({
  items: z.array(aiRecommendationSchema).max(10),
  request_id: z.number().int(),
});
export type AiResponse = z.infer<typeof aiResponseSchema>;

/** Local chat state (not persisted, per EPIC 8.5) */
export type ChatMessage =
  | { id: string; role: "user"; content: string }
  | {
      id: string;
      role: "assistant";
      recommendations: AiRecommendation[];
    };