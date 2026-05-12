// src/features/points/api.ts
import { apiClient } from "@/lib/api/client";

import { type PointsPage, pointsPageSchema } from "./schemas";

export interface FetchPointsParams {
  cursor?: string | null;
  /** Лимит на странице. По ТЗ 9.3 — до 50, бэк решает default. */
  limit?: number;
}

function buildQuery(params: FetchPointsParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.cursor) q.set("cursor", params.cursor);
  if (params.limit) q.set("limit", String(params.limit));
  return q;
}

export async function fetchMyPoints(
  params: FetchPointsParams = {},
): Promise<PointsPage> {
  const query = buildQuery(params);
  const j = await apiClient
    .get("api/users/me/points", { searchParams: query })
    .json();
  return pointsPageSchema.parse(j);
}
