// src/features/friends/api.ts
import { apiClient } from "@/lib/api/client";

import {
  friendListItemSchema,
  type Friendship,
  incomingRequestSchema,
  outgoingRequestSchema,
  type Paginated,
  paginatedSchema,
  type ProfileEditInput,
  type PublicUser,
  publicUserSchema,
  type UserProfile,
  userProfileSchema,
} from "./schemas";

/**
 * Соответствие путей бэку (apps/social/urls.py):
 *   GET    /api/users/{id}                       UserPublicSerializer
 *   PATCH  /api/users/me                         UserMeSerializer
 *   GET    /api/users/search?q=                  paginated(UserSearchResult)
 *   GET    /api/friends                          paginated(FriendListItem) — плоский User
 *   GET    /api/friends/requests/incoming        paginated(IncomingRequest)
 *   GET    /api/friends/requests/outgoing        paginated(OutgoingRequest)
 *   POST   /api/friends/requests                 {id, status} — минимум
 *   POST   /api/friends/requests/{id}/accept     {id, status}
 *   POST   /api/friends/requests/{id}/decline    204
 *   DELETE /api/friends/requests/{id}            204 (cancel outgoing)
 *   DELETE /api/friends/{user_id}                204 (remove friend)
 *
 * NB: пути в social/urls.py БЕЗ trailing slash — Django принимает их как есть.
 * НЕ добавляем слеш — иначе будет 404.
 */

export async function fetchUserProfile(userId: number): Promise<UserProfile> {
  const data = await apiClient.get(`api/users/${userId}`).json();
  return userProfileSchema.parse(data);
}

// src/features/friends/api.ts
export async function updateMe(input: ProfileEditInput) {
  // Импортируем тут чтобы не было кругового импорта с features/auth
  const { userSchema } = await import("@/features/auth/schemas");

  // avatar_url — это URL картинки в R2 (computed на бэке).
  // Для PATCH /users/me бэк ждёт avatar_asset_id (FK на MediaAsset).
  // Парсим asset_id из R2 URL формата ".../avatars/{asset_id}/..."
  const { avatar_url, ...rest } = input;
  const payload: Record<string, unknown> = { ...rest };

  if (avatar_url && avatar_url.length > 0) {
    const match = avatar_url.match(/\/avatars\/(\d+)\//);
    if (match) {
      payload.avatar_asset_id = Number(match[1]);
    }
  } else if (avatar_url === "") {
    payload.avatar_asset_id = null;
  }

  const data = await apiClient.patch("api/users/me", { json: payload }).json();
  return userSchema.parse(data);
}

export async function searchUsers(
  query: string,
  cursor?: string,
): Promise<Paginated<PublicUser>> {
  const searchParams = new URLSearchParams({ q: query });
  // search использует LimitOffsetPagination — cursor здесь это offset
  if (cursor) searchParams.set("offset", cursor);

  const data = await apiClient.get(`api/users/search?${searchParams}`).json();
  return paginatedSchema(publicUserSchema).parse(data);
}

export async function fetchFriends(cursor?: string): Promise<Paginated<Friendship>> {
  const url = cursor ? `api/friends?offset=${cursor}` : "api/friends";
  const data = await apiClient.get(url).json();
  // friends отдаёт плоских юзеров (FriendListItemSerializer), не Friendship
  return paginatedSchema(friendListItemSchema).parse(data);
}

export async function fetchIncomingRequests(
  cursor?: string,
): Promise<Paginated<Friendship>> {
  const url = cursor
    ? `api/friends/requests/incoming?offset=${cursor}`
    : "api/friends/requests/incoming";
  const data = await apiClient.get(url).json();
  return paginatedSchema(incomingRequestSchema).parse(data);
}

export async function fetchOutgoingRequests(
  cursor?: string,
): Promise<Paginated<Friendship>> {
  const url = cursor
    ? `api/friends/requests/outgoing?offset=${cursor}`
    : "api/friends/requests/outgoing";
  const data = await apiClient.get(url).json();
  return paginatedSchema(outgoingRequestSchema).parse(data);
}

/**
 * POST /api/friends/requests — бэк отвечает минимумом: {id, status}.
 * Возвращаем синтетический Friendship для совместимости с UI; user undefined
 * — UI код, который вызывает sendFriendRequest, обычно сразу инвалидирует
 * запросы и заново читает реальный список.
 */
export async function sendFriendRequest(toUserId: number): Promise<Friendship> {
  const raw = await apiClient
    .post("api/friends/requests", { json: { to_user_id: toUserId } })
    .json<{ id: number; status: 'pending' | 'accepted' }>();
  return {
    id: raw.id,
    user: {
      id: toUserId,
      display_name: '',
      avatar_url: '',
      bio: '',
      points: 0,
      status: null,
      friendship_status: 'none' as const,
      friendship_id: null,
    },
    status: raw.status,
    created_at: new Date().toISOString(),
  };
}

export async function acceptFriendRequest(requestId: number): Promise<Friendship> {
  const raw = await apiClient
    .post(`api/friends/requests/${requestId}/accept`)
    .json<{ id: number; status: 'pending' | 'accepted' }>();
  return {
    id: raw.id,
    user: {
      id: 0,
      display_name: '',
      avatar_url: '',
      bio: '',
      points: 0,
      status: null,
      friendship_status: 'none' as const,
      friendship_id: null,
    },
    status: raw.status,
    created_at: new Date().toISOString(),
  };
}

export async function declineFriendRequest(requestId: number): Promise<void> {
  await apiClient.post(`api/friends/requests/${requestId}/decline`);
}

export async function cancelFriendRequest(requestId: number): Promise<void> {
  await apiClient.delete(`api/friends/requests/${requestId}`);
}

export async function removeFriend(userId: number): Promise<void> {
  await apiClient.delete(`api/friends/${userId}`);
}
