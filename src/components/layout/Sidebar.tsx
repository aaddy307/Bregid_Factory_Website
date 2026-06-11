'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Package,
  Shirt,
  Warehouse,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Factory,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { logout } from '@/services/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: ('owner' | 'manager')[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    roles: ['owner', 'manager'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: <BarChart3 size={20} />,
    roles: ['owner'],
  },
  {
    label: 'Stock',
    href: '/stock',
    icon: <Warehouse size={20} />,
    roles: ['manager'],
  },
  {
    label: 'Catalog',
    href: '/catalog',
    icon: <Shirt size={20} />,
    roles: ['manager'],
  },
  {
    label: 'Users',
    href: '/users',
    icon: <Users size={20} />,
    roles: ['owner', 'manager'],
  },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role || 'manager';

  const filteredNavItems = navItems.filter((item) => (item.roles as readonly string[]).includes(role));

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-primary text-white">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-white/10">
        <Link href={`/${role}/dashboard`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-leather-tan/20 flex items-center justify-center">
            <Factory size={24} className="text-leather-tan" />
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-sm tracking-wider">BREGID FACTORY</div>
              <div className="text-[10px] text-white/60">Manufacturing System</div>
            </div>
          )}
        </Link>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-leather-tan/20 flex items-center justify-center text-xs font-bold text-leather-tan">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.name || 'User'}</div>
              <div className="text-[10px] text-white/60 truncate">{user?.email || ''}</div>
              <div className="mt-1">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  role === 'owner'
                    ? 'bg-leather-tan/20 text-leather-tan'
                    : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {role}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {!collapsed && (
          <div className="label-caps text-white/40 px-3 pb-2 text-[10px]">NAVIGATION</div>
        )}
        {filteredNavItems.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={`/${role}${item.href}`}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-leather-tan text-white font-medium'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle (Desktop) */}
      <div className="hidden lg:block px-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-full z-30 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
