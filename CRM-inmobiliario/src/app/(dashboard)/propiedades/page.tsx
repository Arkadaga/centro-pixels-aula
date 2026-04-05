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
  formatPrecio,
  ESTADO_PROPIEDAD,
  TIPO_OPERACION,
  TIPO_PROPIEDAD,
} from '@/lib/utils'
import type { Propiedad, TipoPropiedad, TipoOperacion, EstadoPropiedad } from '@/types/database'
import {
  Building2,
  Plus,
  Filter,
  Grid3X3,
  List,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
} from 'lucide-react'

export default function PropiedadesPage() {
  const { user } = useAuth()
  const [propiedades, setPropiedades] = useState<Propiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [filtroTipo, setFiltroTipo] = useState<string>('')
  const [filtroOperacion, setFiltroOperacion] = useState<string>('')
  const [vista, setVista] = useState<'grid' | 'list'>('grid')
  const [showNewModal, setShowNewModal] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Formulario nueva propiedad
  const [form, setForm] = useState({
    titulo: '',
    tipo: 'piso' as TipoPropiedad,
    operacion: 'venta' as TipoOperacion,
    precio: '',
    ciudad: '',
    provincia: '',
    direccion: '',
    codigo_postal: '',
    barrio: '',
    habitaciones: '0',
    banos: '0',
    superficie_construida: '',
    superficie_util: '',
    planta: '',
    descripcion: '',
    ascensor: false,
    parking: false,
    terraza: false,
    aire_acondicionado: false,
    calefaccion: false,
  })

  useEffect(() => {
    loadPropiedades()
  }, [])

  async function loadPropiedades() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('propiedades')
      .select(`
        *,
        oficinas(nombre),
        perfiles(nombre, apellidos)
      `)
      .order('created_at', { ascending: false })

    if (data) {
      setPropiedades(data.map((p: any) => ({
        ...p,
        oficina_nombre: p.oficinas?.nombre,
        agente_nombre: p.perfiles ? `${p.perfiles.nombre} ${p.perfiles.apellidos || ''}`.trim() : null,
      })))
    }
    setLoading(false)
  }

  async function crearPropiedad(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.from('propiedades').insert({
      titulo: form.titulo,
      tipo: form.tipo,
      operacion: form.operacion,
      precio: form.precio ? parseFloat(form.precio) : null,
      ciudad: form.ciudad || null,
      provincia: form.provincia || null,
      direccion: form.direccion || null,
      codigo_postal: form.codigo_postal || null,
      barrio: form.barrio || null,
      habitaciones: parseInt(form.habitaciones),
      banos: parseInt(form.banos),
      superficie_construida: form.superficie_construida ? parseInt(form.superficie_construida) : null,
      superficie_util: form.superficie_util ? parseInt(form.superficie_util) : null,
      planta: form.planta || null,
      descripcion: form.descripcion || null,
      ascensor: form.ascensor,
      parking: form.parking,
      terraza: form.terraza,
      aire_acondicionado: form.aire_acondicionado,
      calefaccion: form.calefaccion,
      oficina_id: user?.oficina_id!,
      agente_id: user?.id,
      estado: 'borrador',
    })

    if (error) {
      toast.error('Error al crear la propiedad')
    } else {
      toast.success('Propiedad creada')
      setShowNewModal(false)
      setForm({
        titulo: '', tipo: 'piso', operacion: 'venta', precio: '', ciudad: '', provincia: '',
        direccion: '', codigo_postal: '', barrio: '', habitaciones: '0', banos: '0',
        superficie_construida: '', superficie_util: '', planta: '', descripcion: '',
        ascensor: false, parking: false, terraza: false, aire_acondicionado: false, calefaccion: false,
      })
      loadPropiedades()
    }
  }

  async function eliminarPropiedad() {
    if (!deleteId) return
    const supabase = createClient()
    const { error } = await supabase.from('propiedades').delete().eq('id', deleteId)
    if (error) {
      toast.error('Error al eliminar')
    } else {
      toast.success('Propiedad eliminada')
      setDeleteId(null)
      loadPropiedades()
    }
  }

  const filtered = useMemo(() => {
    return propiedades.filter((p) => {
      if (search) {
        const s = search.toLowerCase()
        if (
          !p.titulo.toLowerCase().includes(s) &&
          !p.referencia.toLowerCase().includes(s) &&
          !(p.ciudad || '').toLowerCase().includes(s) &&
          !(p.direccion || '').toLowerCase().includes(s)
        ) return false
      }
      if (filtroEstado && p.estado !== filtroEstado) return false
      if (filtroTipo && p.tipo !== filtroTipo) return false
      if (filtroOperacion && p.operacion !== filtroOperacion) return false
      return true
    })
  }, [propiedades, search, filtroEstado, filtroTipo, filtroOperacion])

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Propiedades</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} propiedades encontradas</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva propiedad
        </button>
      </div>

      {/* Filtros */}
      <div className="card p-3 sm:p-4">
        <div className="space-y-3">
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1">
              <SearchInput value={search} onChange={setSearch} placeholder="Buscar por título, referencia, ciudad..." />
            </div>
            <div className="hidden sm:flex gap-1 border border-gray-300 rounded-lg p-0.5 flex-shrink-0">
              <button
                onClick={() => setVista('grid')}
                className={`p-2 rounded-md transition-colors ${vista === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVista('list')}
                className={`p-2 rounded-md transition-colors ${vista === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
            <select className="select flex-shrink-0 w-[140px] sm:w-40 text-xs sm:text-sm" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              {Object.entries(ESTADO_PROPIEDAD).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <select className="select flex-shrink-0 w-[140px] sm:w-40 text-xs sm:text-sm" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              {Object.entries(TIPO_PROPIEDAD).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>
            <select className="select flex-shrink-0 w-[155px] sm:w-44 text-xs sm:text-sm" value={filtroOperacion} onChange={(e) => setFiltroOperacion(e.target.value)}>
              <option value="">Operaciones</option>
              {Object.entries(TIPO_OPERACION).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Sin propiedades"
          description="Añade tu primera propiedad para empezar a gestionar tu cartera"
          action={<button onClick={() => setShowNewModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> Nueva propiedad</button>}
        />
      ) : vista === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((prop) => (
            <Link key={prop.id} href={`/propiedades/${prop.id}`} className="card-hover overflow-hidden group">
              {/* Imagen placeholder */}
              <div className="h-36 sm:h-44 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={ESTADO_PROPIEDAD[prop.estado]?.color}>
                    {ESTADO_PROPIEDAD[prop.estado]?.label}
                  </Badge>
                  <Badge className="bg-gray-900/80 text-white">
                    {TIPO_OPERACION[prop.operacion]}
                  </Badge>
                </div>
                {prop.destacada && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-amber-400 text-amber-900">Destacada</Badge>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-400 font-mono">{prop.referencia}</p>
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {prop.titulo}
                    </h3>
                  </div>
                  <p className="text-lg font-bold text-brand-600 flex-shrink-0 ml-3">
                    {formatPrecio(prop.precio)}
                  </p>
                </div>
                {prop.ciudad && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5" /> {prop.barrio ? `${prop.barrio}, ` : ''}{prop.ciudad}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                  {prop.habitaciones > 0 && (
                    <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {prop.habitaciones} hab.</span>
                  )}
                  {prop.banos > 0 && (
                    <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {prop.banos} baños</span>
                  )}
                  {prop.superficie_construida && (
                    <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" /> {prop.superficie_construida} m²</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Propiedad</th>
                <th>Tipo</th>
                <th>Operación</th>
                <th>Precio</th>
                <th>Ciudad</th>
                <th>Estado</th>
                <th>Agente</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((prop) => (
                <tr key={prop.id}>
                  <td><span className="font-mono text-xs text-gray-500">{prop.referencia}</span></td>
                  <td>
                    <Link href={`/propiedades/${prop.id}`} className="font-medium text-gray-900 hover:text-brand-600">
                      {prop.titulo}
                    </Link>
                  </td>
                  <td>{TIPO_PROPIEDAD[prop.tipo]}</td>
                  <td>{TIPO_OPERACION[prop.operacion]}</td>
                  <td className="font-semibold">{formatPrecio(prop.precio)}</td>
                  <td>{prop.ciudad || '-'}</td>
                  <td>
                    <Badge className={ESTADO_PROPIEDAD[prop.estado]?.color}>
                      {ESTADO_PROPIEDAD[prop.estado]?.label}
                    </Badge>
                  </td>
                  <td className="text-gray-500">{prop.agente_nombre || '-'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link href={`/propiedades/${prop.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={(e) => { e.preventDefault(); setDeleteId(prop.id) }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nueva Propiedad */}
      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="Nueva propiedad" size="xl"
        footer={
          <>
            <button onClick={() => setShowNewModal(false)} className="btn-secondary">Cancelar</button>
            <button onClick={crearPropiedad as any} className="btn-primary">Crear propiedad</button>
          </>
        }
      >
        <form onSubmit={crearPropiedad} className="space-y-6">
          {/* Datos básicos */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Datos básicos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Título</label>
                <input className="input" placeholder="Ej: Piso reformado en el centro" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
              </div>
              <div>
                <label className="label">Tipo</label>
                <select className="select" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoPropiedad })}>
                  {Object.entries(TIPO_PROPIEDAD).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Operación</label>
                <select className="select" value={form.operacion} onChange={(e) => setForm({ ...form, operacion: e.target.value as TipoOperacion })}>
                  {Object.entries(TIPO_OPERACION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Precio (€)</label>
                <input type="number" className="input" placeholder="250000" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Ubicación</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Dirección</label>
                <input className="input" placeholder="Calle, número, piso..." value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
              </div>
              <div>
                <label className="label">Ciudad</label>
                <input className="input" placeholder="Bilbao" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
              </div>
              <div>
                <label className="label">Provincia</label>
                <input className="input" placeholder="Bizkaia" value={form.provincia} onChange={(e) => setForm({ ...form, provincia: e.target.value })} />
              </div>
              <div>
                <label className="label">Código postal</label>
                <input className="input" placeholder="48001" value={form.codigo_postal} onChange={(e) => setForm({ ...form, codigo_postal: e.target.value })} />
              </div>
              <div>
                <label className="label">Barrio</label>
                <input className="input" placeholder="Casco Viejo" value={form.barrio} onChange={(e) => setForm({ ...form, barrio: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Características */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Características</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="label">Habitaciones</label>
                <input type="number" className="input" min="0" value={form.habitaciones} onChange={(e) => setForm({ ...form, habitaciones: e.target.value })} />
              </div>
              <div>
                <label className="label">Baños</label>
                <input type="number" className="input" min="0" value={form.banos} onChange={(e) => setForm({ ...form, banos: e.target.value })} />
              </div>
              <div>
                <label className="label">Sup. construida (m²)</label>
                <input type="number" className="input" value={form.superficie_construida} onChange={(e) => setForm({ ...form, superficie_construida: e.target.value })} />
              </div>
              <div>
                <label className="label">Sup. útil (m²)</label>
                <input type="number" className="input" value={form.superficie_util} onChange={(e) => setForm({ ...form, superficie_util: e.target.value })} />
              </div>
              <div>
                <label className="label">Planta</label>
                <input className="input" placeholder="3º" value={form.planta} onChange={(e) => setForm({ ...form, planta: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              {[
                { key: 'ascensor', label: 'Ascensor' },
                { key: 'parking', label: 'Parking' },
                { key: 'terraza', label: 'Terraza' },
                { key: 'aire_acondicionado', label: 'Aire acondicionado' },
                { key: 'calefaccion', label: 'Calefacción' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    checked={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="label">Descripción</label>
            <textarea className="input min-h-[100px]" placeholder="Describe la propiedad..." value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
        </form>
      </Modal>

      {/* Modal Confirmar Eliminar */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar propiedad" size="sm"
        footer={
          <>
            <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancelar</button>
            <button onClick={eliminarPropiedad} className="btn-danger">Eliminar</button>
          </>
        }
      >
        <p className="text-sm text-gray-600">¿Estás seguro de que quieres eliminar esta propiedad? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  )
}
