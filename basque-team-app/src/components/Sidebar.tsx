'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Bell,
  BookOpen,
  UserCircle,
  ClipboardList,
  FileText,
  FlaskConical,
  Dumbbell,
  Briefcase,
  Users,
  Settings,
  Stethoscope,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[] | 'all';
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Aginte-panela',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: 'all',
  },
  { label: 'Egutegia', href: '/egutegia', icon: Calendar, roles: 'all' },
  {
    label: 'Jakinarazpenak',
    href: '/jakinarazpenak',
    icon: Bell,
    roles: 'all',
  },
  {
    label: 'Baliabideak',
    href: '/baliabideak',
    icon: BookOpen,
    roles: 'all',
  },
  // kirolaria
  {
    label: 'Nire profila',
    href: '/profila',
    icon: UserCircle,
    roles: ['kirolaria'],
  },
  {
    label: 'Hitzorduak',
    href: '/hitzorduak',
    icon: ClipboardList,
    roles: ['kirolaria'],
  },
  {
    label: 'Dokumentuak',
    href: '/dokumentuak',
    icon: FileText,
    roles: ['kirolaria'],
  },
  {
    label: 'Probak',
    href: '/probak',
    icon: FlaskConical,
    roles: ['kirolaria'],
  },
  {
    label: 'Entrenamendua',
    href: '/entrenamendua',
    icon: Dumbbell,
    roles: ['kirolaria'],
  },
  {
    label: 'Laneratzea',
    href: '/laneratzea',
    icon: Briefcase,
    roles: ['kirolaria'],
  },
  // zuzendaritza
  {
    label: 'Kirolariak',
    href: '/kirolariak',
    icon: Users,
    roles: ['zuzendaritza'],
  },
  {
    label: 'Kudeaketa',
    href: '/kudeaketa',
    icon: Settings,
    roles: ['zuzendaritza'],
  },
  {
    label: 'Laneratzea',
    href: '/laneratzea',
    icon: Briefcase,
    roles: ['zuzendaritza'],
  },
  // medikua
  {
    label: 'Kirolariak',
    href: '/kirolariak',
    icon: Users,
    roles: ['medikua'],
  },
  {
    label: 'Hitzorduak',
    href: '/hitzorduak',
    icon: Stethoscope,
    roles: ['medikua'],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const filteredItems = NAV_ITEMS.filter(
    (item) => item.roles === 'all' || item.roles.includes(user.role)
  );

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLabels: Record<UserRole, string> = {
    kirolaria: 'Kirolaria',
    zuzendaritza: 'Zuzendaritza',
    medikua: 'Medikua',
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#0B1D3A] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">BT</span>
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide">Basque Team</div>
              <div className="text-[11px] text-white/50">Kirolari Gunea</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-red-500 rounded-r-full" />
                    )}
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User card + Logout */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-red-600/20 text-red-400 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-[11px] text-white/50">
                {roleLabels[user.role]}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Amaitu saioa
          </button>
        </div>
      </aside>
    </>
  );
}
