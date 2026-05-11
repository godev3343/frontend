// src/features/media/schemas.ts
import { z } from "zod";

export const uploadPurposeSchema = z.enum(["avatar", "checkin", "place_photo"]);
export type UploadPurpose = z.infer<typeof uploadPurposeSchema>;

export const allowedMimeSchema = z.enum(["image/jpeg", "image/png", "image/webp"]);
export type AllowedMime = z.infer<typeof allowedMimeSchema>;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_RESIZE_DIMENSION = 2048;

export const presignRequestSchema = z.object({
  purpose: uploadPurposeSchema,
  content_type: allowedMimeSchema,
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});
export type PresignRequest = z.infer<typeof presignRequestSchema>;

export const presignResponseSchema = z.object({
  key: z.string().min(1),
  upload_url: z.string().url(),
  // R2 PUT — обычно fields отсутствует. POST multipart fallback — если бэк решит так.
  fields: z.record(z.string(), z.string()).optional(),
  public_url: z.string().url(),
  expires_at: z.string(),
});
export type PresignResponse = z.infer<typeof presignResponseSchema>;

export const uploadStatusSchema = z.enum(["pending", "ready", "failed"]);
export type UploadStatus = z.infer<typeof uploadStatusSchema>;

export const confirmResponseSchema = z.object({
  key: z.string().min(1),
  public_url: z.string().url(),
  status: uploadStatusSchema,
  feed_url: z.string().url().optional(),
});
export type ConfirmResponse = z.infer<typeof confirmResponseSchema>;

export const statusResponseSchema = z.object({
  status: uploadStatusSchema,
  public_url: z.string().url().optional(),
  feed_url: z.string().url().optional(),
});
export type StatusResponse = z.infer<typeof statusResponseSchema>;

// Клиентская валидация файла
export type FileValidationError =
  | { code: "too_large"; max_bytes: number }
  | { code: "bad_type"; allowed: readonly AllowedMime[] };

export function validateImageFile(file: File): FileValidationError | null {
  const allowed = ["image/jpeg", "image/png", "image/webp"] as const;
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
  return "Поддерживаются JPEG, PNG и WebP.";
}
