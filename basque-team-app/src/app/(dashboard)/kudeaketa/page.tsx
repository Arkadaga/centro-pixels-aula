'use client';

import { useState, useMemo } from 'react';
import {
  Users,
  CalendarCheck,
  Bell,
  Calendar,
  FolderOpen,
  Briefcase,
  Search,
  Check,
  X,
  Plus,
  Send,
  Building2,
  FileText,
  Video,
  BookOpen,
  Newspaper,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  ATHLETES,
  APPOINTMENTS,
  NOTIFICATIONS,
  EVENTS,
  RESOURCES,
  COMPANIES,
  JOBS,
} from '@/lib/data';
import type { Appointment } from '@/lib/types';

const TABS = [
  { id: 'kirolariak', label: 'Kirolariak', icon: Users },
  { id: 'hitzorduak', label: 'Hitzorduak', icon: CalendarCheck },
  { id: 'jakinarazpenak', label: 'Jakinarazpenak', icon: Bell },
  { id: 'gertaerak', label: 'Gertaerak', icon: Calendar },
  { id: 'baliabideak', label: 'Baliabideak', icon: FolderOpen },
  { id: 'laneratzea', label: 'Laneratzea', icon: Briefcase },
] as const;

type TabId = (typeof TABS)[number]['id'];

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  zain: { label: 'Zain', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  berretsi: { label: 'Berretsia', bg: 'bg-green-100', text: 'text-green-700' },
  bukatua: { label: 'Bukatua', bg: 'bg-gray-100', text: 'text-gray-600' },
  ezeztatua: { label: 'Ezeztatua', bg: 'bg-red-100', text: 'text-red-700' },
};

const TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  olimpiar: { label: 'Olimpiar', bg: 'bg-blue-100', text: 'text-blue-700' },
  paralinpiar: { label: 'Paralinpiar', bg: 'bg-purple-100', text: 'text-purple-700' },
};

const RESOURCE_ICON: Record<string, typeof FileText> = {
  pdf: FileText,
  bideo: Video,
  liburu: BookOpen,
  artikulu: Newspaper,
};

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  biomedikoa: 'Biomedikoa',
  fisioterapia: 'Fisioterapia',
  psikologia: 'Psikologia',
  nutrizioa: 'Nutrizioa',
};

