// src/app/(app)/feed/page.tsx
import { FeedList } from "@/features/checkins/components/feed-list";

export const metadata = { title: "Лента" };

export default function FeedPage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold">Лента</h1>
      <FeedList />
    </main>
  );
}
