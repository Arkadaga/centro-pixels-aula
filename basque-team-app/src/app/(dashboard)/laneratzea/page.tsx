'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { COMPANIES, JOBS } from '@/lib/data';
import type { Job } from '@/lib/types';
import {
  Briefcase,
  Building2,
  MapPin,
  Globe,
  Mail,
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';

type Tab = 'enpresak' | 'lan-eskaintzak';

function getJobTypeBadge(type: Job['type']) {
  switch (type) {
    case 'osoa':
      return { label: 'Lanaldi osoa', className: 'bg-green-100 text-green-700' };
    case 'partziala':
      return { label: 'Lanaldi partziala', className: 'bg-blue-100 text-blue-700' };
    case 'praktikak':
      return { label: 'Praktikak', className: 'bg-purple-100 text-purple-700' };
    case 'urrunekoa':
      return { label: 'Urrunekoa', className: 'bg-amber-100 text-amber-700' };
  }
}

function getCompanyInitialColor(name: string) {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('eu-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function LaneratzeaPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('enpresak');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'enpresak', label: 'Enpresak' },
    { key: 'lan-eskaintzak', label: 'Lan-eskaintzak' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Briefcase className="h-8 w-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Laneratzea</h1>
        </div>
        <p className="max-w-2xl text-blue-100 text-sm sm:text-base">
          Kirolari profesionalentzako laneratzea programa. Hemen aurkituko dituzu
          gure kirolariengana hurbiltzen diren enpresen informazioa eta lan-eskaintza
          aktiboak, zure etorkizun profesionala eraikitzen laguntzeko.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button
            onClick={() =>
              activeTab === 'enpresak'
                ? setShowCompanyModal(true)
                : setShowJobModal(true)
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {activeTab === 'enpresak' ? 'Enpresa gehitu' : 'Lan-eskaintza gehitu'}
          </button>
        )}
      </div>

      {/* Companies Tab */}
      {activeTab === 'enpresak' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {COMPANIES.map((company) => (
            <div
              key={company.id}
              className="flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-white text-lg font-bold ${getCompanyInitialColor(company.name)}`}
                >
                  {company.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {company.name}
                  </h3>
                  <span className="text-xs text-gray-500">{company.sector}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 flex-1">{company.description}</p>
              {company.contactEmail && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{company.contactEmail}</span>
                </div>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  Webgunea ikusi
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'lan-eskaintzak' && (
        <div className="space-y-4">
          {JOBS.map((job) => {
            const badge = getJobTypeBadge(job.type);
            return (
              <div
                key={job.id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      {job.active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Aktiboa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          <XCircle className="h-3 w-3" />
                          Ez aktiboa
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job.companyName}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(job.publishedAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{job.description}</p>
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">
                          Baldintzak
                        </h4>
                        <ul className="space-y-0.5">
                          {job.requirements.map((req, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-1.5 text-sm text-gray-600"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      disabled={!job.active}
                      className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                        job.active
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Eskatu
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Company Modal (placeholder) */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Enpresa berria gehitu
              </h2>
              <button
                onClick={() => setShowCompanyModal(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowCompanyModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Izena
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enpresaren izena"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sektorea
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Adib.: Teknologia, Osasuna..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskribapena
                </label>
                <textarea
                  rows={3}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enpresaren deskribapena..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webgunea
                </label>
                <input
                  type="url"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kontaktu emaila
                </label>
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="kontaktua@enpresa.eus"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Utzi
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Gehitu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Job Modal (placeholder) */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Lan-eskaintza berria gehitu
              </h2>
              <button
                onClick={() => setShowJobModal(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowJobModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lanpostuaren izena
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Lanpostuaren izenburua"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enpresa
                </label>
                <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {COMPANIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kokalekua
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Hiria"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mota
                  </label>
                  <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="osoa">Lanaldi osoa</option>
                    <option value="partziala">Lanaldi partziala</option>
                    <option value="praktikak">Praktikak</option>
                    <option value="urrunekoa">Urrunekoa</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskribapena
                </label>
                <textarea
                  rows={3}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Lan-eskaintzaren deskribapena..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Utzi
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Gehitu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
