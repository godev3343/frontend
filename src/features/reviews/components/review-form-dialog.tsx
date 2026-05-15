// src/features/reviews/components/review-form-dialog.tsx
"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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

/**
 * `photo_busy` фазы — точно как в checkin-dialog: пока фото обрабатывается,
 * сабмит блокируем чтобы не получить 400 photo_not_ready от бэка.
 */
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

// src/features/reviews/components/review-form-dialog.tsx
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

  // Сбрасываем форму при открытии — иначе сохраняются значения предыдущего отзыва
  useEffect(() => {
    if (open) {
      form.reset({
        rating: editing?.rating ?? 0,
        text: editing?.text ?? "",
      });
      setPhotoUrl(editing?.photo_url ?? "");
      setPhotoKey(null); // существующее фото в editing мы не трогаем по дефолту
      setPhotoTouched(false);
      setPhotoPhase("idle");
    }
  }, [open, editing, form]);

  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  /**
   * `photoTouched` различает: фото не трогали (PATCH без photo_key)
   * vs фото удалили (PATCH с photo_key=null — бэк специально это поддерживает).
   * Это критично — иначе при редактировании текста мы случайно удалим фото.
   */
  const [photoTouched, setPhotoTouched] = useState(false);
  const [photoPhase, setPhotoPhase] = useState<UploadPhase>("idle");

  const createMut = useCreateReview(placeId);
  const updateMut = useUpdateReview(placeId);
  const isPending = createMut.isPending || updateMut.isPending;

  const rating = form.watch("rating");

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
      if (photoTouched) patch.photo_key = photoKey; // null = удалить, string = заменить

      if (Object.keys(patch).length === 0) {
        onOpenChange(false);
        return;
      }

      updateMut.mutate(
        { id: editing.id, input: patch },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMut.mutate(
        {
          rating: values.rating,
          text: values.text,
          photo_key: photoKey,
        },
        { onSuccess: () => onOpenChange(false) },
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
                        : "text-gray-600",
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