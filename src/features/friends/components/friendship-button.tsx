// src/features/friends/components/friendship-button.tsx
// Полный файл — заменить целиком.

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
  useFriendshipIdLookup,
  useRemoveFriend,
  useSendFriendRequest,
} from "../hooks";
import type { FriendshipStatus } from "../schemas";

type Props = {
  userId: number;
  status: FriendshipStatus;
  friendshipId: number | null;
  /**
   * "default" — крупная кнопка с полным лейблом, для отдельной страницы /users/{id}.
   * "sm" — компактная для inline-использования внутри UserCard (поиск, списки).
   */
  size?: "default" | "sm";
};

export function FriendshipButton({
  userId,
  status,
  friendshipId,
  size = "default",
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const send = useSendFriendRequest();
  const accept = useAcceptFriendRequest();
  const decline = useDeclineFriendRequest();
  const cancel = useCancelFriendRequest();
  const remove = useRemoveFriend();
  // Бэк-долг #5: friendshipId не приходит в search-выдаче и UserPublicSerializer.
  // Делаем фолбэк — смотрим в react-query кеш заявок и достаём id оттуда.
  // ВАЖНО: хук должен быть выше любых early-return — Rules of Hooks.
  const lookupId = useFriendshipIdLookup(userId, status);
  const effectiveId = friendshipId ?? lookupId;

  if (status === "self") return null;

  const isCompact = size === "sm";
  const btnSize = isCompact ? "sm" : "default";
  const showIcon = !isCompact;

  if (status === "none") {
    return (
      <Button
        size={btnSize}
        onClick={() => send.mutate(userId)}
        disabled={send.isPending}
      >
        {showIcon && <UserPlus className="mr-2 h-4 w-4" />}
        {isCompact ? "Добавить" : "Добавить в друзья"}
      </Button>
    );
  }

if (status === "pending_outgoing") {
    return (
      <Button
        size={btnSize}
        variant="outline"
        onClick={() =>
          effectiveId && cancel.mutate({ requestId: effectiveId, userId })
        }
        disabled={!effectiveId || cancel.isPending}
      >
        {showIcon && <X className="mr-2 h-4 w-4" />}
        {isCompact ? "Отменить" : "Отменить заявку"}
      </Button>
    );
  }

  if (status === "pending_incoming") {
    return (
      <div className="flex gap-2">
        <Button
          size={btnSize}
          onClick={() =>
            effectiveId && accept.mutate({ requestId: effectiveId, userId })
          }
          disabled={!effectiveId || accept.isPending}
        >
          {showIcon && <Check className="mr-2 h-4 w-4" />}
          Принять
        </Button>
        {!isCompact && (
          <Button
            size={btnSize}
            variant="outline"
            onClick={() =>
              effectiveId &&
              decline.mutate({ requestId: effectiveId, userId })
            }
            disabled={!effectiveId || decline.isPending}
          >
            Отклонить
          </Button>
        )}
      </div>
    );
  }

  // status === "friends"
  return (
    <>
      <Button
        size={btnSize}
        variant="outline"
        onClick={() => setConfirmOpen(true)}
        disabled={remove.isPending}
      >
        {showIcon && <UserMinus className="mr-2 h-4 w-4" />}
        {isCompact ? "Удалить" : "Удалить из друзей"}
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