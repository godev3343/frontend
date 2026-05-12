// src/features/checkins/schemas.ts
import { z } from "zod/v4";

import { placeMarkerSchema } from "@/features/map/schemas";

/** Урезанный профиль автора чек-ина — то, что приходит в feed/list */
export const checkinAuthorSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  avatar_url: z.string().url().nullable(),
});

export const checkinSchema = z.object({
  id: z.string(),
  place: placeMarkerSchema,
  author: checkinAuthorSchema,
  comment: z.string().nullable(),
  photo_url: z.string().url().nullable(),
  photo_feed_url: z.string().url().nullable(),
  created_at: z.string(),
  likes_count: z.number().int().nonnegative(),
  is_liked: z.boolean(),
  points_delta: z.number().int().optional(),
});

export const feedItemSchema = checkinSchema;

export const createCheckinSchema = z.object({
  place_id: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  photo_key: z.string().nullable().optional(),
  comment: z.string().max(500).nullable().optional(),
});

export const checkinsPageSchema = z.object({
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(checkinSchema),
});

export type CheckIn = z.infer<typeof checkinSchema>;
export type FeedItem = z.infer<typeof feedItemSchema>;
export type CreateCheckinInput = z.infer<typeof createCheckinSchema>;
export type CheckinsPage = z.infer<typeof checkinsPageSchema>;
