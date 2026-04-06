'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  Clock,
  Plus,
  X,
} from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { CALENDAR_EVENTS } from '@/lib/data';
import type { CalendarEvent } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

const HILABETEAK = [
  'Urtarrila',
  'Otsaila',
  'Martxoa',
  'Apirila',
  'Maiatza',
  'Ekaina',
  'Uztaila',
  'Abuztua',
  'Iraila',
  'Urria',
  'Azaroa',
  'Abendua',
];

const EGUNAK = ['Al', 'Ar', 'Az', 'Og', 'Or', 'La', 'Ig'];

const EVENT_COLORS: Record<CalendarEvent['type'], string> = {
  entrenamendua: 'bg-green-500',
  lehiaketa: 'bg-red-500',
  medikua: 'bg-blue-500',
  bilera: 'bg-amber-500',
  ekitaldia: 'bg-purple-500',
};

const EVENT_BADGE_STYLES: Record<CalendarEvent['type'], string> = {
  entrenamendua: 'bg-green-100 text-green-700',
  lehiaketa: 'bg-red-100 text-red-700',
  medikua: 'bg-blue-100 text-blue-700',
  bilera: 'bg-amber-100 text-amber-700',
  ekitaldia: 'bg-purple-100 text-purple-700',
};

const EVENT_TYPE_LABELS: Record<CalendarEvent['type'], string> = {
  entrenamendua: 'Entrenamendua',
  lehiaketa: 'Lehiaketa',
  medikua: 'Medikua',
  bilera: 'Bilera',
  ekitaldia: 'Ekitaldia',
};

export default function EgutegiaPage() {
  const { isAdmin } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 3, 5));
  const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'entrenamendua' as CalendarEvent['type'],
    description: '',
  });

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const selectedDayEvents = useMemo(() => {
    return events.filter((ev) =>
      isSameDay(new Date(ev.date), selectedDate)
    );
  }, [events, selectedDate]);

  const getEventsForDay = (day: Date) => {
    return events.filter((ev) => isSameDay(new Date(ev.date), day));
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => {
    const today = new Date(2026, 3, 5);
    setCurrentMonth(startOfMonth(today));
    setSelectedDate(today);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    const event: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time || undefined,
      location: newEvent.location || undefined,
      type: newEvent.type,
      description: newEvent.description || undefined,
    };
    setEvents((prev) => [...prev, event]);
    setNewEvent({
      title: '',
      date: '',
      time: '',
      location: '',
      type: 'entrenamendua',
      description: '',
    });
    setShowModal(false);
  };

  // Build rows of 7
  const weeks: Date[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Egutegia</h1>
            <p className="text-sm text-gray-500">Gertaerak eta jarduerak</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Gertaera gehitu
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Grid */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Month navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {HILABETEAK[currentMonth.getMonth()]}{' '}
                  {currentMonth.getFullYear()}
                </h2>
                <button
                  onClick={handleToday}
                  className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                >
                  Gaur
                </button>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Day names header */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {EGUNAK.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {weeks.map((week, wi) =>
                week.map((day, di) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={`${wi}-${di}`}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative min-h-[80px] p-2 border-b border-r border-gray-100 text-left transition-colors
                        ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}
                        ${isSelected ? 'bg-red-50 ring-2 ring-inset ring-red-500' : ''}
                      `}
                    >
                      <span
                        className={`
                          inline-flex items-center justify-center w-7 h-7 text-sm rounded-full
                          ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                          ${isTodayDate ? 'bg-red-600 text-white font-bold' : ''}
                          ${isSelected && !isTodayDate ? 'font-semibold text-red-600' : ''}
                        `}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayEvents.length > 0 && isCurrentMonth && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <span
                              key={ev.id}
                              className={`w-2 h-2 rounded-full ${EVENT_COLORS[ev.type]}`}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[10px] text-gray-400">
                              +{dayEvents.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 px-2">
            {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${EVENT_COLORS[type as CalendarEvent['type']]}`}
                />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events panel */}
        <div className="lg:w-80 xl:w-96">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-1">
              Eguneko gertaerak
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {format(selectedDate, 'yyyy-MM-dd') ===
              format(new Date(2026, 3, 5), 'yyyy-MM-dd')
                ? 'Gaur'
                : `${selectedDate.getFullYear()}/${String(selectedDate.getMonth() + 1).padStart(2, '0')}/${String(selectedDate.getDate()).padStart(2, '0')}`}
              {' - '}
              {HILABETEAK[selectedDate.getMonth()]}{' '}
              {selectedDate.getDate()},{' '}
              {selectedDate.getFullYear()}
            </p>

            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-10">
                <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">
                  Ez dago gertaerarik egun honetan
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {ev.title}
                      </h4>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${EVENT_BADGE_STYLES[ev.type]}`}
                      >
                        {EVENT_TYPE_LABELS[ev.type]}
                      </span>
                    </div>
                    {ev.time && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        {ev.time}
                      </div>
                    )}
                    {ev.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {ev.location}
                      </div>
                    )}
                    {ev.description && (
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {ev.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add event modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Gertaera gehitu
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
                  Izenburua
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Gertaeraren izenburua"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Data
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ordua
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent((prev) => ({ ...prev, time: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kokapena
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Gertaeraren kokapena"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mota
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      type: e.target.value as CalendarEvent['type'],
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                >
                  {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Deskribapena
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Gertaeraren deskribapena"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Utzi
                </button>
                <button
                  onClick={handleAddEvent}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                >
                  Gorde
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
