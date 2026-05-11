// src/app/(app)/profile/page.tsx
"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/features/auth/hooks";
import { LogoutButton } from "@/features/auth/logout-button";
import { ProfileEditSheet } from "@/features/friends/components/profile-edit-sheet";
import { ProfileHeader } from "@/features/friends/components/profile-header";

export default function ProfilePage() {
  const { data: me, isPending } = useMe();
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  if (isPending) {
    return (
      <div className="container mx-auto max-w-3xl p-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!me) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-4">
      <ProfileHeader
        displayName={me.display_name}
        avatarUrl={me.avatar_url ?? ""}
        bio={me.bio}
        stats={{
          friends: 0, // подтянем из /api/users/me когда бэк добавит, либо отдельным запросом
          checkins: 0,
          points: me.points,
        }}
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
        }}
      />

      {/* История чек-инов — будет в Epic 6 */}
    </div>
  );
}