// src/features/media/api.ts
import { apiClient } from "@/lib/api/client";
import {
  type ConfirmResponse,
  type PresignRequest,
  type PresignResponse,
  type StatusResponse,
  confirmResponseSchema,
  presignResponseSchema,
  statusResponseSchema,
} from "./schemas";

export async function requestPresign(input: PresignRequest): Promise<PresignResponse> {
  const json = await apiClient.post("api/upload/presign", { json: input }).json<unknown>();
  return presignResponseSchema.parse(json);
}

export async function confirmUpload(key: string): Promise<ConfirmResponse> {
  const json = await apiClient
    .post("api/upload/confirm", { json: { key } })
    .json<unknown>();
  return confirmResponseSchema.parse(json);
}

export async function fetchUploadStatus(key: string): Promise<StatusResponse> {
  const json = await apiClient
    .get(`api/upload/${encodeURIComponent(key)}/status`)
    .json<unknown>();
  return statusResponseSchema.parse(json);
}
