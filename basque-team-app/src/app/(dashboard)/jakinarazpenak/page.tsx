'use client';

import { useState, useMemo } from 'react';
import {
  Bell,
  BellRing,
  Info,
  AlertTriangle,
  Calendar,
  Heart,
  CheckCheck,
  Send,
  X,
  Filter,
} from 'lucide-react';
import { NOTIFICATIONS } from '@/lib/data';
import type { Notification } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

const TYPE_CONFIG: Record<
  Notification['type'],
  { icon: typeof Info; color: string; bg: string; label: string }
> = {
  info: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'Informazioa',
  },
  garrantzitsua: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-100',
    label: 'Garrantzitsua',
  },
  gertaera: {
    icon: Calendar,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    label: 'Gertaera',
  },
  medikua: {
    icon: Heart,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Medikua',
  },
};

const RECIPIENT_LABELS: Record<Notification['recipientType'], string> = {
  all: 'Guztiei',
  olimpiar: 'Kirolari olinpiarrei',
  paralinpiar: 'Kirolari paralinpiarrei',
};

function timeAgoEu(dateStr: string): string {
  const now = new Date('2026-04-05T12:00:00');
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMin < 1) return 'Oraintxe';
  if (diffMin < 60) return `Duela ${diffMin} minutu`;
  if (diffHours < 24) return `Duela ${diffHours} ordu`;
  if (diffDays < 7) return `Duela ${diffDays} egun`;
  return `Duela ${diffWeeks} aste`;
}

export default function JakinarazpenakPage() {
  const { isAdmin } = useAuth();
  const [notifications, setNotifications] =
    useState<Notification[]>(NOTIFICATIONS);
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type'],
    recipientType: 'all' as Notification['recipientType'],
  });

  const filteredNotifications = useMemo(() => {
    if (filterType === 'all') return notifications;
    return notifications.filter((n) => n.type === filterType);
  }, [notifications, filterType]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Jakinarazpen guztiak irakurri bezala markatu dira');
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.message) return;
    const notification: Notification = {
      id: `n-${Date.now()}`,
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type,
      recipientType: newNotification.recipientType,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notification, ...prev]);
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      recipientType: 'all',
    });
    setShowModal(false);
    showToast('Jakinarazpena bidali da');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Jakinarazpenak
            </h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0
                ? `${unreadCount} jakinarazpen irakurri gabe`
                : 'Jakinarazpen guztiak irakurrita'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Guztiak irakurri bezala markatu
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
              Jakinarazpena bidali
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-5">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
        >
          <option value="all">Mota guztiak</option>
          {Object.entries(TYPE_CONFIG).map(([value, cfg]) => (
            <option key={value} value={value}>
              {cfg.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <BellRing className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Ez dago jakinarazpenik</p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const config = TYPE_CONFIG[n.type];
            const Icon = config.icon;

            return (
              <button
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`
                  w-full text-left p-4 rounded-2xl border transition-colors
                  ${
                    n.read
                      ? 'bg-white border-gray-100 hover:bg-gray-50'
                      : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
                  }
                `}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.bg}`}
                  >
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`text-sm ${
                          n.read
                            ? 'font-normal text-gray-700'
                            : 'font-semibold text-gray-900'
                        }`}
                      >
                        {n.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {timeAgoEu(n.createdAt)}
                        </span>
                        {!n.read && (
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <span
                      className={`inline-block mt-2 text-[11px] font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Send notification modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Jakinarazpena bidali
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hartzaileak
                </label>
                <select
                  value={newNotification.recipientType}
                  onChange={(e) =>
                    setNewNotification((prev) => ({
                      ...prev,
                      recipientType: e.target
                        .value as Notification['recipientType'],
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                >
                  {Object.entries(RECIPIENT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Izenburua
                </label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) =>
                    setNewNotification((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Jakinarazpenaren izenburua"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mezua
                </label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) =>
                    setNewNotification((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  placeholder="Jakinarazpenaren mezua"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mota
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) =>
                    setNewNotification((prev) => ({
                      ...prev,
                      type: e.target.value as Notification['type'],
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                >
                  {Object.entries(TYPE_CONFIG).map(([value, cfg]) => (
                    <option key={value} value={value}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Utzi
                </button>
                <button
                  onClick={handleSendNotification}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                >
                  Bidali
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}
    </div>
  );
}
