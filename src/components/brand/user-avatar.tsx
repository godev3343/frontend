// src/components/brand/user-avatar.tsx
import Image from 'next/image';

import { cn } from '@/lib/utils';

type UserAvatarProps = {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  active?: boolean;
  className?: string;
};

const SIZE_MAP = {
  sm: { box: 'size-8 text-xs', px: 32 },
  md: { box: 'size-10 text-sm', px: 40 },
  lg: { box: 'size-12 text-base', px: 48 },
  xl: { box: 'size-16 text-xl', px: 64 },
} as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function UserAvatar({ src, name, size = 'md', active, className }: UserAvatarProps) {
  const { box, px } = SIZE_MAP[size];

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-gray-800 font-semibold text-white',
        active && 'ring-offset-background ring-2 ring-primary ring-offset-2',
        box,
        className,
      )}
      aria-label={name}
    >
      {src ? (
        <Image src={src} alt={name} width={px} height={px} className="size-full object-cover" />
      ) : (
        <span aria-hidden>{getInitials(name)}</span>
      )}
    </div>
  );
}
