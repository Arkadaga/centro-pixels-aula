'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Badge from '@/components/ui/Badge'
import SearchInput from '@/components/ui/SearchInput'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import { formatPrecio, formatFecha, ESTADO_CAPTACION, TIPO_PROPIEDAD } from '@/lib/utils'
import type { Captacion, EstadoCaptacion, TipoPropiedad } from '@/types/database'
import { UserPlus, Plus, Phone, Mail, MapPin, Home, ArrowRight } from 'lucide-react'

export default function CaptacionPage() {
  const { user } = useAuth()
  const [captaciones, setCaptaciones] = useState<Captacion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [form, setForm] = useState({
    propietario_nombre: '', propietario_telefono: '', propietario_email: '',
    direccion: '', ciudad: '', provincia: '', tipo: '' as string,
    superficie: '', habitaciones: '', precio_propietario: '', origen: '', notas: '',
  })

  useEffect(() => { loadCaptaciones() }, [])

  async function loadCaptaciones() {
    const supabase = createClient()
    const { data } = await supabase
      .from('captaciones')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setCaptaciones(data)
    setLoading(false)
  }

  async function crearCaptacion(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.from('captaciones').insert({
      propietario_nombre: form.propietario_nombre,
      propietario_telefono: form.propietario_telefono || null,
      propietario_email: form.propietario_email || null,
      direccion: form.direccion || null,
      ciudad: form.ciudad || null,
      provincia: form.provincia || null,
      tipo: form.tipo || null,
      superficie: form.superficie ? parseInt(form.superficie) : null,
      habitaciones: form.habitaciones ? parseInt(form.habitaciones) : null,
      precio_propietario: form.precio_propietario ? parseFloat(form.precio_propietario) : null,
      origen: form.origen || null,
      notas: form.notas || null,
      agente_id: user?.id,
      oficina_id: user?.oficina_id,
      estado: 'prospecto',
    })

    if (error) {
      toast.error('Error al crear captación')
    } else {
      toast.success('Captación creada')
      setShowNewModal(false)
      setForm({ propietario_nombre: '', propietario_telefono: '', propietario_email: '', direccion: '', ciudad: '', provincia: '', tipo: '', superficie: '', habitaciones: '', precio_propietario: '', origen: '', notas: '' })
      loadCaptaciones()
    }
  }

  async function cambiarEstado(id: string, estado: EstadoCaptacion) {
    const supabase = createClient()
    const { error } = await supabase.from('captaciones').update({ estado }).eq('id', id)
    if (error) toast.error('Error')
    else { toast.success('Estado actualizado'); loadCaptaciones() }
  }

  const filtered = useMemo(() => {
    return captaciones.filter((c) => {
      if (search) {
        const s = search.toLowerCase()
        if (!c.propietario_nombre.toLowerCase().includes(s) && !(c.ciudad || '').toLowerCase().includes(s) && !(c.direccion || '').toLowerCase().includes(s)) return false
      }
      if (filtroEstado && c.estado !== filtroEstado) return false
      return true
    })
  }, [captaciones, search, filtroEstado])

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Captación</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona las posibles captaciones de inmuebles</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva captación
        </button>
      </div>

      {/* Pipeline Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {(Object.entries(ESTADO_CAPTACION) as [EstadoCaptacion, { label: string; color: string }][]).map(([estado, config]) => {
          const items = captaciones.filter(c => c.estado === estado)
          return (
            <div key={estado} className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={config.color}>{config.label}</Badge>
                <span className="text-xs text-gray-400">{items.length}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {items.map((cap) => (
                  <div key={cap.id} className="card-hover p-4 cursor-pointer">
                    <p className="font-medium text-sm text-gray-900">{cap.propietario_nombre}</p>
                    {cap.ciudad && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {cap.ciudad}
                      </p>
                    )}
                    {cap.tipo && (
                      <p className="text-xs text-gray-500 mt-1">{TIPO_PROPIEDAD[cap.tipo as TipoPropiedad]}</p>
                    )}
                    {cap.precio_propietario && (
                      <p className="text-sm font-semibold text-brand-600 mt-2">{formatPrecio(cap.precio_propietario)}</p>
                    )}
                    <div className="flex items-center gap-1 mt-3">
                      {cap.propietario_telefono && (
                        <a href={`tel:${cap.propietario_telefono}`} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {cap.propietario_email && (
                        <a href={`mailto:${cap.propietario_email}`} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    {/* Botones de avance */}
                    <div className="flex gap-1 mt-2 border-t border-gray-100 pt-2">
                      {estado !== 'firmado' && estado !== 'descartado' && (
                        <>
                          {estado === 'prospecto' && (
                            <button onClick={() => cambiarEstado(cap.id, 'contactado')} className="text-xs text-brand-600 hover:text-brand-700">Contactar</button>
                          )}
                          {estado === 'contactado' && (
                            <button onClick={() => cambiarEstado(cap.id, 'valoracion')} className="text-xs text-brand-600 hover:text-brand-700">Valorar</button>
                          )}
                          {estado === 'valoracion' && (
                            <button onClick={() => cambiarEstado(cap.id, 'firmado')} className="text-xs text-emerald-600 hover:text-emerald-700">Firmar</button>
                          )}
                          <button onClick={() => cambiarEstado(cap.id, 'descartado')} className="text-xs text-red-500 hover:text-red-600 ml-auto">Descartar</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Nueva Captación */}
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="Nueva captación" size="lg"
        footer={
          <>
            <button onClick={() => setShowNewModal(false)} className="btn-secondary">Cancelar</button>
            <button onClick={crearCaptacion as any} className="btn-primary">Crear captación</button>
          </>
        }
      >
        <form onSubmit={crearCaptacion} className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Datos del propietario</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Nombre del propietario *</label>
                <input className="input" value={form.propietario_nombre} onChange={(e) => setForm({ ...form, propietario_nombre: e.target.value })} required />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input className="input" value={form.propietario_telefono} onChange={(e) => setForm({ ...form, propietario_telefono: e.target.value })} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" value={form.propietario_email} onChange={(e) => setForm({ ...form, propietario_email: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Datos del inmueble</h4>
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
                <label className="label">Tipo</label>
                <select className="select" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  <option value="">Sin especificar</option>
                  {Object.entries(TIPO_PROPIEDAD).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Superficie (m²)</label>
                <input type="number" className="input" value={form.superficie} onChange={(e) => setForm({ ...form, superficie: e.target.value })} />
              </div>
              <div>
                <label className="label">Precio que pide (€)</label>
                <input type="number" className="input" value={form.precio_propietario} onChange={(e) => setForm({ ...form, precio_propietario: e.target.value })} />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Origen de la captación</label>
            <input className="input" placeholder="Ej: Cartel en portal, referido, puerta fría..." value={form.origen} onChange={(e) => setForm({ ...form, origen: e.target.value })} />
          </div>
          <div>
            <label className="label">Notas</label>
            <textarea className="input min-h-[80px]" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  )
}
