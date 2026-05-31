// src/app/(app)/users/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";

import { VibeBadge } from "@/components/brand/vibe-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/features/auth/hooks";
import { FriendshipButton } from "@/features/friends/components/friendship-button";
import { ProfileHeader } from "@/features/friends/components/profile-header";
import { useUserProfile } from "@/features/friends/hooks";
import { vibeMatchPercent } from "@/features/friends/lib/vibe-match";

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Number.parseInt(params?.id ?? "", 10);

  const { data, isPending, isError } = useUserProfile(
    Number.isFinite(userId) ? userId : null,
  );
  const { data: me } = useMe();

  if (!Number.isFinite(userId)) {
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <p className="text-destructive">Некорректный ID пользователя</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <p className="text-destructive">Пользователь не найден</p>
      </div>
    );
  }

  // Открыли свой профиль — редиректим
  if (data.friendship_status === "self") {
    router.replace("/profile");
    return null;
  }
  const theirVibes = data.preferred_vibes ?? [];
  const match = vibeMatchPercent(me?.preferred_vibes ?? [], theirVibes);

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-4">
      <ProfileHeader
        displayName={data.display_name}
        avatarUrl={data.avatar_url ?? ""}
        bio={data.bio}
        stats={{
          friends: data.friends_count,
          checkins: data.checkins_count,
          points: data.points,
        }}
        status={data.status}                // ← НОВОЕ
        topVibes={(data.preferred_vibes ?? []).slice(0, 3)}
        action={
          <FriendshipButton
            userId={data.id}
            status={data.friendship_status}
            friendshipId={data.friendship_id}
          />
        }
      />

      {theirVibes.length > 0 && (
        <section className="space-y-3 rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">Вайбы</h2>
            {match !== null && (
              <span className="text-sm text-muted-foreground">
                Совпадение{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {match}%
                </span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {theirVibes.map((vibe) => (
              <VibeBadge key={vibe} vibe={vibe} size="sm" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}