# R2 CORS — что должно стоять на бакете

Без этого PUT с фронта будет падать на preflight (OPTIONS) или 403.

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://<prod-domain>"],
    "AllowedMethods": ["PUT", "POST", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type", "x-amz-*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Применение: Cloudflare Dashboard → R2 → bucket → Settings → CORS Policy.
Или через `wrangler r2 bucket cors put <bucket> --file=cors.json`.

**Если 403 на PUT:**
1. CORS не настроен или origin не в списке.
2. `Content-Type` в PUT не совпадает с тем, что в presign — SigV4 не сходится.
3. Прислали `Authorization` поверх подписанного URL — лишний хедер ломает подпись.
4. URL протух (`expires_at` в прошлом).
