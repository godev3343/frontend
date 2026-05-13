// src/features/media/api.ts
import { apiClient } from "@/lib/api/client";

import {
  type ConfirmResponse,
  confirmResponseSchema,
  type PresignRequest,
  type PresignResponse,
  presignResponseSchema,
  type StatusResponse,
  statusResponseSchema,
} from "./schemas";

/**
 * POST /api/upload/presign (БЕЗ trailing slash — см. apps/media/urls.py)
 *
 * Тело: {purpose, content_type, content_length}
 * Бэк требует IsEmailVerified — юзер без подтверждённой почты получит 403.
 */
export async function requestPresign(input: PresignRequest): Promise<PresignResponse> {
  const json = await apiClient
    .post("api/upload/presign", { json: input })
    .json<unknown>();
  return presignResponseSchema.parse(json);
}

/**
 * POST /api/upload/confirm — подтвердить, что файл залит в R2.
 *
 * ВАЖНО: бэк ждёт {asset_id}, не {key}. Бэк делает HEAD на R2 чтобы убедиться
 * что объект существует и Content-Type совпадает с заявленным на presign.
 *
 * Возвращает MediaAsset; status=pending пока Celery-таска не отработала,
 * после процессинга станет processed (мы мапим в 'ready' на стороне фронта).
 */
export async function confirmUpload(asset_id: number): Promise<ConfirmResponse> {
  const json = await apiClient
    .post("api/upload/confirm", { json: { asset_id } })
    .json<unknown>();
  return confirmResponseSchema.parse(json);
}

/**
 * GET /api/media/{asset_id} — статус asset'а для polling-а.
 *
 * 404 — если asset не принадлежит юзеру (защита от перебора чужих id).
 */
export async function fetchAssetStatus(asset_id: number): Promise<StatusResponse> {
  const json = await apiClient
    .get(`api/media/${asset_id}`)
    .json<unknown>();
  return statusResponseSchema.parse(json);
}
