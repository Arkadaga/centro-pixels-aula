'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import SearchInput from '@/components/ui/SearchInput'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import {
  formatFecha,
  timeAgo,
  ESTADO_CONTACTO,
  ORIGEN_CONTACTO,
  TIPO_OPERACION,
  TIPO_PROPIEDAD,
} from '@/lib/utils'
import type { Contacto, EstadoContacto, OrigenContacto, TipoOperacion, TipoPropiedad } from '@/types/database'
import {
  Users,
  Plus,
  Phone,
  Mail,
  Calendar,
  Star,
  Filter,
  ArrowUpDown,
  MoreVertical,
  MessageCircle,
  Eye,
  Trash2,
} from 'lucide-react'

export default function ContactosPage() {
  const { user } = useAuth()
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [filtroOrigen, setFiltroOrigen] = useState<string>('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [form, setForm] = useState({
    nombre: '', apellidos: '', email: '', telefono: '', telefono2: '',
    origen: 'otro' as OrigenContacto, busca_operacion: '' as string, busca_tipo: '' as string,
    presupuesto_min: '', presupuesto_max: '', zona_interes: '', notas: '',
  })

  useEffect(() => { loadContactos() }, [])

  async function loadContactos() {
    const supabase = createClient()
    const { data } = await supabase
      .from('contactos')
      .select('*, perfiles(nombre, apellidos), propiedades(titulo, referencia)')
      .order('created_at', { ascending: false })

    if (data) {
      setContactos(data.map((c: any) => ({
        ...c,
        agente_nombre: c.perfiles ? `${c.perfiles.nombre} ${c.perfiles.apellidos || ''}`.trim() : null,
        propiedad_titulo: c.propiedades?.titulo,
        propiedad_referencia: c.propiedades?.referencia,
      })))
    }
    setLoading(false)
  }

  async function crearContacto(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.from('contactos').insert({
      nombre: form.nombre,
      apellidos: form.apellidos || null,
      email: form.email || null,
      telefono: form.telefono || null,
      telefono2: form.telefono2 || null,
      origen: form.origen,
      busca_operacion: form.busca_operacion || null,
      busca_tipo: form.busca_tipo || null,
      presupuesto_min: form.presupuesto_min ? parseFloat(form.presupuesto_min) : null,
      presupuesto_max: form.presupuesto_max ? parseFloat(form.presupuesto_max) : null,
      zona_interes: form.zona_interes || null,
      notas: form.notas || null,
      agente_id: user?.id,
      oficina_id: user?.oficina_id,
      estado: 'nuevo',
    })

    if (error) {
      toast.error('Error al crear contacto')
    } else {
      toast.success('Contacto creado')
      setShowNewModal(false)
      setForm({ nombre: '', apellidos: '', email: '', telefono: '', telefono2: '', origen: 'otro', busca_operacion: '', busca_tipo: '', presupuesto_min: '', presupuesto_max: '', zona_interes: '', notas: '' })
      loadContactos()
    }
  }

  const filtered = useMemo(() => {
    return contactos.filter((c) => {
      if (search) {
        const s = search.toLowerCase()
        if (
          !c.nombre.toLowerCase().includes(s) &&
          !(c.apellidos || '').toLowerCase().includes(s) &&
          !(c.email || '').toLowerCase().includes(s) &&
          !(c.telefono || '').includes(s)
        ) return false
      }
      if (filtroEstado && c.estado !== filtroEstado) return false
      if (filtroOrigen && c.origen !== filtroOrigen) return false
      return true
    })
  }, [contactos, search, filtroEstado, filtroOrigen])

  const statsByEstado = useMemo(() => {
    const stats: Record<string, number> = {}
    contactos.forEach(c => { stats[c.estado] = (stats[c.estado] || 0) + 1 })
    return stats
  }, [contactos])

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contactos</h1>
          <p className="text-sm text-gray-500 mt-1">{contactos.length} contactos en total</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nuevo contacto
        </button>
      </div>

      {/* Pipeline mini */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => setFiltroEstado('')} className={`badge cursor-pointer whitespace-nowrap ${!filtroEstado ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 text-gray-600'}`}>
          Todos ({contactos.length})
        </button>
        {Object.entries(ESTADO_CONTACTO).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFiltroEstado(filtroEstado === key ? '' : key)}
            className={`badge cursor-pointer whitespace-nowrap ${filtroEstado === key ? val.color : 'bg-gray-100 text-gray-600'}`}
          >
            {val.label} ({statsByEstado[key] || 0})
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, email, teléfono..." />
          </div>
          <select className="select w-full sm:w-44" value={filtroOrigen} onChange={(e) => setFiltroOrigen(e.target.value)}>
            <option value="">Todos los orígenes</option>
            {Object.entries(ORIGEN_CONTACTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin contactos"
          description="Añade tu primer contacto o espera a recibir leads de los portales"
          action={<button onClick={() => setShowNewModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Nuevo contacto</button>}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Contacto</th>
                <th>Estado</th>
                <th>Origen</th>
                <th>Teléfono</th>
                <th>Busca</th>
                <th>Propiedad</th>
                <th>Puntuación</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/contactos/${c.id}`} className="font-medium text-gray-900 hover:text-brand-600">
                      {c.nombre} {c.apellidos}
                    </Link>
                    {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                  </td>
                  <td>
                    <Badge className={ESTADO_CONTACTO[c.estado]?.color}>
                      {ESTADO_CONTACTO[c.estado]?.label}
                    </Badge>
                  </td>
                  <td className="text-gray-500">{ORIGEN_CONTACTO[c.origen]}</td>
                  <td>
                    {c.telefono && (
                      <a href={`tel:${c.telefono}`} className="text-gray-700 hover:text-brand-600 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {c.telefono}
                      </a>
                    )}
                  </td>
                  <td className="text-sm text-gray-500">
                    {c.busca_operacion ? TIPO_OPERACION[c.busca_operacion] : '-'}
                    {c.busca_tipo ? ` · ${TIPO_PROPIEDAD[c.busca_tipo]}` : ''}
                  </td>
                  <td>
                    {c.propiedad_referencia ? (
                      <span className="text-xs font-mono text-gray-500">{c.propiedad_referencia}</span>
                    ) : '-'}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.puntuacion >= 70 ? 'bg-emerald-500' : c.puntuacion >= 40 ? 'bg-amber-500' : 'bg-gray-400'}`}
                          style={{ width: `${c.puntuacion}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{c.puntuacion}</span>
                    </div>
                  </td>
                  <td className="text-xs text-gray-400">{timeAgo(c.created_at)}</td>
                  <td>
                    <Link href={`/contactos/${c.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 inline-flex">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nuevo Contacto */}
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="Nuevo contacto" size="lg"
        footer={
          <>
            <button onClick={() => setShowNewModal(false)} className="btn-secondary">Cancelar</button>
            <button onClick={crearContacto as any} className="btn-primary">Crear contacto</button>
          </>
        }
      >
        <form onSubmit={crearContacto} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <label className="label">Apellidos</label>
              <input className="input" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input className="input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
              <label className="label">Origen</label>
              <select className="select" value={form.origen} onChange={(e) => setForm({ ...form, origen: e.target.value as OrigenContacto })}>
                {Object.entries(ORIGEN_CONTACTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Búsqueda del cliente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Tipo de operación</label>
                <select className="select" value={form.busca_operacion} onChange={(e) => setForm({ ...form, busca_operacion: e.target.value })}>
                  <option value="">Sin especificar</option>
                  {Object.entries(TIPO_OPERACION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Tipo de propiedad</label>
                <select className="select" value={form.busca_tipo} onChange={(e) => setForm({ ...form, busca_tipo: e.target.value })}>
                  <option value="">Sin especificar</option>
                  {Object.entries(TIPO_PROPIEDAD).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Presupuesto mínimo (€)</label>
                <input type="number" className="input" value={form.presupuesto_min} onChange={(e) => setForm({ ...form, presupuesto_min: e.target.value })} />
              </div>
              <div>
                <label className="label">Presupuesto máximo (€)</label>
                <input type="number" className="input" value={form.presupuesto_max} onChange={(e) => setForm({ ...form, presupuesto_max: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Zona de interés</label>
                <input className="input" placeholder="Ej: Bilbao centro, Getxo..." value={form.zona_interes} onChange={(e) => setForm({ ...form, zona_interes: e.target.value })} />
              </div>
            </div>
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
