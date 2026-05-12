// src/features/ai/api.ts
import { apiClient } from "@/lib/api/client";

import { type AiResponse, aiResponseSchema } from "./schemas";

/**
 * POST /api/ai/recommend
 * Sonnet may take 5-15s — bump timeout to 30s (global default is 15s).
 * Disable retry: AI is non-idempotent + paid + rate-limited.
 */
export async function requestRecommendations(query: string): Promise<AiResponse> {
  const data = await apiClient
    .post("api/ai/recommend", {
      json: { query },
      timeout: 30_000,
      retry: { limit: 0 },
    })
    .json();
  return aiResponseSchema.parse(data);
}
