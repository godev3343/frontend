// src/features/auth/logout-button.tsx
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { logout } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clear);
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      await logout();
    } finally {
      clearAuth();
      queryClient.clear();
      router.replace('/login');
    }
  }

  return (
    <Button variant="outline" onClick={handle} disabled={loading}>
      {loading ? 'Выходим...' : 'Выйти'}
    </Button>
  );
}