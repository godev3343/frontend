// src/app/(app)/friends/page.tsx
"use client";

import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FriendsList } from "@/features/friends/components/friends-list";
import { FriendshipButton } from "@/features/friends/components/friendship-button";
import { SearchUsersPanel } from "@/features/friends/components/search-users-panel";
import { UserCard } from "@/features/friends/components/user-card";
import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useDeclineFriendRequest,
  useFriends,
  useIncomingRequests,
  useOutgoingRequests,
} from "@/features/friends/hooks";

export default function FriendsPage() {
  const friends = useFriends();
  const incoming = useIncomingRequests();
  const outgoing = useOutgoingRequests();

  const accept = useAcceptFriendRequest();
  const decline = useDeclineFriendRequest();
  const cancel = useCancelFriendRequest();

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-4">
      <h1 className="text-2xl font-semibold">Друзья</h1>

      <SearchUsersPanel />

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">
            Друзья {friends.data && <Count value={countAll(friends.data)} />}
          </TabsTrigger>
          <TabsTrigger value="incoming">
            Входящие {incoming.data && <Count value={countAll(incoming.data)} />}
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            Исходящие {outgoing.data && <Count value={countAll(outgoing.data)} />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-4">
          <FriendsList
            query={friends}
            emptyText="У вас пока нет друзей. Найдите кого-нибудь через поиск выше."
          >
            {(item) => (
              <UserCard
                user={item.user}
                href={`/users/${item.user.id}`}
                action={
                  <FriendshipButton
                    userId={item.user.id}
                    status="friends"
                    friendshipId={item.id}
                  />
                }
              />
            )}
          </FriendsList>
        </TabsContent>

        <TabsContent value="incoming" className="mt-4">
          <FriendsList
            query={incoming}
            emptyText="Нет входящих заявок."
          >
            {(item) => (
              <UserCard
                user={item.user}
                href={`/users/${item.user.id}`}
                action={
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        accept.mutate({
                          requestId: item.id,
                          userId: item.user.id,
                        })
                      }
                      disabled={accept.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        decline.mutate({
                          requestId: item.id,
                          userId: item.user.id,
                        })
                      }
                      disabled={decline.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                }
              />
            )}
          </FriendsList>
        </TabsContent>

        <TabsContent value="outgoing" className="mt-4">
          <FriendsList
            query={outgoing}
            emptyText="Нет отправленных заявок."
          >
            {(item) => (
              <UserCard
                user={item.user}
                href={`/users/${item.user.id}`}
                action={
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      cancel.mutate({
                        requestId: item.id,
                        userId: item.user.id,
                      })
                    }
                    disabled={cancel.isPending}
                  >
                    Отменить
                  </Button>
                }
              />
            )}
          </FriendsList>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function countAll(data: { pages: Array<{ results: unknown[] }> }): number {
  return data.pages.reduce((acc, p) => acc + p.results.length, 0);
}

function Count({ value }: { value: number }) {
  if (value === 0) return null;
  return (
    <span className="ml-1 rounded-full bg-muted px-2 text-xs">{value}</span>
  );
}