'use client';

import { Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const { user } = useAuthStore();
  const role = user?.role || 'manager';

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-outline-variant/40">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Hamburger + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={22} className="text-on-surface" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-on-surface">{title}</h1>
          </div>
        </div>

        {/* Right: Notifications + User */}
        <div className="flex items-center gap-4">

          {/* User Info */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-on-surface">{user?.name || 'User'}</div>
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                role === 'owner'
                  ? 'bg-leather-tan/10 text-leather-tan'
                  : 'bg-blue-500/10 text-blue-600'
              }`}>
                {role}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-leather-tan/10 flex items-center justify-center text-sm font-bold text-leather-tan">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
