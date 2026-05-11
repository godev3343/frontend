// src/features/media/image-picker.tsx
"use client";

import { Loader2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { UploadPurpose } from "./schemas";
import { type UploadPhase,useImageUpload } from "./use-image-upload";

type ImagePickerProps = {
  purpose: UploadPurpose;
  /** Текущий public_url. Пустая строка = аватара нет. */
  value: string;
  /** Передаёт public_url (или "" при удалении) и key (или null). */
  onChange: (public_url: string, key: string | null) => void;
  /** Включает capture="environment" для мобильных */
  allow_camera?: boolean;
  /** Использовать клиентский ресайз */
  enable_compression?: boolean;
  className?: string;
  /** Подпись над дроп-зоной */
  label?: string;
  /** Округлая превьюшка (для аватаров) */
  rounded?: boolean;
};

function phaseLabel(phase: UploadPhase): string {
  switch (phase) {
    case "compressing":
      return "Сжимаем...";
    case "presigning":
      return "Готовим загрузку...";
    case "uploading":
      return "Загружаем...";
    case "confirming":
      return "Подтверждаем...";
    case "processing":
      return "Обрабатываем...";
    default:
      return "";
  }
}

export function ImagePicker({
  purpose,
  value,
  onChange,
  allow_camera = false,
  enable_compression = true,
  className,
  label,
  rounded = false,
}: ImagePickerProps) {
  const input_ref = useRef<HTMLInputElement>(null);
  const camera_ref = useRef<HTMLInputElement>(null);
  const [is_dragging, setIsDragging] = useState(false);
  const [local_preview, setLocalPreview] = useState<string | null>(null);

  const { phase, progress, error, upload, reset } = useImageUpload({
    purpose,
    enable_compression,
    on_success: (r) => {
      onChange(r.public_url, r.key);
      toast.success("Фото загружено");
    },
  });

  useEffect(() => {
    return () => {
      if (local_preview) URL.revokeObjectURL(local_preview);
    };
  }, [local_preview]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleFile = useCallback(
    async (file: File) => {
      if (local_preview) URL.revokeObjectURL(local_preview);
      const obj_url = URL.createObjectURL(file);
      setLocalPreview(obj_url);
      await upload(file);
    },
    [local_preview, upload],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleFile(file);
      e.target.value = "";
    },
    [handleFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const onRemove = useCallback(() => {
    if (local_preview) URL.revokeObjectURL(local_preview);
    setLocalPreview(null);
    reset();
    onChange("", null);
  }, [local_preview, onChange, reset]);

  const preview_src = local_preview ?? (value || null);
  const is_busy =
    phase === "compressing" ||
    phase === "presigning" ||
    phase === "uploading" ||
    phase === "confirming" ||
    phase === "processing";

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <div className="text-sm font-medium">{label}</div> : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => input_ref.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          is_dragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          is_busy && "pointer-events-none opacity-80",
        )}
      >
        {preview_src ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview_src}
              alt="preview"
              className={cn(
                "max-h-48 max-w-full object-cover",
                rounded ? "h-32 w-32 rounded-full" : "rounded-md",
              )}
            />
            {!is_busy ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute -right-2 -top-2 rounded-full bg-background p-1 shadow"
                aria-label="Удалить"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <Upload className="size-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              Перетащи файл или нажми для выбора
            </div>
            <div className="text-xs text-muted-foreground">
              JPEG, PNG, WebP · до 10 МБ
            </div>
          </>
        )}

        {is_busy ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/70 backdrop-blur-sm">
            <Loader2 className="size-6 animate-spin" />
            <div className="text-xs text-muted-foreground">{phaseLabel(phase)}</div>
            {phase === "uploading" ? (
              <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <input
        ref={input_ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onInputChange}
      />

      {allow_camera ? (
        <>
          <input
            ref={camera_ref}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="hidden"
            onChange={onInputChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => camera_ref.current?.click()}
            disabled={is_busy}
            className="w-full sm:hidden"
          >
            Сделать фото
          </Button>
        </>
      ) : null}
    </div>
  );
}
