'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLoginPage } from '@/components/AdminLoginPage';
import { useAuth } from '@/lib/auth-context';

export default function AdminHome() {
  const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && session) {
      router.replace('/users');
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  return <AdminLoginPage />;
}
