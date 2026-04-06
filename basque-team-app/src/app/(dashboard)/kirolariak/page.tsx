'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X, Trophy, Award } from 'lucide-react';
import { ATHLETES } from '@/lib/data';
import { Athlete, AthleteType } from '@/lib/types';

const TYPE_LABELS: Record<AthleteType, string> = {
  olimpiar: 'Olinpiar',
  paralinpiar: 'Paralinpiar',
};

const TYPE_BADGE_COLORS: Record<AthleteType, string> = {
  olimpiar: 'bg-blue-100 text-blue-700',
  paralinpiar: 'bg-purple-100 text-purple-700',
};

const GRADIENT_COLORS: Record<AthleteType, string> = {
  olimpiar: 'from-blue-500 to-blue-700',
  paralinpiar: 'from-purple-500 to-purple-700',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function KirolariakPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | AthleteType>('');
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  const uniqueSports = useMemo(() => {
    const sports = new Set(ATHLETES.map((a) => a.sportEu));
    return Array.from(sports).sort();
  }, []);

  const filteredAthletes = useMemo(() => {
    return ATHLETES.filter((athlete) => {
      const matchesSearch =
        searchQuery === '' ||
        athlete.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSport = sportFilter === '' || athlete.sportEu === sportFilter;
      const matchesType = typeFilter === '' || athlete.type === typeFilter;
      return matchesSearch && matchesSport && matchesType;
    });
  }, [searchQuery, sportFilter, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kirolariak</h1>
        <p className="mt-1 text-gray-500">Euskal kirol talentuen zerrenda</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Bilatu izenetik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Kirol guztiak</option>
            {uniqueSports.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as '' | AthleteType)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Mota guztiak</option>
            <option value="olimpiar">Olinpiar</option>
            <option value="paralinpiar">Paralinpiar</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">{filteredAthletes.length} kirolari</p>

      {/* Athletes grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAthletes.map((athlete) => (
          <button
            key={athlete.id}
            onClick={() => setSelectedAthlete(athlete)}
            className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md text-left"
          >
            {/* Gradient header */}
            <div
              className={`flex items-center justify-center bg-gradient-to-br ${GRADIENT_COLORS[athlete.type]} py-8`}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white backdrop-blur-sm">
                {getInitials(athlete.name)}
              </div>
            </div>

            {/* Card body */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {athlete.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{athlete.sportEu}</p>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_BADGE_COLORS[athlete.type]}`}
                >
                  {TYPE_LABELS[athlete.type]}
                </span>
                {athlete.achievements && athlete.achievements.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-amber-600">
                    <Trophy className="h-3.5 w-3.5" />
                    {athlete.achievements.length}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredAthletes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 shadow-sm">
          <Search className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">Ez da kirolarik aurkitu iragazki hauekin.</p>
        </div>
      )}

      {/* Athlete detail modal */}
      {selectedAthlete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedAthlete(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className={`relative flex flex-col items-center bg-gradient-to-br ${GRADIENT_COLORS[selectedAthlete.type]} px-6 py-10`}
            >
              <button
                onClick={() => setSelectedAthlete(null)}
                className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-3xl font-bold text-white backdrop-blur-sm">
                {getInitials(selectedAthlete.name)}
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">{selectedAthlete.name}</h2>
              <p className="mt-1 text-white/80">{selectedAthlete.sportEu}</p>
              <span
                className={`mt-3 rounded-full px-3 py-1 text-sm font-medium ${
                  selectedAthlete.type === 'olimpiar'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/20 text-white'
                }`}
              >
                {TYPE_LABELS[selectedAthlete.type]}
              </span>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                {selectedAthlete.hometown && (
                  <div>
                    <p className="text-xs text-gray-400">Herria</p>
                    <p className="font-medium text-gray-900">{selectedAthlete.hometown}</p>
                  </div>
                )}
                {selectedAthlete.birthYear && (
                  <div>
                    <p className="text-xs text-gray-400">Jaiotze urtea</p>
                    <p className="font-medium text-gray-900">{selectedAthlete.birthYear}</p>
                  </div>
                )}
                {selectedAthlete.becaYear && (
                  <div>
                    <p className="text-xs text-gray-400">Beka urtea</p>
                    <p className="font-medium text-gray-900">{selectedAthlete.becaYear}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400">Egoera</p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${selectedAthlete.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {selectedAthlete.active ? 'Aktibo' : 'Ez aktibo'}
                  </span>
                </div>
              </div>

              {/* Achievements */}
              {selectedAthlete.achievements && selectedAthlete.achievements.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Award className="h-4 w-4 text-amber-500" />
                    Lorpenak
                  </h3>
                  <ul className="space-y-2">
                    {selectedAthlete.achievements.map((ach, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800"
                      >
                        <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                        {ach}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(!selectedAthlete.achievements || selectedAthlete.achievements.length === 0) && (
                <p className="text-sm text-gray-400">Oraindik ez du lorpenik erregistratuta.</p>
              )}

              {/* Close button */}
              <button
                onClick={() => setSelectedAthlete(null)}
                className="w-full rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Itxi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
