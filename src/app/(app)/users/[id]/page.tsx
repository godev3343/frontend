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

function VibeMatchRing({ value }: { value: number }) {
  const size = 72;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="color-mix(in oklab, var(--primary) 18%, transparent)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="var(--primary)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums">
        {value}%
      </span>
    </div>
  );
}

function matchPhrase(value: number): string {
  if (value >= 67) return "На одной волне";
  if (value >= 34) return "Есть общие вайбы";
  return "Разные волны";
}

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
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          {match !== null ? (
            <div className="flex items-center gap-4">
              <VibeMatchRing value={match} />
              <div className="space-y-0.5">
                <div className="text-mono-label">Совпадение вайбов</div>
                <p className="text-sm font-medium text-foreground">
                  {matchPhrase(match)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-mono-label">Вайбы</div>
          )}

          <div className="flex flex-wrap gap-2">
            {theirVibes.map((vibe) => (
              <VibeBadge key={vibe} vibe={vibe} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}