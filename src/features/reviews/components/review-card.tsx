// src/features/reviews/components/review-card.tsx
"use client";

import { Heart, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { useLikeReview } from "../hooks/use-like-review";
import type { Review } from "../schemas";

interface Props {
  review: Review;
  placeId: string;
  canInteract: boolean; // false для анонимов — лайк/меню скрыты
  onEdit?: (review: Review) => void;
  onDelete?: (review: Review) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year:
      d.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

export function ReviewCard({
  review,
  placeId,
  canInteract,
  onEdit,
  onDelete,
}: Props) {
  const likeMut = useLikeReview();

  return (
    <article className="space-y-3 rounded-2xl border border-gray-800 bg-gray-900/40 p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.user.avatar_url ? (
            <Image
              src={review.user.avatar_url}
              alt={review.user.public_name}
              width={36}
              height={36}
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <div className="size-9 rounded-full bg-gray-700" />
          )}
          <div>
            <div className="text-sm font-medium text-white">
              {review.user.public_name}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(review.created_at)}
            </div>
          </div>
        </div>

        {review.is_mine && canInteract ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(review)}>
                <Pencil className="mr-2 size-4" /> Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete?.(review)}
              >
                <Trash2 className="mr-2 size-4" /> Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </header>

      <div className="flex items-center gap-0.5" aria-label={`${review.rating} из 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "size-4",
              i < review.rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-700",
            )}
          />
        ))}
      </div>

      {review.text ? (
        <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
          {review.text}
        </p>
      ) : null}

      {review.photo_url ? (
        <div className="relative h-48 w-full overflow-hidden rounded-xl">
          <Image
            src={review.photo_url}
            alt="Фото к отзыву"
            fill
            sizes="(max-width: 640px) 100vw, 28rem"
            className="object-cover"
          />
        </div>
      ) : null}

      <footer className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!canInteract || likeMut.isPending}
          onClick={() =>
            likeMut.mutate({
              id: review.id,
              placeId,
              isLiked: review.is_liked,
            })
          }
          className={cn(
            "gap-1.5",
            review.is_liked && "text-red-500",
          )}
        >
          <Heart
            className={cn("size-4", review.is_liked && "fill-current")}
          />
          {review.likes_count}
        </Button>
      </footer>
    </article>
  );
}