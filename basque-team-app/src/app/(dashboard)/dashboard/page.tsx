'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Bell,
  CalendarDays,
  FileText,
  Users,
  ClipboardList,
  Activity,
  ChevronRight,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  ATHLETES,
  CALENDAR_EVENTS,
  NOTIFICATIONS,
  APPOINTMENTS,
  DOCUMENTS,
  RESOURCES,
} from '@/lib/data';

const EVENT_TYPE_LABELS: Record<string, string> = {
  entrenamendua: 'Entrenamendua',
  lehiaketa: 'Lehiaketa',
  medikua: 'Medikua',
  bilera: 'Bilera',
  ekitaldia: 'Ekitaldia',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  entrenamendua: 'bg-blue-100 text-blue-700',
  lehiaketa: 'bg-green-100 text-green-700',
  medikua: 'bg-red-100 text-red-700',
  bilera: 'bg-amber-100 text-amber-700',
  ekitaldia: 'bg-purple-100 text-purple-700',
};

const NOTIF_TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  garrantzitsua: 'bg-red-100 text-red-700',
  gertaera: 'bg-purple-100 text-purple-700',
  medikua: 'bg-emerald-100 text-emerald-700',
};

const NOTIF_TYPE_LABELS: Record<string, string> = {
  info: 'Info',
  garrantzitsua: 'Garrantzitsua',
  gertaera: 'Gertaera',
  medikua: 'Medikua',
};

const APPT_TYPE_LABELS: Record<string, string> = {
  biomedikoa: 'Biomedikoa',
  fisioterapia: 'Fisioterapia',
  psikologia: 'Psikologia',
  nutrizioa: 'Nutrizioa',
};

const STATUS_LABELS: Record<string, string> = {
  zain: 'Zain',
  berretsi: 'Berretsita',
  bukatua: 'Bukatua',
  ezeztatua: 'Ezeztatua',
};

