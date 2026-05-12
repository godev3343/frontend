// src/features/checkins/components/checkin-card.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { UserAvatar } from "@/components/brand/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useLikeCheckin } from "../hooks/use-like-checkin";
import type { CheckIn } from "../schemas";

type Props = { checkin: CheckIn };

export function CheckinCard({ checkin }: Props) {
  const likeMut = useLikeCheckin();

  const handleLike = () => {
    likeMut.mutate({ id: checkin.id, isLiked: checkin.is_liked });
  };

  const photo = checkin.photo_feed_url ?? checkin.photo_url;
  const relativeTime = formatDistanceToNow(new Date(checkin.created_at), {
    addSuffix: true,
    locale: ru,
  });

  return (
    <article className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-4">
      <header className="flex items-center gap-3">
        <Link href={`/users/${checkin.author.id}`}>
          <UserAvatar
            src={checkin.author.avatar_url}
            name={checkin.author.display_name}
            size="md"
          />
        </Link>
        <div className="flex flex-col">
          <Link
            href={`/users/${checkin.author.id}`}
            className="text-sm font-medium hover:underline"
          >
            {checkin.author.display_name}
          </Link>
          <Link
            href={`/?placeId=${checkin.place.id}`}
            className="text-muted-foreground text-xs hover:underline"
          >
            {checkin.place.name}
          </Link>
        </div>
        <time className="text-muted-foreground ml-auto text-xs">
          {relativeTime}
        </time>
      </header>

      {photo && (
        <div className="relative aspect-square w-full overflow-hidden rounded-xl">
          <Image
            src={photo}
            alt={checkin.place.name}
            fill
            sizes="(max-width: 640px) 100vw, 600px"
            className="object-cover"
          />
        </div>
      )}

      {checkin.comment && (
        <p className="text-sm leading-relaxed">{checkin.comment}</p>
      )}

      <footer className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={likeMut.isPending}
          aria-label={checkin.is_liked ? "Убрать лайк" : "Лайкнуть"}
          className="gap-1.5"
        >
          <Heart
            className={cn(
              "size-4 transition-colors",
              checkin.is_liked && "fill-rose-500 text-rose-500",
            )}
          />
          <span className="text-sm tabular-nums">{checkin.likes_count}</span>
        </Button>
      </footer>
    </article>
  );
}
