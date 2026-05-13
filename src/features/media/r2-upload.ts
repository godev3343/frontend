// src/features/media/r2-upload.ts
// Прямой PUT в R2 по presigned URL. Без auth-заголовков — подпись в URL.
// XHR, потому что нужен upload progress (fetch его не даёт).

export type R2UploadProgress = (loaded: number, total: number) => void;

export type R2UploadOptions = {
  upload_url: string;
  file: File;
  content_type: string;
  signal?: AbortSignal;
  on_progress?: R2UploadProgress;
};

export class R2UploadError extends Error {
  public status: number;
  public response_text: string;
  constructor(status: number, response_text: string) {
    super(`R2 upload failed: ${status}`);
    this.status = status;
    this.response_text = response_text;
  }
}

/**
 * R2 presigned URL — SigV4 на PUT. Content-Type ОБЯЗАН совпадать ровно с тем,
 * который заявлен в presign-запросе на бэк, иначе подпись невалидна → 403.
 */
export function uploadToR2(opts: R2UploadOptions): Promise<void> {
  const { upload_url, file, content_type, signal, on_progress } = opts;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", upload_url, true);
    xhr.setRequestHeader("Content-Type", content_type);

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    if (on_progress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) on_progress(e.loaded, e.total);
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new R2UploadError(xhr.status, xhr.responseText));
    });
    xhr.addEventListener("error", () =>
      reject(new R2UploadError(0, "network error — check R2 CORS for PUT + Content-Type")),
    );
    xhr.addEventListener("abort", () =>
      reject(new DOMException("Aborted", "AbortError")),
    );

    xhr.send(file);
  });
}