export default function KudeaketaPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('kirolariak');
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);

  // Permission check
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Ez duzu baimenik</h1>
        <p className="text-gray-500 text-center max-w-md">
          Orrialde hau zuzendaritza rolerako bakarrik dago eskuragarri.
        </p>
      </div>
    );
  }

  // Athlete stats
  const athleteStats = {
    total: ATHLETES.length,
    olimpiar: ATHLETES.filter((a) => a.type === 'olimpiar').length,
    paralinpiar: ATHLETES.filter((a) => a.type === 'paralinpiar').length,
    active: ATHLETES.filter((a) => a.active).length,
  };

  // Filtered athletes
  const filteredAthletes = ATHLETES.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.sportEu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Appointment stats
  const apptStats = {
    pending: appointments.filter((a) => a.status === 'zain').length,
    confirmed: appointments.filter((a) => a.status === 'berretsi').length,
    completed: appointments.filter((a) => a.status === 'bukatua').length,
  };

  const handleApprove = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'berretsi' as const } : a))
    );
  };

  const handleReject = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ezeztatua' as const } : a))
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kudeaketa panela</h1>
        <p className="text-gray-500 mt-1">Kudeatu kirolariak, hitzorduak eta baliabideak</p>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {/* ===== KIROLARIAK ===== */}
        {activeTab === 'kirolariak' && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Guztira</div>
                <div className="text-2xl font-bold text-gray-900">{athleteStats.total}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Olimpiarrak</div>
                <div className="text-2xl font-bold text-blue-600">{athleteStats.olimpiar}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Paralinpiarrak</div>
                <div className="text-2xl font-bold text-purple-600">{athleteStats.paralinpiar}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Aktiboak</div>
                <div className="text-2xl font-bold text-green-600">{athleteStats.active}</div>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Bilatu izena edo kirola..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 font-semibold text-gray-600">Izena</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Kirola</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Mota</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Beka urtea</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Egoera</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAthletes.map((athlete) => {
                      const typeBadge = TYPE_BADGE[athlete.type];
                      return (
                        <tr key={athlete.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{athlete.name}</td>
                          <td className="px-4 py-3 text-gray-600">{athlete.sportEu}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadge.bg} ${typeBadge.text}`}
                            >
                              {typeBadge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{athlete.becaYear ?? '—'}</td>
                          <td className="px-4 py-3">
                            {athlete.active ? (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                Aktiboa
                              </span>
                            ) : (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                Ez aktiboa
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== HITZORDUAK ===== */}
        {activeTab === 'hitzorduak' && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Zain daudenak</div>
                <div className="text-2xl font-bold text-yellow-600">{apptStats.pending}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Berretsiak</div>
                <div className="text-2xl font-bold text-green-600">{apptStats.confirmed}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Bukatuak</div>
                <div className="text-2xl font-bold text-gray-600">{apptStats.completed}</div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 font-semibold text-gray-600">Kirolaria</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Mota</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Data</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Ordua</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Egoera</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Ekintzak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {appointments.map((appt) => {
                      const statusStyle = STATUS_STYLES[appt.status];
                      return (
                        <tr key={appt.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {appt.athleteName}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {APPOINTMENT_TYPE_LABELS[appt.type] ?? appt.type}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{appt.date}</td>
                          <td className="px-4 py-3 text-gray-600">{appt.time}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                            >
                              {statusStyle.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {appt.status === 'zain' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(appt.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Onartu
                                </button>
                                <button
                                  onClick={() => handleReject(appt.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Ukatu
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== JAKINARAZPENAK ===== */}
        {activeTab === 'jakinarazpenak' && (
          <div className="space-y-5">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">
              <Send className="w-4 h-4" />
              Jakinarazpena bidali
            </button>

            <div className="space-y-3">
              {NOTIFICATIONS.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                      notif.type === 'garrantzitsua'
                        ? 'bg-red-500'
                        : notif.type === 'medikua'
                        ? 'bg-blue-500'
                        : notif.type === 'gertaera'
                        ? 'bg-purple-500'
                        : 'bg-gray-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{notif.title}</span>
                      <span className="text-xs text-gray-400">{notif.createdAt}</span>
                    </div>
                    <p className="text-sm text-gray-600">{notif.message}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-400">Hartzailea:</span>
                      <span className="text-xs font-medium text-gray-600">
                        {notif.recipientType === 'all'
                          ? 'Guztiak'
                          : notif.recipientType === 'olimpiar'
                          ? 'Olimpiarrak'
                          : 'Paralinpiarrak'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== GERTAERAK ===== */}
        {activeTab === 'gertaerak' && (
          <div className="space-y-5">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">
              <Plus className="w-4 h-4" />
              Gertaera gehitu
            </button>

            <div className="space-y-3">
              {EVENTS.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4"
                >
                  <div
                    className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: event.color ?? '#6b7280' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{event.title}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {event.date} {event.time ? `- ${event.time}` : ''}
                    </div>
                    {event.location && (
                      <div className="text-sm text-gray-400 mt-0.5">{event.location}</div>
                    )}
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== BALIABIDEAK ===== */}
        {activeTab === 'baliabideak' && (
          <div className="space-y-5">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">
              <Plus className="w-4 h-4" />
              Baliabidea gehitu
            </button>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 font-semibold text-gray-600">Izenburua</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Mota</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Kategoria</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Gehitze data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {RESOURCES.map((res) => {
                      const ResIcon = RESOURCE_ICON[res.type] ?? FileText;
                      return (
                        <tr key={res.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <ResIcon className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{res.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 capitalize">{res.type}</td>
                          <td className="px-4 py-3 text-gray-600 capitalize">{res.category}</td>
                          <td className="px-4 py-3 text-gray-500">{res.addedAt}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== LANERATZEA ===== */}
        {activeTab === 'laneratzea' && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Enpresak</div>
                <div className="text-2xl font-bold text-gray-900">{COMPANIES.length}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-500">Lan eskaintzak</div>
                <div className="text-2xl font-bold text-gray-900">{JOBS.length}</div>
              </div>
            </div>

            {/* Companies */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Enpresak</h3>
              <div className="space-y-3">
                {COMPANIES.map((company) => (
                  <div
                    key={company.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">{company.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{company.sector}</div>
                      <p className="text-sm text-gray-600 mt-1">{company.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Jobs */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Lan eskaintzak</h3>
              <div className="space-y-3">
                {JOBS.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{job.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium capitalize">
                        {job.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {job.companyName} &middot; {job.location}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.requirements.map((req, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