const STATUS_COLORS: Record<string, string> = {
  zain: 'bg-yellow-100 text-yellow-700',
  berretsi: 'bg-green-100 text-green-700',
  bukatua: 'bg-gray-100 text-gray-700',
  ezeztatua: 'bg-red-100 text-red-700',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `Duela ${diffMins} minutu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Duela ${diffHours} ordu`;
  const diffDays = Math.floor(diffHours / 24);
  return `Duela ${diffDays} egun`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('eu-ES', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
}

const PERFORMANCE_DATA = [
  { week: '1. astea', value: 72 },
  { week: '2. astea', value: 78 },
  { week: '3. astea', value: 65 },
  { week: '4. astea', value: 85 },
  { week: '5. astea', value: 82 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'zuzendaritza';

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return CALENDAR_EVENTS
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, []);

  const latestNotifications = useMemo(() => {
    return [...NOTIFICATIONS]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3);
  }, []);

  const nextAppointment = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return APPOINTMENTS
      .filter((a) => a.date >= today && (a.status === 'berretsi' || a.status === 'zain'))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0] || null;
  }, []);

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  const monthEvents = useMemo(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return CALENDAR_EVENTS.filter((e) => e.date.startsWith(`${year}-${month}`)).length;
  }, []);

  const statsCards = isAdmin
    ? [
        {
          label: 'Kirolari guztiak',
          value: ATHLETES.length,
          icon: Users,
          color: 'border-blue-500',
          bgIcon: 'bg-blue-50 text-blue-600',
        },
        {
          label: 'Hitzordu zain',
          value: APPOINTMENTS.filter((a) => a.status === 'zain').length,
          icon: ClipboardList,
          color: 'border-amber-500',
          bgIcon: 'bg-amber-50 text-amber-600',
        },
        {
          label: 'Gertaera aktiboak',
          value: CALENDAR_EVENTS.length,
          icon: Activity,
          color: 'border-green-500',
          bgIcon: 'bg-green-50 text-green-600',
        },
        {
          label: 'Baliabide guztiak',
          value: RESOURCES.length,
          icon: FileText,
          color: 'border-purple-500',
          bgIcon: 'bg-purple-50 text-purple-600',
        },
      ]
    : [
        {
          label: 'Hurrengo hitzordua',
          value: nextAppointment
            ? `${nextAppointment.date.slice(5)} ${nextAppointment.time}`
            : 'Ez dago',
          icon: Calendar,
          color: 'border-blue-500',
          bgIcon: 'bg-blue-50 text-blue-600',
        },
        {
          label: 'Irakurri gabeko jakinarazpenak',
          value: unreadCount,
          icon: Bell,
          color: 'border-amber-500',
          bgIcon: 'bg-amber-50 text-amber-600',
        },
        {
          label: 'Hilabeteko gertaerak',
          value: monthEvents,
          icon: CalendarDays,
          color: 'border-green-500',
          bgIcon: 'bg-green-50 text-green-600',
        },
        {
          label: 'Dokumentu kopurua',
          value: DOCUMENTS.length,
          icon: FileText,
          color: 'border-purple-500',
          bgIcon: 'bg-purple-50 text-purple-600',
        },
      ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-blue-600 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Kaixo, {user?.name?.split(' ')[0] || 'Erabiltzailea'}!</h1>
        <p className="mt-1 text-blue-100">
          {isAdmin
            ? 'Ongi etorri kudeaketa panelera. Hemen duzun laburpena.'
            : 'Ongi etorri zure panel pertsonalera. Hona hemen zure laburpena.'}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border-l-4 ${stat.color} bg-white p-5 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${stat.bgIcon}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming events */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Hurrengo gertaerak</h2>
            <Link
              href="/egutegia"
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              Denak ikusi <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-gray-500">Ez dago hurrengo gertaerarik.</p>
            )}
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 rounded-lg border border-gray-100 p-3"
              >
                <div className="flex flex-col items-center rounded-lg bg-gray-50 px-3 py-2 text-center">
                  <span className="text-xs text-gray-500">
                    {formatDate(event.date).split(',')[0]}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {new Date(event.date + 'T00:00:00').getDate()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {event.time && <span>{event.time}</span>}
                    {event.location && <span> - {event.location}</span>}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${EVENT_TYPE_COLORS[event.type] || 'bg-gray-100 text-gray-700'}`}
                >
                  {EVENT_TYPE_LABELS[event.type] || event.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest notifications */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Azken jakinarazpenak</h2>
            <Link
              href="/jakinarazpenak"
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              Denak ikusi <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {latestNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`rounded-lg border p-3 ${!notif.read ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{notif.title}</p>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-gray-500">{notif.message}</p>
                  </div>
                  <span
                    className={`ml-2 shrink-0 rounded-full px-2 py-1 text-xs font-medium ${NOTIF_TYPE_COLORS[notif.type] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {NOTIF_TYPE_LABELS[notif.type] || notif.type}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  <Clock className="mr-1 inline h-3 w-3" />
                  {timeAgo(notif.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Next appointment */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Hurrengo hitzordua</h2>
            <Link
              href="/hitzorduak"
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              Denak ikusi <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          {nextAppointment ? (
            <div className="rounded-lg border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {APPT_TYPE_LABELS[nextAppointment.type] || nextAppointment.type}
                  </p>
                  <p className="text-sm text-gray-500">{nextAppointment.athleteName}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Data</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(nextAppointment.date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Ordua</p>
                  <p className="font-medium text-gray-900">{nextAppointment.time}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Egoera</p>
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[nextAppointment.status]}`}
                  >
                    {STATUS_LABELS[nextAppointment.status]}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Arrazoia</p>
                  <p className="text-sm text-gray-700">{nextAppointment.reason}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Ez daukazu hurrengo hitzordurik.</p>
          )}
        </div>

        {/* Performance chart */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Errendimendua</h2>
            <div className="flex items-center text-sm text-gray-500">
              <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              Azken 5 asteak
            </div>
          </div>
          <div className="flex items-end gap-3" style={{ height: 180 }}>
            {PERFORMANCE_DATA.map((item) => (
              <div key={item.week} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-700">{item.value}%</span>
                <div className="w-full rounded-t-md bg-gray-100" style={{ height: 140 }}>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400 transition-all"
                    style={{ height: `${(item.value / 100) * 140}px`, marginTop: `${140 - (item.value / 100) * 140}px` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{item.week}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
