// src/features/friends/hooks.ts
"use client";

import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { track } from "@/lib/analytics";
import { showError } from "@/lib/api/show-error";

import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  fetchFriends,
  fetchIncomingRequests,
  fetchOutgoingRequests,
  fetchUserProfile,
  removeFriend,
  searchUsers,
  sendFriendRequest,
  updateMe,
} from "./api";
import { friendsKeys } from "./query-keys";
import type { Friendship, Paginated, UserProfile } from "./schemas";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useUserProfile(userId: number | null) {
  return useQuery({
    queryKey: userId ? friendsKeys.profile(userId) : ["user-profile", "none"],
    queryFn: () => fetchUserProfile(userId!),
    enabled: userId !== null,
    // staleTime убран намеренно: на странице профиля важен актуальный
    // friendship_status. Юзер может отправить/принять заявку с другого
    // экрана (или с другого устройства), и при возврате на профиль
    // должен видеть актуальное состояние кнопки, а не закешированное.
    // Запрос дешёвый (один GET), фоновый refetch при ре-маунте — норм.
    refetchOnMount: "always",
  });
}

/**
 * Бесконечный список друзей. Курсор лежит в `next` как полный URL,
 * но нам нужен только query-параметр. Парсим.
 */
function extractCursor(nextUrl: string | null): string | undefined {
  if (!nextUrl) return undefined;
  try {
    const url = new URL(nextUrl);
    return url.searchParams.get("cursor") ?? undefined;
  } catch {
    // Бэк может вернуть относительный путь — fallback на regex
    const m = nextUrl.match(/[?&]cursor=([^&]+)/);
    return m ? decodeURIComponent(m[1]!) : undefined;
  }
}

export function useFriends() {
  return useInfiniteQuery({
    queryKey: friendsKeys.friendsList(),
    queryFn: ({ pageParam }) => fetchFriends(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => extractCursor(last.next),
    staleTime: 30_000,
  });
}

export function useIncomingRequests() {
  return useInfiniteQuery({
    queryKey: friendsKeys.incoming(),
    queryFn: ({ pageParam }) => fetchIncomingRequests(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => extractCursor(last.next),
    staleTime: 30_000,
  });
}

export function useOutgoingRequests() {
  return useInfiniteQuery({
    queryKey: friendsKeys.outgoing(),
    queryFn: ({ pageParam }) => fetchOutgoingRequests(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => extractCursor(last.next),
    staleTime: 30_000,
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: friendsKeys.search(query),
    queryFn: () => searchUsers(query),
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Хелпер: удаляет запись из всех страниц инфинит-кеша по predicate.
 * Возвращает «снапшот» прежнего значения для rollback в onError.
 */
function removeFromInfinite<T>(
  qc: ReturnType<typeof useQueryClient>,
  key: readonly unknown[],
  predicate: (item: T) => boolean,
) {
  const prev = qc.getQueryData<InfiniteData<Paginated<T>>>(key);
  if (!prev) return prev;

  qc.setQueryData<InfiniteData<Paginated<T>>>(key, {
    ...prev,
    pages: prev.pages.map((p) => ({
      ...p,
      results: p.results.filter((item) => !predicate(item)),
    })),
  });
  return prev;
}

/** Хелпер: точечное обновление friendship_status в кеше профиля. */
function setProfileStatus(
  qc: ReturnType<typeof useQueryClient>,
  userId: number,
  patch: Partial<Pick<UserProfile, "friendship_status" | "friendship_id">>,
) {
  const key = friendsKeys.profile(userId);
  const prev = qc.getQueryData<UserProfile>(key);
  if (prev) qc.setQueryData<UserProfile>(key, { ...prev, ...patch });
  return prev;
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: (user) => {
      qc.setQueryData(["me"], user);
      toast.success("Профиль обновлён");
    },
    onError: (err) => showError(err),
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (toUserId: number) => sendFriendRequest(toUserId),
    onMutate: async (toUserId) => {
      await qc.cancelQueries({ queryKey: friendsKeys.profile(toUserId) });
      const prev = setProfileStatus(qc, toUserId, {
        friendship_status: "pending_outgoing",
      });
      return { prev, toUserId };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(friendsKeys.profile(ctx.toUserId), ctx.prev);
      }
      showError(err);
    },
    onSuccess: (friendship, toUserId) => {
      // Обновляем friendship_id, чтобы потом можно было отменить
      setProfileStatus(qc, toUserId, {
        friendship_status: "pending_outgoing",
        friendship_id: friendship.id,
      });
      qc.invalidateQueries({ queryKey: friendsKeys.outgoing() });
      toast.success("Заявка отправлена");
      track("friend_request_sent", { to_user_id: toUserId });
    },
  });
}

export function useAcceptFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { requestId: number; userId: number }) =>
      acceptFriendRequest(args.requestId),
    onMutate: async ({ requestId, userId }) => {
      await qc.cancelQueries({ queryKey: friendsKeys.incoming() });
      const prevIncoming = removeFromInfinite<Friendship>(
        qc,
        friendsKeys.incoming(),
        (item) => item.id === requestId,
      );
      const prevProfile = setProfileStatus(qc, userId, {
        friendship_status: "friends",
      });
      return { prevIncoming, prevProfile, userId };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prevIncoming) {
        qc.setQueryData(friendsKeys.incoming(), ctx.prevIncoming);
      }
      if (ctx?.prevProfile && ctx.userId) {
        qc.setQueryData(friendsKeys.profile(ctx.userId), ctx.prevProfile);
      }
      showError(err);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: friendsKeys.friendsList() });
      toast.success("Теперь вы друзья");
    },
  });
}

