// src/features/reviews/components/review-card.tsx
"use client";

import { Heart, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import Image from "next/image";

import { UserAvatar } from "@/components/brand/user-avatar";
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
  canInteract: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (review: Review) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
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
    <article className="space-y-3 rounded-2xl border border-border bg-card/40 p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Используем общий UserAvatar — он уже на токенах (bg-secondary
              + ring-border) и показывает инициалы при отсутствии фото. */}
          <UserAvatar
            src={review.user.avatar_url}
            name={review.user.public_name}
            size="sm"
          />
          <div>
            <div className="text-sm font-medium text-foreground">
              {review.user.public_name}
            </div>
            <div className="text-mono-label text-muted-foreground">
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

      <div
        className="flex items-center gap-0.5"
        aria-label={`${review.rating} из 5`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "size-4",
              i < review.rating
                ? "fill-yellow-400 text-yellow-400"
                // Приглушённые звёзды через muted-foreground с прозрачностью,
                // вместо хардкодного gray-700 (был почти невидим на тёмном).
                : "text-muted-foreground/40",
            )}
          />
        ))}
      </div>

      {review.text ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
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


<footer className="flex items-center gap-2 pt-1">
  <button
    type="button"
    disabled={!canInteract || likeMut.isPending}
    onClick={() =>
      likeMut.mutate({
        id: review.id,
        placeId,
        isLiked: review.is_liked,
      })
    }
    className={cn(
      "inline-flex items-center gap-1.5 text-sm transition-colors",
      "text-muted-foreground hover:text-foreground",
      "disabled:cursor-not-allowed disabled:opacity-50",
      review.is_liked && "text-red-500 hover:text-red-500",
    )}
    aria-label={review.is_liked ? "Убрать лайк" : "Поставить лайк"}
  >
    <Heart
      className={cn(
        "size-4 transition-transform",
        review.is_liked && "fill-current",
      )}
    />
    <span className="tabular-nums">{review.likes_count}</span>
  </button>
</footer>
    </article>
  );
}