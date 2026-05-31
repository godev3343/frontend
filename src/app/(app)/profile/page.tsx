// src/app/(app)/profile/page.tsx
"use client";

import { Crown, Pencil, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/features/auth/hooks";
import { LogoutButton } from "@/features/auth/logout-button";
import { MyCheckinsList } from "@/features/checkins/components/my-checkins-list";
import { ProfileEditSheet } from "@/features/friends/components/profile-edit-sheet";
import { ProfileHeader } from "@/features/friends/components/profile-header";

export default function ProfilePage() {
  const { data: me, isUnauthenticated } = useMe();
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  /**
   * Редиректим ТОЛЬКО когда точно знаем, что юзер не залогинен:
   *   - нет access токена в zustand, ИЛИ
   *   - запрос /api/users/me упал с ошибкой (401/etc).
   *
   * Промежуточное состояние "токен есть, запрос в полёте" НЕ
   * триггерит редирект — иначе словим false-positive сразу после
   * клика на /profile (наблюдалось в проде: useMe возвращает
   * isPending=false + data=undefined пока accessToken только что
   * появился и запрос ещё не успел запуститься).
   */
  useEffect(() => {
    if (isUnauthenticated) {
      router.replace("/login");
    }
  }, [isUnauthenticated, router]);

  // Пока юзер ещё не загружен (запрос в полёте) — показываем skeleton.
  // me === undefined в норме означает "грузим", а unauthenticated мы уже
  // обработали выше.
  if (!me) {
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-4">
      <ProfileHeader
        displayName={me.display_name}
        avatarUrl={me.avatar_url ?? ""}
        bio={me.bio}
        stats={{
          friends: me.friends_count,
          checkins: me.checkins_count,
          points: me.points,
        }}
        status={me.status}
        topVibes={(me.preferred_vibes ?? []).slice(0, 3)}
        animatePoints
pointsExtra={
  <div className="flex items-center gap-3 text-xs">
      <Link
        href="/profile/points"
        className="text-primary underline-offset-2 hover:underline focus-visible:underline"
      >
        История
      </Link>
    <Link
      href="/profile/achievements"
      className="text-primary underline-offset-2 hover:underline focus-visible:underline"
    >
      Достижения
    </Link>
  </div>
}
        action={
          <div className="flex gap-2">
            <Button onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
            <LogoutButton />
          </div>
        }
      />

      <ProfileEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        defaultValues={{
          display_name: me.display_name,
          bio: me.bio,
          avatar_url: me.avatar_url,
          preferred_vibes: me.preferred_vibes,
          ai_context: me.ai_context,
        }}
      />

      <section className="grid gap-3 sm:grid-cols-2">
        <Button
          asChild
          className="h-auto flex-col items-start gap-1 py-4 text-left shadow-glow-accent"
        >
          <Link href="/profile/subscription">
            <span className="flex items-center gap-2 font-semibold">
              <Crown className="size-4" strokeWidth={2} />
              Go Premium
            </span>
            <span className="text-xs font-normal opacity-80">
              Подписка для пользователей
            </span>
          </Link>
        </Button>

        <Button
          asChild
          variant="secondary"
          className="h-auto flex-col items-start gap-1 py-4 text-left"
        >
          <Link href="/profile/partner">
            <span className="flex items-center gap-2 font-semibold">
              <Store className="size-4" strokeWidth={2} />
              Go for Business
            </span>
            <span className="text-xs font-normal text-[color:var(--text-mute)]">
              Подписка для партнёров (B2B)
            </span>
          </Link>
        </Button>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">История чек-инов</h2>
        <MyCheckinsList />
      </section>
    </div>
  );
}
