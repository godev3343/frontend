// src/features/map/schemas.ts
import { z } from "zod/v4";

export const vibeSchema = z.enum([
  "calm",
  "active",
  "productive",
  "romantic",
  "musical",
  "gaming",
  "networking",
]);
export type Vibe = z.infer<typeof vibeSchema>;

export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type Location = z.infer<typeof locationSchema>;

/** Bbox: [lngMin, latMin, lngMax, latMax] */
export const bboxSchema = z.tuple([z.number(), z.number(), z.number(), z.number()]);
export type Bbox = z.infer<typeof bboxSchema>;

export const placeMarkerSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: locationSchema,
  primary_vibe: vibeSchema,
  category: z.string().nullable().default(null),
});
export type PlaceMarker = z.infer<typeof placeMarkerSchema>;

export const placeVibeSchema = z.object({
  vibe: vibeSchema,
  weight: z.number().min(0).max(1),
});

export const placePhotoSchema = z.object({
  url: z.string().url(),
  feed_url: z.string().url().nullable().default(null),
});

export const placeDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: locationSchema,
  primary_vibe: vibeSchema,
  vibes: z.array(placeVibeSchema).default([]),
  category: z.string().nullable().default(null),
  address: z.string().nullable().default(null),
  hours: z.string().nullable().default(null),
  description: z.string().nullable().default(null),
  photos: z.array(placePhotoSchema).default([]),
});
export type PlaceDetail = z.infer<typeof placeDetailSchema>;

export const placesPageSchema = z.object({
  results: z.array(placeMarkerSchema),
  next: z.string().nullable().default(null),
  previous: z.string().nullable().default(null),
});
export type PlacesPage = z.infer<typeof placesPageSchema>;
