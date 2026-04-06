'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { RESOURCES } from '@/lib/data';
import type { Resource } from '@/lib/types';
import {
  FileText,
  Play,
  BookOpen,
  FileEdit,
  Plus,
  Download,
  ExternalLink,
  X,
  Search,
  Filter,
} from 'lucide-react';

const TYPE_OPTIONS: { value: Resource['type'] | ''; label: string }[] = [
  { value: '', label: 'Mota guztiak' },
  { value: 'pdf', label: 'PDF' },
  { value: 'bideo', label: 'Bideoa' },
  { value: 'liburu', label: 'Liburua' },
  { value: 'artikulu', label: 'Artikulua' },
];

const CATEGORY_OPTIONS: { value: Resource['category'] | ''; label: string }[] = [
  { value: '', label: 'Kategoria guztiak' },
  { value: 'entrenamendua', label: 'Entrenamendua' },
  { value: 'nutrizio', label: 'Nutrizioa' },
  { value: 'psikologia', label: 'Psikologia' },
  { value: 'fisioterapia', label: 'Fisioterapia' },
  { value: 'biomekanika', label: 'Biomekanika' },
];

function getTypeIcon(type: Resource['type']) {
  switch (type) {
    case 'pdf':
      return <FileText className="h-6 w-6" />;
    case 'bideo':
      return <Play className="h-6 w-6" />;
    case 'liburu':
      return <BookOpen className="h-6 w-6" />;
    case 'artikulu':
      return <FileEdit className="h-6 w-6" />;
  }
}

function getTypeColor(type: Resource['type']) {
  switch (type) {
    case 'pdf':
      return 'bg-red-100 text-red-700';
    case 'bideo':
      return 'bg-purple-100 text-purple-700';
    case 'liburu':
      return 'bg-blue-100 text-blue-700';
    case 'artikulu':
      return 'bg-green-100 text-green-700';
  }
}

function getCategoryColor(category: Resource['category']) {
  switch (category) {
    case 'entrenamendua':
      return 'bg-orange-100 text-orange-700';
    case 'nutrizio':
      return 'bg-lime-100 text-lime-700';
    case 'psikologia':
      return 'bg-indigo-100 text-indigo-700';
    case 'fisioterapia':
      return 'bg-teal-100 text-teal-700';
    case 'biomekanika':
      return 'bg-cyan-100 text-cyan-700';
  }
}

function getActionLabel(type: Resource['type']) {
  switch (type) {
    case 'pdf':
      return 'Deskargatu';
    case 'bideo':
      return 'Jo bideoa';
    case 'liburu':
      return 'Ikusi';
    case 'artikulu':
      return 'Ikusi';
  }
}

function getActionIcon(type: Resource['type']) {
  switch (type) {
    case 'pdf':
      return <Download className="h-4 w-4" />;
    case 'bideo':
      return <Play className="h-4 w-4" />;
    default:
      return <ExternalLink className="h-4 w-4" />;
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('eu-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BaliabideakPage() {
  const { isAdmin } = useAuth();
  const [typeFilter, setTypeFilter] = useState<Resource['type'] | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<Resource['category'] | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'pdf' as Resource['type'],
    category: 'entrenamendua' as Resource['category'],
    url: '',
    description: '',
  });

  const filteredResources = RESOURCES.filter((r) => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (categoryFilter && r.category !== categoryFilter) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    setNewResource({
      title: '',
      type: 'pdf',
      category: 'entrenamendua',
      url: '',
      description: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Baliabideak</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kirolarientzako baliabide eta material erabilgarriak
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Baliabidea gehitu
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter className="h-4 w-4" />
          <span>Iragazkiak:</span>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as Resource['type'] | '')}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as Resource['category'] | '')}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {(typeFilter || categoryFilter) && (
          <button
            onClick={() => {
              setTypeFilter('');
              setCategoryFilter('');
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Garbitu iragazkiak
          </button>
        )}
        <span className="ml-auto text-sm text-gray-400">
          {filteredResources.length} baliabide
        </span>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-12">
          <Search className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            Ez da baliabiderik aurkitu iragazki hauekin
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="flex flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${getTypeColor(resource.type)}`}>
                  {getTypeIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {resource.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(resource.type)}`}
                    >
                      {TYPE_OPTIONS.find((o) => o.value === resource.type)?.label}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(resource.category)}`}
                    >
                      {CATEGORY_OPTIONS.find((o) => o.value === resource.category)?.label}
                    </span>
                  </div>
                </div>
              </div>
              {resource.description && (
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {resource.description}
                </p>
              )}
              <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {formatDate(resource.addedAt)}
                </span>
                <a
                  href={resource.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {getActionIcon(resource.type)}
                  {getActionLabel(resource.type)}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Baliabide berria gehitu
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Izenburua
                </label>
                <input
                  type="text"
                  required
                  value={newResource.title}
                  onChange={(e) =>
                    setNewResource({ ...newResource, title: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Baliabidearen izenburua"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mota
                  </label>
                  <select
                    value={newResource.type}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        type: e.target.value as Resource['type'],
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {TYPE_OPTIONS.filter((o) => o.value).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoria
                  </label>
                  <select
                    value={newResource.category}
                    onChange={(e) =>
                      setNewResource({
                        ...newResource,
                        category: e.target.value as Resource['category'],
                      })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {CATEGORY_OPTIONS.filter((o) => o.value).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={newResource.url}
                  onChange={(e) =>
                    setNewResource({ ...newResource, url: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskribapena
                </label>
                <textarea
                  value={newResource.description}
                  onChange={(e) =>
                    setNewResource({ ...newResource, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Baliabidearen deskribapena..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
