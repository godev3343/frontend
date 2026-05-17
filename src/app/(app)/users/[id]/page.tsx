// src/app/(app)/users/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { FriendshipButton } from "@/features/friends/components/friendship-button";
import { ProfileHeader } from "@/features/friends/components/profile-header";
import { useUserProfile } from "@/features/friends/hooks";

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = Number.parseInt(params?.id ?? "", 10);

  const { data, isPending, isError } = useUserProfile(
    Number.isFinite(userId) ? userId : null,
  );

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
        topVibes={[]}                       // бэк-долг #4: data.top_vibes
        action={
          <FriendshipButton
            userId={data.id}
            status={data.friendship_status}
            friendshipId={data.friendship_id}
          />
        }
      />
    </div>
  );
}