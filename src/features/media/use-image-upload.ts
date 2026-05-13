// src/features/media/use-image-upload.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { confirmUpload, fetchAssetStatus, requestPresign } from "./api";
import { compressImage } from "./compress";
import { mediaKeys } from "./query-keys";
import { uploadToR2 } from "./r2-upload";
import {
  type AllowedMime,
  allowedMimeSchema,
  type UploadPurpose,
  type UploadStatus,
  validateImageFile,
} from "./schemas";

export type UploadPhase =
  | "idle"
  | "compressing"
  | "presigning"
  | "uploading"
  | "confirming"
  | "processing" // poll
  | "ready"
  | "error";

export type UploadResult = {
  /** Числовой ID MediaAsset на бэке — нужен для confirm и для статус-поллинга. */
  asset_id: number;
  /** R2-ключ оригинала (на бэке `key_original` в MediaAsset). Используем как photo_key для чек-инов. */
  key: string;
  /** Публичный URL картинки (feed-размер если processed, original в pending). */
  public_url: string;
  status: UploadStatus;
};

export type UseImageUploadOptions = {
  purpose: UploadPurpose;
  enable_compression?: boolean;
  polling_timeout_sec?: number;
  polling_interval_ms?: number;
  on_success?: (result: UploadResult) => void;
};

export type UseImageUploadReturn = {
  phase: UploadPhase;
  progress: number; // 0..1
  result: UploadResult | null;
  error: string | null;
  upload: (file: File) => Promise<UploadResult | null>;
  reset: () => void;
  cancel: () => void;
};

export function useImageUpload(opts: UseImageUploadOptions): UseImageUploadReturn {
  const {
    purpose,
    enable_compression = true,
    polling_timeout_sec = 30,
    polling_interval_ms = 1500,
    on_success,
  } = opts;

  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abort_ref = useRef<AbortController | null>(null);
  const polling_started_at_ref = useRef<number | null>(null);

  const reset = useCallback(() => {
    abort_ref.current?.abort();
    abort_ref.current = null;
    polling_started_at_ref.current = null;
    setPhase("idle");
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    abort_ref.current?.abort();
    abort_ref.current = null;
    setPhase("idle");
  }, []);

  // Поллинг статуса через GET /api/media/{asset_id}
  const should_poll = phase === "processing" && result !== null;
  useQuery({
    queryKey: result ? mediaKeys.status(String(result.asset_id)) : ["media", "status", "noop"],
    queryFn: async () => {
      if (!result) return null;
      const asset = await fetchAssetStatus(result.asset_id);

      const elapsed_ms = polling_started_at_ref.current
        ? Date.now() - polling_started_at_ref.current
        : 0;
      const timed_out = elapsed_ms > polling_timeout_sec * 1000;

      if (asset.status === "ready") {
        const next: UploadResult = {
          asset_id: result.asset_id,
          key: result.key,
          public_url: asset.public_url,
          status: "ready",
        };
        setResult(next);
        setPhase("ready");
        on_success?.(next);
      } else if (asset.status === "failed") {
        setPhase("error");
        setError(asset.failure_reason ?? "Не удалось обработать изображение.");
      } else if (timed_out) {
        // Превышен тайм-аут — отдаём то что есть. Юзер увидит оригинал,
        // feed-вариант появится при следующем рефреше.
        setPhase("ready");
        on_success?.(result);
      }

      return asset;
    },
    enabled: should_poll,
    refetchInterval: should_poll ? polling_interval_ms : false,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
  });

  const upload = useCallback(
    async (file_in: File): Promise<UploadResult | null> => {
      reset();
      const controller = new AbortController();
      abort_ref.current = controller;

      try {
        // Валидация
        const validation = validateImageFile(file_in);
        if (validation) {
          setPhase("error");
          setError(
            validation.code === "too_large"
              ? "Файл больше 10 МБ."
              : "Только JPEG, PNG, WebP или HEIC.",
          );
          return null;
        }

        // 1. Сжатие
        let file = file_in;
        if (enable_compression) {
          setPhase("compressing");
          try {
            file = await compressImage(file_in);
          } catch {
            // Сжатие — best effort, при ошибке грузим оригинал
            file = file_in;
          }
        }

        const content_type = allowedMimeSchema.parse(file.type) as AllowedMime;

        // 2. Presign
        setPhase("presigning");
        const presign = await requestPresign({
          purpose,
          content_type,
          content_length: file.size,
        });

        // 3. PUT в R2 (без auth-заголовков — подпись в URL)
        setPhase("uploading");
        setProgress(0);
        await uploadToR2({
          upload_url: presign.upload_url,
          file,
          content_type,
          signal: controller.signal,
          on_progress: (loaded, total) => {
            setProgress(total > 0 ? loaded / total : 0);
          },
        });

        // 4. Confirm — по asset_id, НЕ по key
        setPhase("confirming");
        const confirmed = await confirmUpload(presign.asset_id);
        const initial: UploadResult = {
          asset_id: presign.asset_id,
          key: presign.key,
          public_url: confirmed.public_url,
          status: confirmed.status,
        };
        setResult(initial);

        if (confirmed.status === "ready") {
          setPhase("ready");
          on_success?.(initial);
          return initial;
        }
        if (confirmed.status === "failed") {
          setPhase("error");
          setError(confirmed.failure_reason ?? "Сервер отклонил файл.");
          return null;
        }

        // pending → поллинг
        polling_started_at_ref.current = Date.now();
        setPhase("processing");
        return initial;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") {
          setPhase("idle");
          return null;
        }
        setPhase("error");
        setError(err instanceof Error ? err.message : "Ошибка загрузки.");
        return null;
      }
    },
    [enable_compression, on_success, purpose, reset],
  );

  useEffect(() => {
    return () => abort_ref.current?.abort();
  }, []);

  return { phase, progress, result, error, upload, reset, cancel };
}
