// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-background flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}