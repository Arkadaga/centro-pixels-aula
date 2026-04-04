'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import type { Oficina } from '@/types/database'
import {
  MapPin,
  Plus,
  Phone,
  Mail,
  Building2,
  Users,
  Home,
  Edit,
  Settings,
} from 'lucide-react'

export default function OficinasPage() {
  const { user } = useAuth()
  const [oficinas, setOficinas] = useState<(Oficina & { num_agentes?: number; num_propiedades?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [form, setForm] = useState({
    nombre: '', direccion: '', ciudad: '', provincia: '', codigo_postal: '', telefono: '', email: '',
  })

  useEffect(() => { loadOficinas() }, [])

  async function loadOficinas() {
    const supabase = createClient()
    const { data } = await supabase.from('oficinas').select('*').eq('activa', true).order('nombre')

    if (data) {
      const conStats = await Promise.all(data.map(async (o) => {
        const { count: numAgentes } = await supabase
          .from('perfiles')
          .select('*', { count: 'exact', head: true })
          .eq('oficina_id', o.id)
          .eq('activo', true)

        const { count: numProps } = await supabase
          .from('propiedades')
          .select('*', { count: 'exact', head: true })
          .eq('oficina_id', o.id)

        return { ...o, num_agentes: numAgentes || 0, num_propiedades: numProps || 0 }
      }))
      setOficinas(conStats)
    }
    setLoading(false)
  }

  async function crearOficina(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.from('oficinas').insert({
      nombre: form.nombre,
      direccion: form.direccion || null,
      ciudad: form.ciudad || null,
      provincia: form.provincia || null,
      codigo_postal: form.codigo_postal || null,
      telefono: form.telefono || null,
      email: form.email || null,
    })

    if (error) {
      toast.error('Error al crear oficina')
    } else {
      toast.success('Oficina creada')
      setShowNewModal(false)
      setForm({ nombre: '', direccion: '', ciudad: '', provincia: '', codigo_postal: '', telefono: '', email: '' })
      loadOficinas()
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Oficinas</h1>
          <p className="text-sm text-gray-500 mt-1">{oficinas.length} oficinas activas</p>
        </div>
        {user?.rol === 'admin' && (
          <button onClick={() => setShowNewModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Nueva oficina
          </button>
        )}
      </div>

      {oficinas.length === 0 ? (
        <EmptyState icon={MapPin} title="Sin oficinas" description="Crea la primera oficina para empezar" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {oficinas.map((oficina) => (
            <div key={oficina.id} className="card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-800">Activa</Badge>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">{oficina.nombre}</h3>

              <div className="space-y-2 text-sm mt-3">
                {oficina.direccion && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {oficina.direccion}, {oficina.ciudad} {oficina.codigo_postal}
                  </p>
                )}
                {oficina.telefono && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" /> {oficina.telefono}
                  </p>
                )}
                {oficina.email && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" /> {oficina.email}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{oficina.num_agentes}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" /> Agentes
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{oficina.num_propiedades}</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Home className="w-3 h-3" /> Propiedades
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="Nueva oficina" size="lg"
        footer={
          <>
            <button onClick={() => setShowNewModal(false)} className="btn-secondary">Cancelar</button>
            <button onClick={crearOficina as any} className="btn-primary">Crear oficina</button>
          </>
        }
      >
        <form onSubmit={crearOficina} className="space-y-4">
          <div>
            <label className="label">Nombre *</label>
            <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Dirección</label>
              <input className="input" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            </div>
            <div>
              <label className="label">Ciudad</label>
              <input className="input" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
            </div>
            <div>
              <label className="label">Provincia</label>
              <input className="input" value={form.provincia} onChange={(e) => setForm({ ...form, provincia: e.target.value })} />
            </div>
            <div>
              <label className="label">Código postal</label>
              <input className="input" value={form.codigo_postal} onChange={(e) => setForm({ ...form, codigo_postal: e.target.value })} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input className="input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
