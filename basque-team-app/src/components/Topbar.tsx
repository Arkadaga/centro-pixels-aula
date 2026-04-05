'use client';

import { useRouter } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useAuth();
  const router = useRouter();

  const userInitials = user
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  // Hardcoded unread count for demo; in production this would come from data
  const unreadCount = 3;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: title */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Right: search, notifications, avatar */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Bilatu..."
              className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-56 transition-colors"
            />
          </div>

          {/* Notification bell */}
          <button
            onClick={() => router.push('/jakinarazpenak')}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Jakinarazpenak"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User avatar */}
          <button
            onClick={() => router.push('/profila')}
            className="w-9 h-9 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold hover:bg-red-700 transition-colors"
            aria-label="Profila"
          >
            {userInitials}
          </button>
        </div>
      </div>
    </header>
  );
}
