// src/features/friends/components/profile-edit-sheet.tsx
"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod/v4";

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

export function ProfileEditSheet({ open, onOpenChange, defaultValues }: Props) {
  const {
    control,
    register,
    handleSubmit,
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
  const queryClient = useQueryClient();

  const busy = updateMe.isPending || isSubmitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Редактировать профиль</SheetTitle>
          <SheetDescription>
            Аватар, имя и пара слов о себе.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
    // Бэк привязал avatar_asset через media-сигнал на confirm.
    // Инвалидируем me чтобы /profile перечитал свежий avatar_url.
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

          <SheetFooter className="mt-6 flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Сохраняем…" : "Сохранить"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
