// src/features/friends/components/friendship-button.tsx
"use client";

import { Check, UserMinus, UserPlus, X } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import {
  useAcceptFriendRequest,
  useCancelFriendRequest,
  useDeclineFriendRequest,
  useRemoveFriend,
  useSendFriendRequest,
} from "../hooks";
import type { FriendshipStatus } from "../schemas";

type Props = {
  userId: number;
  status: FriendshipStatus;
  friendshipId: number | null;
};

export function FriendshipButton({ userId, status, friendshipId }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const send = useSendFriendRequest();
  const accept = useAcceptFriendRequest();
  const decline = useDeclineFriendRequest();
  const cancel = useCancelFriendRequest();
  const remove = useRemoveFriend();

  if (status === "self") return null;

  if (status === "none") {
    return (
      <Button onClick={() => send.mutate(userId)} disabled={send.isPending}>
        <UserPlus className="mr-2 h-4 w-4" />
        Добавить в друзья
      </Button>
    );
  }

  if (status === "pending_outgoing") {
    return (
      <Button
        variant="outline"
        onClick={() =>
          friendshipId && cancel.mutate({ requestId: friendshipId, userId })
        }
        disabled={!friendshipId || cancel.isPending}
      >
        <X className="mr-2 h-4 w-4" />
        Отменить заявку
      </Button>
    );
  }

  if (status === "pending_incoming") {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() =>
            friendshipId && accept.mutate({ requestId: friendshipId, userId })
          }
          disabled={!friendshipId || accept.isPending}
        >
          <Check className="mr-2 h-4 w-4" />
          Принять
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            friendshipId && decline.mutate({ requestId: friendshipId, userId })
          }
          disabled={!friendshipId || decline.isPending}
        >
          Отклонить
        </Button>
      </div>
    );
  }

  // status === "friends"
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setConfirmOpen(true)}
        disabled={remove.isPending}
      >
        <UserMinus className="mr-2 h-4 w-4" />
        Удалить из друзей
      </Button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить из друзей?</AlertDialogTitle>
            <AlertDialogDescription>
              Заявку можно будет отправить заново в любой момент.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => remove.mutate(userId)}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}