'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Image, TestTube2, File, Upload, Plus, X, Check, Download, Eye } from 'lucide-react';
import { DOCUMENTS } from '@/lib/data';
import { useAuth } from '@/lib/auth-context';
import type { Document as DocType } from '@/lib/types';

const TYPE_CONFIG = {
  erradiografia: { icon: Image, label: 'Erradiografia', bg: 'bg-purple-100', text: 'text-purple-800' },
  txosten: { icon: FileText, label: 'Txostena', bg: 'bg-blue-100', text: 'text-blue-800' },
  analitika: { icon: TestTube2, label: 'Analitika', bg: 'bg-green-100', text: 'text-green-800' },
  beste: { icon: File, label: 'Beste bat', bg: 'bg-gray-100', text: 'text-gray-800' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('eu-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function DokumentuakPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocType[]>(DOCUMENTS);
  const [filterType, setFilterType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formType, setFormType] = useState<DocType['type']>('txosten');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filtered = documents.filter((doc) => {
    if (filterType !== 'all' && doc.type !== filterType) return false;
    return true;
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const newDoc: DocType = {
      id: `d-${Date.now()}`,
      athleteId: user?.id || '',
      name: formName,
      type: formType,
      description: formDescription,
      fileName: selectedFile?.name || `${formName.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileSize: selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` : '1.0 MB',
      uploadedAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setShowModal(false);
    setFormType('txosten');
    setFormName('');
    setFormDescription('');
    setSelectedFile(null);
    setToast('Dokumentua ondo igo da');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setFormName('');
    setFormDescription('');
    setFormType('txosten');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dokumentuak</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Dokumentua igo
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Mota guztiak</option>
          <option value="erradiografia">Erradiografia</option>
          <option value="txosten">Txostena</option>
          <option value="analitika">Analitika</option>
          <option value="beste">Beste bat</option>
        </select>
      </div>

      {/* Documents grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <File className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Ez dago dokumenturik</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const conf = TYPE_CONFIG[doc.type];
            const TypeIcon = conf.icon;

            return (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${conf.bg}`}>
                    <TypeIcon className={`w-5 h-5 ${conf.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{doc.name}</h3>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${conf.bg} ${conf.text}`}>
                      {conf.label}
                    </span>
                  </div>
                </div>
                {doc.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
                )}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div>
                    <p>{formatDate(doc.uploadedAt)}</p>
                    {doc.fileSize && <p className="mt-0.5">{doc.fileSize}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Ikusi"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Deskargatu"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Dokumentua igo</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dokumentu mota</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as DocType['type'])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="erradiografia">Erradiografia</option>
                  <option value="txosten">Txostena</option>
                  <option value="analitika">Analitika</option>
                  <option value="beste">Beste bat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Izena</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Dokumentuaren izena"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskribapena</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Deskribapen laburra..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fitxategia</label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                      <File className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 font-medium">
                        Arrastatu fitxategia hona edo klik egin
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF, JPG, PNG, DICOM (max. 25MB)
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.dcm"
                    className="hidden"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Igo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
