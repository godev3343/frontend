// src/features/ai/schemas.ts
import { z } from "zod/v4";

import { vibeSchema } from "@/features/map/schemas";

/**
 * Contract: POST /api/ai/recommend
 * Request:  { query: string }
 * Response: { recommendations: Array<{ place_id, reasoning, vibe_match }> }
 */

export const aiRequestSchema = z.object({
  query: z.string().min(1).max(500),
});
export type AiRequest = z.infer<typeof aiRequestSchema>;

export const aiRecommendationSchema = z.object({
  place_id: z.string().min(1),
  reasoning: z.string().min(1),
  // Backend may omit or return null if the model didn't pick a vibe
  vibe_match: vibeSchema.nullable().default(null),
});
export type AiRecommendation = z.infer<typeof aiRecommendationSchema>;

export const aiResponseSchema = z.object({
  recommendations: z.array(aiRecommendationSchema).max(10),
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
