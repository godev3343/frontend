// src/features/checkins/api.ts
import { apiClient } from "@/lib/api/client";

import {
  type CheckIn,
  checkinSchema,
  type CheckinsPage,
  checkinsPageSchema,
  type CreateCheckinInput,
  createCheckinSchema,
} from "./schemas";

export async function createCheckin(input: CreateCheckinInput): Promise<CheckIn> {
  const body = createCheckinSchema.parse(input);
  const data = await apiClient.post("api/checkins", { json: body }).json();
  return checkinSchema.parse(data);
}

export async function fetchFeed(cursor?: string | null): Promise<CheckinsPage> {
  const searchParams = cursor ? { cursor } : undefined;
  const data = await apiClient.get("api/feed", { searchParams }).json();
  return checkinsPageSchema.parse(data);
}

export async function fetchMyCheckins(cursor?: string | null): Promise<CheckinsPage> {
  const searchParams = cursor ? { cursor } : undefined;
  const data = await apiClient.get("api/checkins/me", { searchParams }).json();
  return checkinsPageSchema.parse(data);
}

export async function fetchPlaceCheckins(
  placeId: string,
  cursor?: string | null,
): Promise<CheckinsPage> {
  const searchParams = cursor ? { cursor } : undefined;
  const data = await apiClient
    .get(`api/places/${placeId}/checkins`, { searchParams })
    .json();
  return checkinsPageSchema.parse(data);
}

export async function likeCheckin(id: string): Promise<void> {
  await apiClient.post(`api/checkins/${id}/like`);
}

export async function unlikeCheckin(id: string): Promise<void> {
  await apiClient.delete(`api/checkins/${id}/like`);
}
