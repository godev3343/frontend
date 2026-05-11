// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-page-gradient min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-6">{children}</div>
    </div>
  );
}