export function useDeclineFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { requestId: number; userId: number }) =>
      declineFriendRequest(args.requestId),
    onMutate: async ({ requestId, userId }) => {
      await qc.cancelQueries({ queryKey: friendsKeys.incoming() });
      const prevIncoming = removeFromInfinite<Friendship>(
        qc,
        friendsKeys.incoming(),
        (item) => item.id === requestId,
      );
      const prevProfile = setProfileStatus(qc, userId, {
        friendship_status: "none",
        friendship_id: null,
      });
      return { prevIncoming, prevProfile, userId };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prevIncoming) {
        qc.setQueryData(friendsKeys.incoming(), ctx.prevIncoming);
      }
      if (ctx?.prevProfile && ctx.userId) {
        qc.setQueryData(friendsKeys.profile(ctx.userId), ctx.prevProfile);
      }
      showError(err);
    },
  });
}

export function useCancelFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { requestId: number; userId: number }) =>
      cancelFriendRequest(args.requestId),
    onMutate: async ({ requestId, userId }) => {
      await qc.cancelQueries({ queryKey: friendsKeys.outgoing() });
      const prevOutgoing = removeFromInfinite<Friendship>(
        qc,
        friendsKeys.outgoing(),
        (item) => item.id === requestId,
      );
      const prevProfile = setProfileStatus(qc, userId, {
        friendship_status: "none",
        friendship_id: null,
      });
      return { prevOutgoing, prevProfile, userId };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prevOutgoing) {
        qc.setQueryData(friendsKeys.outgoing(), ctx.prevOutgoing);
      }
      if (ctx?.prevProfile && ctx.userId) {
        qc.setQueryData(friendsKeys.profile(ctx.userId), ctx.prevProfile);
      }
      showError(err);
    },
  });
}

export function useRemoveFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => removeFriend(userId),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: friendsKeys.friendsList() });
      const prevFriends = removeFromInfinite<Friendship>(
        qc,
        friendsKeys.friendsList(),
        (item) => item.user.id === userId,
      );
      const prevProfile = setProfileStatus(qc, userId, {
        friendship_status: "none",
        friendship_id: null,
      });
      return { prevFriends, prevProfile, userId };
    },
    onError: (err, userId, ctx) => {
      if (ctx?.prevFriends) {
        qc.setQueryData(friendsKeys.friendsList(), ctx.prevFriends);
      }
      if (ctx?.prevProfile) {
        qc.setQueryData(friendsKeys.profile(userId), ctx.prevProfile);
      }
      showError(err);
    },
    onSuccess: () => {
      toast.success("Удалён из друзей");
    },
  });
}
