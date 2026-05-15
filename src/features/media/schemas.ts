// src/features/media/schemas.ts
import { z } from "zod/v4";


/**
 * Бэк (apps/media/serializers/presign.py):
 *
 * PresignRequest:  {purpose, content_type, content_length}
 *   - purpose: avatar | checkin | place    ← бэковский enum, НЕ `place_photo`!
 *   - content_type: image/jpeg | image/png | image/webp | image/heic | image/heif
 *   - content_length: int (bytes)
 *
 * PresignResponse: {asset_id, upload_url, key, expires_in}
 *   - НЕТ public_url и expires_at в presign-ответе
 *
 * Confirm: POST {asset_id} → MediaAsset (id, purpose, status, failure_reason,
 *          url_original, url_feed, url_thumb, width, height, created_at, processed_at)
 *
 * Status:  GET /api/media/{asset_id} → MediaAsset (тот же shape)
 */

export const uploadPurposeSchema = z.enum(["avatar", "checkin", "place", "review"]);
export type UploadPurpose = z.infer<typeof uploadPurposeSchema>;

// HEIC/HEIF от iOS бэк принимает и конвертирует в WebP в Celery-таске
export const allowedMimeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
export type AllowedMime = z.infer<typeof allowedMimeSchema>;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_RESIZE_DIMENSION = 2048;

export const presignRequestSchema = z.object({
  purpose: uploadPurposeSchema,
  content_type: allowedMimeSchema,
  content_length: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});
export type PresignRequest = z.infer<typeof presignRequestSchema>;

export const presignResponseSchema = z.object({
  asset_id: z.number().int().positive(),
  upload_url: z.string().url(),
  key: z.string().min(1),
  expires_in: z.number().int().positive(),
});
export type PresignResponse = z.infer<typeof presignResponseSchema>;

/**
 * Бэковский MediaStatus: pending | processed | failed (apps/media/models.py).
 * Фронту удобнее `ready` вместо `processed` (исторически так было), мапаем.
 */
export const backendMediaStatusSchema = z.enum(["pending", "processed", "failed"]);
export type BackendMediaStatus = z.infer<typeof backendMediaStatusSchema>;

export const uploadStatusSchema = z.enum(["pending", "ready", "failed"]);
export type UploadStatus = z.infer<typeof uploadStatusSchema>;

function mapBackendStatus(s: BackendMediaStatus): UploadStatus {
  return s === 'processed' ? 'ready' : s;
}

/**
 * Бэк MediaAssetSerializer (одинаковый для confirm и detail):
 *   {id, purpose, status, failure_reason, url_original, url_feed, url_thumb,
 *    width, height, created_at, processed_at}
 *
 * Фронту нужно: {asset_id, key, public_url, status, feed_url}.
 * Маппим в трансформе. Ключ оригинала бэк не возвращает в этом сериализаторе —
 * его нужно запомнить с presign-шага. Хук use-image-upload так и делает.
 */
export const mediaAssetSchema = z
  .object({
    id: z.number().int(),
    purpose: z.string(),
    status: backendMediaStatusSchema,
    failure_reason: z.string().nullable().default(null),
    url_original: z.string(),
    url_feed: z.string(),
    url_thumb: z.string(),
    width: z.number().int().default(0),
    height: z.number().int().default(0),
    created_at: z.string(),
    processed_at: z.string().nullable().default(null),
  })
  .transform((d) => ({
    asset_id: d.id,
    status: mapBackendStatus(d.status),
    // url_feed — "feed" размер (1080px webp), используется для отображения в карточках
    public_url: d.url_feed || d.url_original,
    feed_url: d.url_feed,
    thumb_url: d.url_thumb,
    original_url: d.url_original,
    failure_reason: d.failure_reason,
    width: d.width,
    height: d.height,
  }));

export type MediaAsset = z.infer<typeof mediaAssetSchema>;

// Ответ confirm — тот же shape что MediaAsset
export const confirmResponseSchema = mediaAssetSchema;
export type ConfirmResponse = z.infer<typeof confirmResponseSchema>;

// Ответ status-poll — тот же shape
export const statusResponseSchema = mediaAssetSchema;
export type StatusResponse = z.infer<typeof statusResponseSchema>;

// Клиентская валидация файла
export type FileValidationError =
  | { code: "too_large"; max_bytes: number }
  | { code: "bad_type"; allowed: readonly AllowedMime[] };

export function validateImageFile(file: File): FileValidationError | null {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ] as const;
  if (!allowed.includes(file.type as AllowedMime)) {
    return { code: "bad_type", allowed };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { code: "too_large", max_bytes: MAX_UPLOAD_BYTES };
  }
  return null;
}

export function formatValidationError(err: FileValidationError): string {
  if (err.code === "too_large") {
    const mb = Math.round(err.max_bytes / 1024 / 1024);
    return `Файл больше ${mb} МБ. Уменьши размер.`;
  }
  return "Поддерживаются JPEG, PNG, WebP, HEIC.";
}
