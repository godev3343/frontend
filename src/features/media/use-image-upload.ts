// src/features/media/use-image-upload.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { confirmUpload, fetchUploadStatus, requestPresign } from "./api";
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
  key: string;
  public_url: string;
  status: UploadStatus;
};

export type UseImageUploadOptions = {
  purpose: UploadPurpose;
  enable_compression?: boolean;
  // Тайм-аут поллинга в секундах (по умолчанию 30).
  polling_timeout_sec?: number;
  // Интервал поллинга в мс (по умолчанию 1500).
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

  // Поллинг статуса, если confirm вернул "pending"
  const should_poll = phase === "processing" && result !== null;
  useQuery({
    queryKey: result ? mediaKeys.status(result.key) : ["media", "status", "noop"],
    queryFn: async () => {
      if (!result) return null;
      const status = await fetchUploadStatus(result.key);

      const elapsed_ms = polling_started_at_ref.current
        ? Date.now() - polling_started_at_ref.current
        : 0;
      const timed_out = elapsed_ms > polling_timeout_sec * 1000;

      if (status.status === "ready" && status.public_url) {
        const next: UploadResult = {
          key: result.key,
          public_url: status.public_url,
          status: "ready",
        };
        setResult(next);
        setPhase("ready");
        on_success?.(next);
      } else if (status.status === "failed") {
        setPhase("error");
        setError("Не удалось обработать изображение.");
      } else if (timed_out) {
        // Превышен тайм-аут — считаем готовым с тем, что есть.
        // Если бэк не подтвердил — даём пользователю работать с предполагаемым URL.
        setPhase("ready");
        on_success?.(result);
      }

      return status;
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
        // Валидация (до сжатия — сжатие может только уменьшить, но тип не сменит)
        const validation = validateImageFile(file_in);
        if (validation) {
          setPhase("error");
          setError(
            validation.code === "too_large"
              ? "Файл больше 10 МБ."
              : "Только JPEG, PNG или WebP.",
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
            // Сжатие — best effort, при ошибке грузим оригинал.
            file = file_in;
          }
        }

        const content_type = allowedMimeSchema.parse(file.type) as AllowedMime;

        // 2. Presign
        setPhase("presigning");
        const presign = await requestPresign({
          purpose,
          content_type,
          size: file.size,
        });

        // 3. PUT в R2
        setPhase("uploading");
        setProgress(0);
        await uploadToR2({
          upload_url: presign.upload_url,
          file,
          content_type,
          fields: presign.fields,
          signal: controller.signal,
          on_progress: (loaded, total) => {
            setProgress(total > 0 ? loaded / total : 0);
          },
        });

        // 4. Confirm
        setPhase("confirming");
        const confirmed = await confirmUpload(presign.key);
        const initial: UploadResult = {
          key: confirmed.key,
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
          setError("Сервер отклонил файл.");
          return null;
        }

        // pending → поллинг через useQuery
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
