// src/features/reviews/components/review-form-dialog.tsx
// Полная версия с фиксом 409 review_exists.

"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePicker } from "@/features/media/image-picker";
import type { UploadPhase } from "@/features/media/use-image-upload";
import { extractError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

import { useCreateReview } from "../hooks/use-create-review";
import { useUpdateReview } from "../hooks/use-update-review";
import type { Review } from "../schemas";

const formSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().max(2000).default(""),
});
type FormValues = z.input<typeof formSchema>;

type Props = {
  placeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Если передан — диалог в режиме редактирования. */
  editing?: Review | null;
};

function isPhotoBusy(phase: UploadPhase): boolean {
  return (
    phase === "compressing" ||
    phase === "presigning" ||
    phase === "uploading" ||
    phase === "confirming" ||
    phase === "processing"
  );
}

export function ReviewFormDialog({ placeId, open, onOpenChange, editing }: Props) {
  const isEdit = editing != null;

  const form = useForm<
    z.input<typeof formSchema>,
    unknown,
    z.output<typeof formSchema>
  >({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      rating: editing?.rating ?? 0,
      text: editing?.text ?? "",
    },
  });

  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [photoTouched, setPhotoTouched] = useState(false);
  const [photoPhase, setPhotoPhase] = useState<UploadPhase>("idle");

  useEffect(() => {
    if (open) {
      form.reset({
        rating: editing?.rating ?? 0,
        text: editing?.text ?? "",
      });
      setPhotoUrl(editing?.photo_url ?? "");
      setPhotoKey(null);
      setPhotoTouched(false);
      setPhotoPhase("idle");
    }
  }, [open, editing, form]);

  const createMut = useCreateReview(placeId);
  const updateMut = useUpdateReview(placeId);
  const isPending = createMut.isPending || updateMut.isPending;

  const rating = form.watch("rating");

  /**
   * Обработка типичной 409 review_exists.
   *
   * Сценарий из бага:
   *   1) Юзер заполнил отзыв, добавил HEIC-фото.
   *   2) Фото-аплоад упал (unsupported_content_type) → ImagePicker показал ошибку.
   *   3) Юзер убрал фото и снова жмёт "Опубликовать" → 409 review_exists.
   *
   * Что произошло на самом деле: на шаге 2 ImagePicker упал ДО создания отзыва,
   * но если у юзера уже был отзыв на это место (с прошлой сессии или другого
   * входа) — он остался. Сейчас обработка одинаковая для обоих случаев:
   * 409 → закрываем диалог и подсказываем юзеру что отзыв уже есть, чтобы
   * он мог отредактировать через троеточие на карточке отзыва (там Edit).
   */
  function handleSubmitError(err: unknown) {
    extractError(err).then((e) => {
      if (e.code === "review_exists") {
        toast.info(
          "Вы уже оставляли отзыв на это место. Найдите его в списке и нажмите «Редактировать».",
        );
        onOpenChange(false);
        return;
      }
      toast.error(e.detail);
    });
  }

  const onSubmit = (values: FormValues) => {
    if (values.rating < 1) {
      form.setError("rating", { message: "Поставьте оценку" });
      return;
    }
    if (isPhotoBusy(photoPhase)) return;

    if (isEdit) {
      const patch: {
        rating?: number;
        text?: string;
        photo_key?: string | null;
      } = {};
      if (values.rating !== editing.rating) patch.rating = values.rating;
      if (values.text !== editing.text) patch.text = values.text;
      if (photoTouched) patch.photo_key = photoKey;

      if (Object.keys(patch).length === 0) {
        onOpenChange(false);
        return;
      }

      updateMut.mutate(
        { id: editing.id, input: patch },
        {
          onSuccess: () => onOpenChange(false),
          onError: handleSubmitError,
        },
      );
    } else {
      createMut.mutate(
        {
          rating: values.rating,
          text: values.text,
          photo_key: photoKey,
        },
        {
          onSuccess: () => onOpenChange(false),
          onError: handleSubmitError,
        },
      );
    }
  };

  const submitDisabled = isPending || isPhotoBusy(photoPhase) || rating < 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[60] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Редактировать отзыв" : "Оставить отзыв"}
          </DialogTitle>
          <DialogDescription>
            Поделитесь впечатлениями — оценка обязательна.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label>Оценка</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => form.setValue("rating", n)}
                  className="rounded p-1 transition hover:scale-110"
                  aria-label={`${n} из 5`}
                >
                  <Star
                    className={cn(
                      "size-7",
                      n <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/40",
                    )}
                  />
                </button>
              ))}
            </div>
            {form.formState.errors.rating ? (
              <p className="text-destructive text-xs">
                {form.formState.errors.rating.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="review-text">Комментарий</Label>
            <Textarea
              id="review-text"
              maxLength={2000}
              rows={4}
              placeholder="Что понравилось, что нет..."
              {...form.register("text")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Фото (необязательно)</Label>
            <ImagePicker
              purpose="review"
              value={photoUrl}
              onChange={(url, key) => {
                setPhotoUrl(url);
                setPhotoKey(key);
                setPhotoTouched(true);
              }}
              on_phase_change={setPhotoPhase}
              allow_camera
              enable_compression
              label="Добавить фото"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={submitDisabled}>
              {isPending
                ? "Сохранение..."
                : isEdit
                  ? "Сохранить"
                  : "Опубликовать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}