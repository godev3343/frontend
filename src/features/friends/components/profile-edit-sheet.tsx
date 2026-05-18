// src/features/friends/components/profile-edit-sheet.tsx
// Полный файл — заменить целиком.

"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod/v4";

import type { VibeTag } from "@/components/brand/vibe-badge";
import { VibeSelector } from "@/components/brand/vibe-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ME_QUERY_KEY } from "@/features/auth/hooks";
import { ImagePicker } from "@/features/media";

import { useUpdateMe } from "../hooks";
import { type ProfileEditInput, profileEditSchema } from "../schemas";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: Partial<ProfileEditInput>;
};

type FormInput = z.input<typeof profileEditSchema>;
type FormOutput = z.output<typeof profileEditSchema>;

/**
 * Sheet редактирования профиля.
 *
 * UX-стратегия:
 *   - Mobile (<sm): полноэкранный — на телефоне side-drawer 3/4 ширины
 *     обрезает контент, выглядит неудобно. Растягиваем на весь экран,
 *     добавляем "Назад к профилю" сверху чтобы было ясно как закрыть.
 *   - Desktop (sm+): остаётся side-sheet справа (max-w-md).
 *
 * Почему ! префиксы:
 *   sheet.tsx по умолчанию ставит data-[side=right]:w-3/4 — это селектор
 *   с attribute, имеет более высокую специфичность чем обычный w-screen.
 *   Без ! Tailwind merge не побеждает data-атрибутный селектор.
 */
export function ProfileEditSheet({ open, onOpenChange, defaultValues }: Props) {
  const queryClient = useQueryClient();
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: standardSchemaResolver(profileEditSchema),
    defaultValues,
  });

  const updateMe = useUpdateMe();

  function onSubmit(values: FormOutput) {
    updateMe.mutate(values, {
      onSuccess: () => onOpenChange(false),
    });
  }

  const busy = updateMe.isPending || isSubmitting;
  const vibes = (watch("preferred_vibes") ?? []) as VibeTag[];
  const aiContext = watch("ai_context") ?? "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-full !max-w-none h-svh rounded-none border-0 sm:!w-3/4 sm:!max-w-md sm:h-full sm:rounded-l-xl sm:border-l"
        showCloseButton={false}
      >
        <SheetHeader>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 self-start"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            <ArrowLeft className="mr-1 size-4" />
            Назад к профилю
          </Button>
          <SheetTitle>Редактировать профиль</SheetTitle>
          <SheetDescription>
            Аватар, имя, био и AI-предпочтения.
          </SheetDescription>
        </SheetHeader>

        <form
          id="profile-edit-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 space-y-4 overflow-y-auto px-4"
        >
          <Controller
            control={control}
            name="avatar_url"
            render={({ field }) => (
              <ImagePicker
                purpose="avatar"
                label="Аватар"
                rounded
                value={field.value ?? ""}
                onChange={(public_url) => {
                  field.onChange(public_url);
                  queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
                }}
              />
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="display_name">Имя</Label>
            <Input
              id="display_name"
              autoComplete="off"
              placeholder="Как вас видят другие"
              {...register("display_name")}
            />
            {errors.display_name && (
              <p className="text-sm text-destructive">
                {errors.display_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">О себе</Label>
            <Textarea
              id="bio"
              rows={4}
              maxLength={280}
              placeholder="Несколько слов о себе"
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Вайбы ({vibes.length} / 5)</Label>
            <VibeSelector
              value={vibes}
              onChange={(next) =>
                setValue("preferred_vibes", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              max={5}
              size="sm"
            />
            {errors.preferred_vibes && (
              <p className="text-sm text-destructive">
                {errors.preferred_vibes.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai_context">Об интересах (необязательно)</Label>
            <Textarea
              id="ai_context"
              rows={3}
              maxLength={500}
              placeholder="Что AI должен знать о тебе"
              {...register("ai_context")}
            />
            <p className="text-muted-foreground text-xs">
              {aiContext.length} / 500
            </p>
            {errors.ai_context && (
              <p className="text-sm text-destructive">
                {errors.ai_context.message}
              </p>
            )}
          </div>
        </form>

        <SheetFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Отмена
          </Button>
          <Button type="submit" form="profile-edit-form" disabled={busy}>
            {busy ? "Сохраняем…" : "Сохранить"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}