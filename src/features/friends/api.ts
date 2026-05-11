// src/features/friends/api.ts
import { apiClient } from "@/lib/api/client";

import {
  type Friendship,
  friendshipSchema,
  type Paginated,
  paginatedSchema,
  type ProfileEditInput,
  type PublicUser,
  publicUserSchema,
  type UserProfile,
  userProfileSchema,
} from "./schemas";

/**
 * Контракт с бэком (согласован под Django-модель Friendship):
 *
 *   GET    /api/users/{id}                          → UserProfile
 *   PATCH  /api/users/me                            → User (со снейк-кейсом)
 *   GET    /api/users/search?q=&cursor=             → Paginated<PublicUser>
 *   GET    /api/friends?cursor=                     → Paginated<Friendship>
 *   GET    /api/friends/requests/incoming?cursor=   → Paginated<Friendship>
 *   GET    /api/friends/requests/outgoing?cursor=   → Paginated<Friendship>
 *   POST   /api/friends/requests   {to_user_id}     → Friendship
 *   POST   /api/friends/requests/{id}/accept        → Friendship
 *   POST   /api/friends/requests/{id}/decline       → 204
 *   DELETE /api/friends/requests/{id}               → 204    (отмена исходящей)
 *   DELETE /api/friends/{user_id}                   → 204    (расфрендить)
 *
 * Если бэк отдаст другие пути — правим ТОЛЬКО этот файл,
 * хуки и компоненты не трогаем.
 */

export async function fetchUserProfile(userId: number): Promise<UserProfile> {
  const data = await apiClient.get(`api/users/${userId}`).json();
  return userProfileSchema.parse(data);
}

export async function updateMe(input: ProfileEditInput) {
  // Импортируем тут чтобы не было кругового импорта с features/auth
  const { userSchema } = await import("@/features/auth/schemas");
  const data = await apiClient.patch("api/users/me", { json: input }).json();
  return userSchema.parse(data);
}

export async function searchUsers(
  query: string,
  cursor?: string,
): Promise<Paginated<PublicUser>> {
  const searchParams = new URLSearchParams({ q: query });
  if (cursor) searchParams.set("cursor", cursor);

  const data = await apiClient.get(`api/users/search?${searchParams}`).json();
  return paginatedSchema(publicUserSchema).parse(data);
}

export async function fetchFriends(cursor?: string): Promise<Paginated<Friendship>> {
  const url = cursor ? `api/friends?cursor=${cursor}` : "api/friends";
  const data = await apiClient.get(url).json();
  return paginatedSchema(friendshipSchema).parse(data);
}

export async function fetchIncomingRequests(
  cursor?: string,
): Promise<Paginated<Friendship>> {
  const url = cursor
    ? `api/friends/requests/incoming?cursor=${cursor}`
    : "api/friends/requests/incoming";
  const data = await apiClient.get(url).json();
  return paginatedSchema(friendshipSchema).parse(data);
}

export async function fetchOutgoingRequests(
  cursor?: string,
): Promise<Paginated<Friendship>> {
  const url = cursor
    ? `api/friends/requests/outgoing?cursor=${cursor}`
    : "api/friends/requests/outgoing";
  const data = await apiClient.get(url).json();
  return paginatedSchema(friendshipSchema).parse(data);
}

export async function sendFriendRequest(toUserId: number): Promise<Friendship> {
  const data = await apiClient
    .post("api/friends/requests", { json: { to_user_id: toUserId } })
    .json();
  return friendshipSchema.parse(data);
}

export async function acceptFriendRequest(requestId: number): Promise<Friendship> {
  const data = await apiClient.post(`api/friends/requests/${requestId}/accept`).json();
  return friendshipSchema.parse(data);
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