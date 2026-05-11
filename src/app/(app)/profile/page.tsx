// src/app/(app)/profile/page.tsx
import { Logo } from '@/components/brand/logo';
import { PointsBadge } from '@/components/brand/points-badge';
import { UserAvatar } from '@/components/brand/user-avatar';

export default function ProfilePage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <UserAvatar name="Demo User" size="xl" active />
        <div>
          <h1 className="text-2xl font-bold text-white">Demo User</h1>
          <PointsBadge points={42} variant="gradient" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Logo size="sm" />
        <p className="text-gray-400">EPIC 3 — реальный профиль</p>
      </div>
    </div>
  );
}
