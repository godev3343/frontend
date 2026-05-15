// src/features/ai/hooks/use-ai-recommend.ts
"use client";

import { useMutation } from "@tanstack/react-query";
import type { HTTPError } from "ky";
import { ZodError } from "zod/v4";

import { track } from "@/lib/analytics";

import { requestRecommendations } from "../api";
import type { AiResponse } from "../schemas";

export type AiError =
  | { kind: "rate_limit"; retryAfterSec: number | null; message: string }
  | { kind: "model_bad_output"; message: string }
  | { kind: "timeout"; message: string }
  | { kind: "generic"; message: string };

function isHttpError(e: unknown): e is HTTPError {
  return !!e && typeof e === "object" && "response" in e;
}

function parseIntStrict(s: string | null): number | null {
  if (s === null) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}



async function mapError(e: unknown): Promise<AiError> {
  if (e instanceof ZodError) {
    return {
      kind: "model_bad_output",
      message: "AI ответил странно. Попробуйте переформулировать запрос.",
    };
  }
  if (!isHttpError(e)) {
    const msg = e instanceof Error ? e.message : "";
    if (/timeout/i.test(msg)) {
      return {
        kind: "timeout",
        message: "AI думает дольше обычного. Попробуйте ещё раз.",
      };
    }
    return {
      kind: "generic",
      message: "Не удалось получить ответ. Проверьте интернет.",
    };
  }
  const status = e.response.status;
  if (status === 429) {
    const retryAfterSec = parseIntStrict(e.response.headers.get("retry-after"));
    const message =
      retryAfterSec !== null && retryAfterSec > 0
        ? `Лимит 10 запросов в час. Попробуйте через ${retryAfterSec} сек.`
        : "Лимит 10 запросов в час. Попробуйте позже.";
    return { kind: "rate_limit", retryAfterSec, message };
  }
  if (status === 502) {
    return {
      kind: "model_bad_output",
      message: "AI ответил странно. Попробуйте переформулировать запрос.",
    };
  }
  return {
    kind: "generic",
    message: `Ошибка сервера (${status}). Попробуйте ещё раз.`,
  };
}

export function useAiRecommend() {
  return useMutation<AiResponse, AiError, string>({
    mutationKey: ["ai", "recommend"],
    mutationFn: async (query) => {
      try {
        return await requestRecommendations(query);
      } catch (e) {
        throw await mapError(e);
      }
    },
    onSuccess: (_, query) => {
      track("ai_query_sent", { query_len: query.length });
    },
  });
}
