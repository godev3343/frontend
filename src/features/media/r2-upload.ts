// src/features/media/r2-upload.ts
// Прямой PUT в R2 по presigned URL. Без auth-заголовков — подпись в URL.
// XHR, потому что нужен upload progress.

export type R2UploadProgress = (loaded: number, total: number) => void;

export type R2UploadOptions = {
  upload_url: string;
  file: File;
  content_type: string;
  // POST multipart fallback (если бэк вернул fields)
  fields?: Record<string, string>;
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

export function uploadToR2(opts: R2UploadOptions): Promise<void> {
  const { upload_url, file, content_type, fields, signal, on_progress } = opts;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const is_multipart = fields && Object.keys(fields).length > 0;

    xhr.open(is_multipart ? "POST" : "PUT", upload_url, true);

    if (!is_multipart) {
      // КРИТИЧНО: Content-Type должен совпадать с тем, что в presign,
      // иначе SigV4 подпись невалидна.
      xhr.setRequestHeader("Content-Type", content_type);
    }

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
    xhr.addEventListener("error", () => reject(new R2UploadError(0, "network error")));
    xhr.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));

    if (is_multipart) {
      const fd = new FormData();
      for (const [k, v] of Object.entries(fields!)) fd.append(k, v);
      fd.append("file", file);
      xhr.send(fd);
    } else {
      xhr.send(file);
    }
  });
}
