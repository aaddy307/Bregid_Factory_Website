'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuthStore } from '@/store/authStore';
import { restoreSession } from '@/services/auth';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, isLoading, setLoading } = useAuthStore();
  const router = useRouter();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const user = restoreSession();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role === 'manager') {
      router.push('/manager/dashboard');
      return;
    }
    if (user.role === 'worker') {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'owner') return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)} />
      <div className="lg:ml-60 min-h-screen flex flex-col transition-all duration-300">
        <Header title="Owner Panel" onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
