'use client';

import { useState, useEffect } from 'react';
import { Activity, Heart, Brain, Apple, Plus, X, Check, XCircle, Clock, Calendar } from 'lucide-react';
import { APPOINTMENTS } from '@/lib/data';
import { useAuth } from '@/lib/auth-context';
import type { Appointment } from '@/lib/types';

const TYPE_CONFIG = {
  biomedikoa: { icon: Activity, label: 'Biomedikoa', color: 'text-blue-600' },
  fisioterapia: { icon: Heart, label: 'Fisioterapia', color: 'text-red-500' },
  psikologia: { icon: Brain, label: 'Psikologia', color: 'text-purple-600' },
  nutrizioa: { icon: Apple, label: 'Nutrizioa', color: 'text-green-600' },
};

const STATUS_CONFIG = {
  zain: { label: 'Zain', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  berretsi: { label: 'Berretsi', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  bukatua: { label: 'Bukatua', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  ezeztatua: { label: 'Ezeztatua', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

const TABS: { key: Appointment['status']; label: string }[] = [
  { key: 'zain', label: 'Zain' },
  { key: 'berretsi', label: 'Berretsi' },
  { key: 'bukatua', label: 'Bukatua' },
  { key: 'ezeztatua', label: 'Ezeztatua' },
];

const TIME_SLOTS: string[] = [];
for (let h = 9; h <= 17; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}
TIME_SLOTS.push('18:00');

export default function HitzorduakPage() {
  const { user, isAdmin, isMedical } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [activeTab, setActiveTab] = useState<Appointment['status']>('zain');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formType, setFormType] = useState<Appointment['type']>('biomedikoa');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('09:00');
  const [formReason, setFormReason] = useState('');

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const canManage = isAdmin || isMedical;

  const filtered = appointments.filter((a) => {
    if (!canManage && user) {
      if (a.athleteId !== user.id) return false;
    }
    return a.status === activeTab;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formReason) return;

    const newAppointment: Appointment = {
      id: `ap-${Date.now()}`,
      athleteId: user?.id || '',
      athleteName: user?.name || '',
      type: formType,
      date: formDate,
      time: formTime,
      status: 'zain',
      reason: formReason,
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    setShowModal(false);
    setFormType('biomedikoa');
    setFormDate('');
    setFormTime('09:00');
    setFormReason('');
    setToast('Hitzordua ondo eskatu da');
  };

  const handleApprove = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'berretsi' as const } : a))
    );
    setToast('Hitzordua berretsi da');
  };

  const handleReject = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ezeztatua' as const } : a))
    );
    setToast('Hitzordua ezeztatu da');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hitzorduak</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Hitzordua eskatu
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Ez dago hitzordurik egoera honetan</p>
          </div>
        ) : (
          filtered.map((apt) => {
            const typeConf = TYPE_CONFIG[apt.type];
            const statusConf = STATUS_CONFIG[apt.status];
            const TypeIcon = typeConf.icon;

            return (
              <div
                key={apt.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-gray-50 ${typeConf.color}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900">{typeConf.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}>
                        {statusConf.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {apt.time}
                      </span>
                    </div>
                    {canManage && (
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        Kirolaria: {apt.athleteName}
                      </p>
                    )}
                    {apt.reason && (
                      <p className="text-sm text-gray-600">{apt.reason}</p>
                    )}
                  </div>
                  {canManage && apt.status === 'zain' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(apt.id)}
                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Berretsi"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(apt.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Ezeztatu"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Hitzordua eskatu</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mota</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as Appointment['type'])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="biomedikoa">Biomedikoa</option>
                  <option value="fisioterapia">Fisioterapia</option>
                  <option value="psikologia">Psikologia</option>
                  <option value="nutrizioa">Nutrizioa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordua</label>
                <select
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrazoia</label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="Idatzi hitzorduaren arrazoia..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Eskatu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
