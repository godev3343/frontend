// src/app/(auth)/loading.tsx
export default function AuthLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div
        className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent"
        role="status"
        aria-label="Загрузка"
      />
    </div>
  );
}
