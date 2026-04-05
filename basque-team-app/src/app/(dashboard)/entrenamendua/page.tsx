'use client';

import { useMemo } from 'react';
import {
  Calendar,
  Clock,
  Flame,
  Target,
  TrendingUp,
  Moon,
  Droplets,
  BedDouble,
  Activity,
  BarChart3,
} from 'lucide-react';
import { TRAINING_PLAN, TRAINING_GOALS } from '@/lib/data';
import type { TrainingDay } from '@/lib/types';

const INTENSITY_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  baxua: { label: 'Baxua', bg: 'bg-green-100', text: 'text-green-700' },
  ertaina: { label: 'Ertaina', bg: 'bg-blue-100', text: 'text-blue-700' },
  altua: { label: 'Altua', bg: 'bg-amber-100', text: 'text-amber-700' },
  'oso-altua': { label: 'Oso altua', bg: 'bg-red-100', text: 'text-red-700' },
};

const PERFORMANCE_WEEKS = [
  { week: '9. astea', pct: 72 },
  { week: '10. astea', pct: 78 },
  { week: '11. astea', pct: 65 },
  { week: '12. astea', pct: 82 },
  { week: '13. astea', pct: 88 },
  { week: '14. astea', pct: 75 },
  { week: '15. astea', pct: 91 },
  { week: '16. astea', pct: 85 },
];

function barColor(pct: number): string {
  if (pct >= 85) return 'bg-green-500';
  if (pct >= 70) return 'bg-blue-500';
  if (pct >= 55) return 'bg-amber-500';
  return 'bg-red-500';
}

function progressColor(pct: number): string {
  if (pct >= 90) return 'bg-green-500';
  if (pct >= 60) return 'bg-blue-500';
  if (pct >= 30) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function EntrenamenduaPage() {
  const summary = useMemo(() => {
    let totalMinutes = 0;
    let sessionCount = 0;
    const intensityValues: number[] = [];
    const intensityMap: Record<string, number> = { baxua: 1, ertaina: 2, altua: 3, 'oso-altua': 4 };

    TRAINING_PLAN.forEach((day: TrainingDay) => {
      day.sessions.forEach((s) => {
        sessionCount++;
        const mins = parseInt(s.duration);
        if (!isNaN(mins)) totalMinutes += mins;
        intensityValues.push(intensityMap[s.intensity] || 0);
      });
    });

    const avgIntensity =
      intensityValues.length > 0
        ? intensityValues.reduce((a, b) => a + b, 0) / intensityValues.length
        : 0;

    let avgLabel = 'Baxua';
    if (avgIntensity >= 3.5) avgLabel = 'Oso altua';
    else if (avgIntensity >= 2.5) avgLabel = 'Altua';
    else if (avgIntensity >= 1.5) avgLabel = 'Ertaina';

    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      sessionCount,
      avgIntensityLabel: avgLabel,
    };
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Entrenamendua</h1>
        <p className="text-gray-500 mt-1">Asteko entrenamendu plana eta jarraipena</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Ordu guztira</div>
            <div className="text-xl font-bold text-gray-900">{summary.totalHours}h</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center">
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Saio kopurua</div>
            <div className="text-xl font-bold text-gray-900">{summary.sessionCount}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-amber-100 flex items-center justify-center">
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Batez besteko intentsitatea</div>
            <div className="text-xl font-bold text-gray-900">{summary.avgIntensityLabel}</div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly plan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Asteko plana</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="space-y-3 min-w-[600px]">
              {TRAINING_PLAN.map((day) => (
                <div key={day.day} className="border border-gray-100 rounded-lg">
                  <div className="px-4 py-2.5 bg-gray-50 rounded-t-lg">
                    <span className="font-semibold text-gray-800 text-sm">{day.day}</span>
                  </div>
                  {day.sessions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400 italic">
                      Atsedena
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {day.sessions.map((session, idx) => {
                        const style = INTENSITY_STYLES[session.intensity];
                        return (
                          <div
                            key={idx}
                            className="px-4 py-2.5 flex items-center gap-4 text-sm"
                          >
                            <span className="text-gray-500 w-12 shrink-0 font-mono">
                              {session.time}
                            </span>
                            <span className="text-gray-900 flex-1 font-medium">
                              {session.activity}
                            </span>
                            <span className="text-gray-500 w-16 shrink-0 text-right">
                              {session.duration}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} w-20 text-center shrink-0`}
                            >
                              {style.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Errendimendu grafikoa</h2>
          </div>
          <div className="flex items-end gap-3 h-48">
            {PERFORMANCE_WEEKS.map((w) => (
              <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-gray-700">{w.pct}%</span>
                <div className="w-full bg-gray-100 rounded-t-md relative" style={{ height: '140px' }}>
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-t-md transition-all ${barColor(w.pct)}`}
                    style={{ height: `${(w.pct / 100) * 140}px` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 text-center leading-tight">
                  {w.week}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Helburuak</h2>
          </div>
          <div className="space-y-4">
            {TRAINING_GOALS.map((goal) => {
              const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-medium text-gray-800">{goal.title}</span>
                    <span className="text-xs text-gray-500">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${progressColor(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-right mt-0.5">
                    <span className="text-[11px] text-gray-400">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rest and recovery */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <BedDouble className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">Atseden eta errekuperazioa</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Recovery status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">Errekuperazio egoera</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                Ona
              </span>
            </div>

            {/* Sleep */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">Lo orduak (bb.)</span>
              </div>
              <span className="text-xl font-bold text-gray-900">7.5h</span>
            </div>

            {/* Stress */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">Estres maila</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                Ertaina
              </span>
            </div>

            {/* Next rest */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">Hurrengo atseden eguna</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">Igandea</span>
            </div>

            {/* Hydration */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">Hidratazioa</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                Gutxienez 3L eguneko
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
