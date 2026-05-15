// src/features/reviews/components/reviews-section.tsx
"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/features/auth/store";

import { useDeleteReview } from "../hooks/use-delete-review";
import { usePlaceReviews } from "../hooks/use-place-reviews";
import type { Review } from "../schemas";
import { ReviewCard } from "./review-card";
import { ReviewFormDialog } from "./review-form-dialog";

interface Props {
  placeId: string;
}

/**
 * Полная секция отзывов для карточки места: список, кнопка «оставить отзыв»,
 * редактирование/удаление своих, бесконечная подгрузка.
 *
 * Авторизация: лайки/создание/правка требуют залогиненного юзера. Анонимам —
 * только чтение. Бэк сам разрешает GET для анонимов (IsAuthenticatedOrReadOnly).
 */
export function ReviewsSection({ placeId }: Props) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const canInteract = Boolean(accessToken);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePlaceReviews(placeId);

  const deleteMut = useDeleteReview(placeId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);

  const reviews = data?.pages.flatMap((p) => p.results) ?? [];
  const total = data?.pages[0]?.count ?? 0;
  const myReview = reviews.find((r) => r.is_mine);

  const handleOpenCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (r: Review) => {
    setEditing(r);
    setFormOpen(true);
  };

  const handleDelete = (r: Review) => {
    if (!confirm("Удалить отзыв?")) return;
    deleteMut.mutate(r.id);
  };

  if (isLoading) {
    return (
      <section className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </section>
    );
  }

  if (isError) {
    return (
      <p className="py-4 text-center text-sm text-gray-400">
        Не удалось загрузить отзывы
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Отзывы {total > 0 ? <span className="text-gray-500">({total})</span> : null}
        </h3>
        {canInteract ? (
          <Button
            size="sm"
            variant={myReview ? "secondary" : "default"}
            onClick={myReview ? () => handleEdit(myReview) : handleOpenCreate}
          >
            <Star className="mr-1.5 size-4" />
            {myReview ? "Мой отзыв" : "Оставить отзыв"}
          </Button>
        ) : null}
      </header>

      {reviews.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">
          Пока нет отзывов. Будьте первым.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              placeId={placeId}
              canInteract={canInteract}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {hasNextPage ? (
        <Button
          variant="ghost"
          className="w-full"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Загрузка..." : "Показать ещё"}
        </Button>
      ) : null}

      <ReviewFormDialog
        placeId={placeId}
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
      />
    </section>
  );
}