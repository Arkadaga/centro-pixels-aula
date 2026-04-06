'use client';

import { useMemo } from 'react';
import {
  User,
  Mail,
  Dumbbell,
  Award,
  Calendar,
  Activity,
  Apple,
  Clock,
  Target,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ATHLETES } from '@/lib/data';
import { AthleteType } from '@/lib/types';

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

const MOCK_SPORT_DATA = {
  discipline: 'Sprint 100m / 200m',
  category: 'Senior',
  trainingHoursWeek: 22,
  competitionsYear: 8,
};

const MOCK_ACHIEVEMENTS = [
  'Europako Txapelketa - Zilarra 2024',
  'Espainiako Txapelduna 2023',
  'Euskadiko Errekorra 100m 2023',
  'Unibertsitateen Arteko Txapelketa - Urrea 2022',
];

const MOCK_NUTRITION_PLAN = [
  {
    day: 'Astelehena',
    meals: 'Gosaria: Oloa + fruta | Bazkaria: Oilaskoa + arroza | Afaria: Arraina + barazkiak',
    kcal: 2800,
    protein: 140,
    carbs: 350,
    fat: 80,
  },
  {
    day: 'Asteartea',
    meals: 'Gosaria: Tortilla + ogia | Bazkaria: Pasta + haragia | Afaria: Salata + legamia',
    kcal: 2600,
    protein: 130,
    carbs: 320,
    fat: 75,
  },
  {
    day: 'Asteazkena',
    meals: 'Gosaria: Yogurta + fruitua | Bazkaria: Arroza + arraina | Afaria: Zopa + ogia',
    kcal: 2900,
    protein: 145,
    carbs: 360,
    fat: 85,
  },
  {
    day: 'Osteguna',
    meals: 'Gosaria: Smoothiea | Bazkaria: Lekaleak + arroza | Afaria: Oilaskoa + salata',
    kcal: 2500,
    protein: 125,
    carbs: 300,
    fat: 70,
  },
  {
    day: 'Ostirala',
    meals: 'Gosaria: Oloa + esne landarea | Bazkaria: Haragia + patata | Afaria: Arraina + menestra',
    kcal: 3000,
    protein: 150,
    carbs: 370,
    fat: 90,
  },
];

export default function ProfilaPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'zuzendaritza';

  const athleteRecord = useMemo(() => {
    if (!user) return null;
    return ATHLETES.find(
      (a) =>
        a.name.toLowerCase() === user.name.toLowerCase() ||
        a.name.split(' ')[0].toLowerCase() === user.name.split(' ')[0].toLowerCase()
    ) || null;
  }, [user]);

  const athleteType: AthleteType = athleteRecord?.type || user?.athleteType || 'olimpiar';
  const achievements = athleteRecord?.achievements?.length
    ? athleteRecord.achievements
    : MOCK_ACHIEVEMENTS;
  const becaYear = athleteRecord?.becaYear || 2022;
  const sportEu = athleteRecord?.sportEu || user?.sport || 'Atletismoa';

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Saioa hasi behar duzu profila ikusteko.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div
          className={`relative flex flex-col items-center bg-gradient-to-br ${
            isAdmin ? 'from-gray-700 to-gray-900' : GRADIENT_COLORS[athleteType]
          } px-6 py-12`}
        >
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/20 text-4xl font-bold text-white backdrop-blur-sm ring-4 ring-white/30">
            {getInitials(user.name)}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">{user.name}</h1>
          {!isAdmin && (
            <>
              <p className="mt-1 text-white/80">{sportEu}</p>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${TYPE_BADGE_COLORS[athleteType]}`}
                >
                  {TYPE_LABELS[athleteType]}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                  Beka {becaYear}
                </span>
              </div>
            </>
          )}
          {isAdmin && (
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                Zuzendaritza
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Personal data */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <User className="h-5 w-5 text-blue-600" />
            Datu pertsonalak
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Emaila</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            {!isAdmin && (
              <>
                <div className="flex items-center gap-3">
                  <Dumbbell className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Kirola</p>
                    <p className="text-sm font-medium text-gray-900">{sportEu}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Mota</p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE_COLORS[athleteType]}`}
                    >
                      {TYPE_LABELS[athleteType]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Beka urtea</p>
                    <p className="text-sm font-medium text-gray-900">{becaYear}</p>
                  </div>
                </div>
              </>
            )}
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Egoera</p>
                <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Aktibo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sport data (athletes only) / Admin info */}
        {!isAdmin ? (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Dumbbell className="h-5 w-5 text-green-600" />
              Kirol datuak
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Diziplina</p>
                  <p className="text-sm font-medium text-gray-900">{MOCK_SPORT_DATA.discipline}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Kategoria</p>
                  <p className="text-sm font-medium text-gray-900">{MOCK_SPORT_DATA.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Entrenamendu orduak/astea</p>
                  <p className="text-sm font-medium text-gray-900">
                    {MOCK_SPORT_DATA.trainingHoursWeek} ordu
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Lehiaketak/urtea</p>
                  <p className="text-sm font-medium text-gray-900">
                    {MOCK_SPORT_DATA.competitionsYear} lehiaketa
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Shield className="h-5 w-5 text-amber-600" />
              Administrazio datuak
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400">Rola</p>
                <p className="text-sm font-medium text-gray-900">Zuzendaritza</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Kudeatzeko baimena</p>
                <p className="text-sm font-medium text-gray-900">Guztiak</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Arduraduna noiztik</p>
                <p className="text-sm font-medium text-gray-900">2020</p>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        {!isAdmin && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Award className="h-5 w-5 text-amber-500" />
              Lorpenak
            </h2>
            {achievements.length > 0 ? (
              <ul className="space-y-2">
                {achievements.map((ach, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800"
                  >
                    <Award className="h-4 w-4 shrink-0 text-amber-500" />
                    {ach}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Oraindik ez da lorpenik erregistratu.</p>
            )}
          </div>
        )}

        {/* Nutrition plan */}
        {!isAdmin && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Apple className="h-5 w-5 text-green-500" />
              Elikadura plana
            </h2>
            <div className="space-y-3">
              {MOCK_NUTRITION_PLAN.map((day) => (
                <div key={day.day} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">{day.day}</h3>
                    <span className="text-xs text-gray-400">{day.kcal} kcal</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{day.meals}</p>
                  <div className="mt-2 flex gap-3">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                      P: {day.protein}g
                    </span>
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                      KH: {day.carbs}g
                    </span>
                    <span className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-700">
                      G: {day.fat}g
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
