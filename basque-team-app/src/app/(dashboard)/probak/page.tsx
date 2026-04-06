'use client';

import { useState, useEffect } from 'react';
import { Play, FileDown, StickyNote, FlaskConical, Dumbbell, Salad, Gauge } from 'lucide-react';
import { TEST_RECORDS } from '@/lib/data';
import { useAuth } from '@/lib/auth-context';
import type { TestRecord } from '@/lib/types';

const TYPE_CONFIG = {
  biomekanika: { label: 'Biomekanika', color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800', icon: Gauge },
  fisiologia: { label: 'Fisiologia', color: 'bg-green-500', badge: 'bg-green-100 text-green-800', icon: FlaskConical },
  indarrak: { label: 'Indarrak', color: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800', icon: Dumbbell },
  nutrizio: { label: 'Nutrizioa', color: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800', icon: Salad },
};

const YEARS = ['2024', '2025', '2026'];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('eu-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ProbakPage() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filtered = TEST_RECORDS
    .filter((r) => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (filterYear !== 'all' && !r.date.startsWith(filterYear)) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Proba historial</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Proba mota guztiak</option>
          <option value="biomekanika">Biomekanika</option>
          <option value="fisiologia">Fisiologia</option>
          <option value="indarrak">Indarrak</option>
          <option value="nutrizio">Nutrizioa</option>
        </select>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Urte guztiak</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FlaskConical className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Ez dago probarik iragazki hauekin</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {filtered.map((record) => {
              const conf = TYPE_CONFIG[record.type];
              const TypeIcon = conf.icon;

              return (
                <div key={record.id} className="relative flex gap-4 pl-0">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0 mt-1">
                    <div className={`w-8 h-8 rounded-full ${conf.color} flex items-center justify-center`}>
                      <TypeIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{record.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${conf.badge}`}>
                        {conf.label}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">{formatDate(record.date)}</p>

                    {record.results && (
                      <div className="bg-gray-50 rounded-md p-3 mb-3">
                        <p className="text-sm text-gray-700 font-mono">{record.results}</p>
                      </div>
                    )}

                    {/* Action links */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {record.videoUrl && (
                        <a
                          href={record.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1.5 rounded-md hover:bg-red-100 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Bideoa ikusi
                        </a>
                      )}
                      {record.fileUrl && (
                        <a
                          href={record.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          PDF deskargatu
                        </a>
                      )}
                    </div>

                    {record.notes && (
                      <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-2">
                        <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <p>{record.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
