// src/features/checkins/components/checkin-dialog.tsx
"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useEffect, useMemo, useState} from "react";
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
import { useUserLocation } from "@/features/map/hooks/use-user-location";
import {
  CHECKIN_RADIUS_METERS,
  haversineMeters,
} from "@/features/map/lib/distance";
import type { PlaceDetail } from "@/features/map/schemas";
import { ImagePicker } from "@/features/media/image-picker";
import type { UploadPhase } from "@/features/media/use-image-upload";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/errors";

import { useCreateCheckin } from "../hooks/use-create-checkin";


const formSchema = z.object({
  comment: z.string().max(500).default(""),
});

type FormValues = z.input<typeof formSchema>;

type Props = {
  place: PlaceDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

/**
 * Фазы, при которых сабмит чек-ина должен быть заблокирован.
 * Бэк отбивает 400 photo_not_ready, если photo_key передан, но MediaAsset
 * на бэке ещё processing/uploading. Безопасно сабмитить только при idle/ready/error.
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

export function CheckinDialog({ place, open, onOpenChange, onSuccess }: Props) {
  const { status, coords, request } = useUserLocation({
    strict: true,
    auto: false,
  });

  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [photoPhase, setPhotoPhase] = useState<UploadPhase>("idle");
  const [retrying, setRetrying] = useState(false);  // ← НОВОЕ


  const form = useForm<
    z.input<typeof formSchema>,
    unknown,
    z.output<typeof formSchema>
  >({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: { comment: "" },
  });

  const createCheckinMut = useCreateCheckin();

  useEffect(() => {
    if (open) request();
  }, [open, request]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset({ comment: "" });
      setPhotoUrl("");
      setPhotoKey(null);
      setPhotoPhase("idle");
    }
    onOpenChange(next);
  };

  const distance = useMemo(() => {
    if (!coords) return null;
    return haversineMeters(
      { lat: coords.lat, lng: coords.lng },
      place.location,
    );
  }, [coords, place.location]);

  const isInRange =
    coords !== null && distance !== null && distance <= CHECKIN_RADIUS_METERS;

  const onSubmit = (values: FormValues) => {
  if (!coords) {
    toast.error("Не удалось определить вашу геопозицию");
    return;
  }
  const d = haversineMeters(
    { lat: coords.lat, lng: coords.lng },
    place.location,
  );
  if (d > CHECKIN_RADIUS_METERS) {
    toast.error("Подойдите ближе к месту (≤100м)");
    return;
  }
  if (isPhotoBusy(photoPhase)) {
    toast.error("Дождитесь окончания обработки фото");
    return;
  }

  const comment = (values.comment ?? "").trim();

  // ВРЕМЕННО для дебага photo_not_found — снести после фикса.
  console.log("[checkin] submit", {
    place_id: place.id,
    place_id_type: typeof place.id,
    photo_key: photoKey,
    photo_key_type: typeof photoKey,
    photo_url: photoUrl,
    photo_phase: photoPhase,
  });

  createCheckinMut.mutate(
    {
      place_id: place.id,
      lat: coords.lat,
      lng: coords.lng,
      photo_key: photoKey,
      comment: comment.length > 0 ? comment : null,
    },
    {
      onSuccess: () => {
        handleOpenChange(false);
        onSuccess?.();
      },
onError: async (err) => {
  const code = await getApiErrorCode(err);

  if (code === "photo_not_ready") {
    toast.error(
      "Фото ещё обрабатывается на сервере. Подождите пару секунд и попробуйте снова.",
    );
    return;
  }

  // photo_not_found на свежезагруженном фото — race между Celery
  // (поставившим asset в PROCESSED) и primary, с которого читает /checkins/.
  // Один тихий retry через 800мс решает в большинстве случаев.
  // `retrying` гарантирует один ретрай: если он уже был — сбрасываем фото.
  if (code === "photo_not_found") {
    if (!retrying && photoKey !== null && coords !== null) {
      setRetrying(true);
      setTimeout(() => {
        createCheckinMut.mutate(
          {
            place_id: place.id,
            lat: coords.lat,
            lng: coords.lng,
            photo_key: photoKey,
            comment: comment.length > 0 ? comment : null,
          },
          {
            onSuccess: () => {
              setRetrying(false);
              handleOpenChange(false);
              onSuccess?.();
            },
            onError: () => {
              setRetrying(false);
              setPhotoUrl("");
              setPhotoKey(null);
              setPhotoPhase("idle");
              toast.error("Фото потеряно на сервере. Загрузите его ещё раз.");
            },
          },
        );
      }, 800);
      return;
    }
    setRetrying(false);
    setPhotoUrl("");
    setPhotoKey(null);
    setPhotoPhase("idle");
    toast.error("Фото потеряно на сервере. Загрузите его ещё раз.");
    return;
  }

  toast.error(await getApiErrorMessage(err));
},
    },
  );
};

  const photoBusy = isPhotoBusy(photoPhase);
  const photoSelectedButNotReady = photoKey !== null && photoPhase !== "ready" && photoPhase !== "idle";
  const submitDisabled =
    createCheckinMut.isPending ||
    retrying ||                        // ← ДОБАВИТЬ
    status === "requesting" ||
    !coords ||
    !isInRange ||
    photoBusy ||
    photoSelectedButNotReady;


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="z-[60] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Чек-ин в {place.name}</DialogTitle>
          <DialogDescription>
            Добавьте фото и комментарий — необязательно.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label>Фото</Label>
            <ImagePicker
              purpose="checkin"
              value={photoUrl}
              onChange={(url, key) => {
                setPhotoUrl(url);
                setPhotoKey(key);
              }}
              on_phase_change={setPhotoPhase}
              allow_camera
              enable_compression
              label="Добавить фото"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="comment">Комментарий</Label>
            <Textarea
              id="comment"
              maxLength={500}
              rows={3}
              placeholder="Как тут?"
              {...form.register("comment")}
            />
          </div>

          <GpsHint
            status={status}
            distance={distance}
            isInRange={isInRange}
            onRetry={request}
          />

          {photoBusy ? (
            <p className="text-muted-foreground text-xs">
              Дождитесь окончания обработки фото перед чек-ином.
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={submitDisabled}>
              {createCheckinMut.isPending ? "Отправка..." : "Чек-ин"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GpsHint(props: {
  status: ReturnType<typeof useUserLocation>["status"];
  distance: number | null;
  isInRange: boolean;
  onRetry: () => void;
}) {
  const { status, distance, isInRange, onRetry } = props;

  if (status === "requesting") {
    return (
      <p className="text-muted-foreground text-sm">Определяем геопозицию...</p>
    );
  }
  if (status === "denied") {
    return (
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-destructive">
          Доступ к геолокации запрещён
        </span>
        <Button type="button" variant="link" size="sm" onClick={onRetry}>
          Повторить
        </Button>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-destructive">
          Не удалось получить координаты
        </span>
        <Button type="button" variant="link" size="sm" onClick={onRetry}>
          Повторить
        </Button>
      </div>
    );
  }
  if (status === "granted" && distance !== null) {
    return (
      <p
        className={
          isInRange ? "text-sm text-emerald-500" : "text-sm text-destructive"
        }
      >
        {isInRange
          ? `В радиусе чек-ина (${Math.round(distance)} м)`
          : `Слишком далеко: ${Math.round(distance)} м (нужно ≤100)`}
      </p>
    );
  }
  return null;
}
