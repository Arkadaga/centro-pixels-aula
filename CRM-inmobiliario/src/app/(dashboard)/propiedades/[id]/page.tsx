'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import {
  formatPrecio,
  formatFecha,
  ESTADO_PROPIEDAD,
  TIPO_OPERACION,
  TIPO_PROPIEDAD,
  ESTADO_PUBLICACION,
} from '@/lib/utils'
import type { Propiedad, PublicacionPortal, Contacto, Visita } from '@/types/database'
import {
  ArrowLeft,
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Car,
  Snowflake,
  Flame,
  Building,
  TreePine,
  Waves,
  Sofa,
  Globe,
  Users,
  Calendar,
  Edit,
  Trash2,
  Share2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import Link from 'next/link'

export default function PropiedadDetallePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [propiedad, setPropiedad] = useState<Propiedad | null>(null)
  const [publicaciones, setPublicaciones] = useState<PublicacionPortal[]>([])
  const [leads, setLeads] = useState<Contacto[]>([])
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'detalle' | 'leads' | 'visitas' | 'portales'>('detalle')
  const [showEstadoModal, setShowEstadoModal] = useState(false)

  useEffect(() => {
    loadPropiedad()
  }, [id])

  async function loadPropiedad() {
    const supabase = createClient()

    const { data: prop } = await supabase
      .from('propiedades')
      .select('*, oficinas(nombre), perfiles(nombre, apellidos)')
      .eq('id', id)
      .single()

    if (prop) {
      setPropiedad({
        ...prop,
        oficina_nombre: (prop as any).oficinas?.nombre,
        agente_nombre: (prop as any).perfiles ? `${(prop as any).perfiles.nombre} ${(prop as any).perfiles.apellidos || ''}`.trim() : null,
      } as Propiedad)
    }

    const { data: pubs } = await supabase
      .from('publicaciones_portales')
      .select('*')
      .eq('propiedad_id', id)

    if (pubs) setPublicaciones(pubs)

    const { data: contactos } = await supabase
      .from('contactos')
      .select('*')
      .eq('propiedad_interes_id', id)
      .order('created_at', { ascending: false })

    if (contactos) setLeads(contactos)

    const { data: vis } = await supabase
      .from('visitas')
      .select('*')
      .eq('propiedad_id', id)
      .order('fecha', { ascending: false })

    if (vis) setVisitas(vis)

    setLoading(false)
  }

  async function cambiarEstado(estado: string) {
    const supabase = createClient()
    const { error } = await supabase.from('propiedades').update({ estado }).eq('id', id)
    if (error) {
      toast.error('Error al cambiar estado')
    } else {
      toast.success('Estado actualizado')
      setShowEstadoModal(false)
      loadPropiedad()
    }
  }

  async function publicarEnPortal(portal: string) {
    const supabase = createClient()
    const { error } = await supabase.from('publicaciones_portales').upsert({
      propiedad_id: id as string,
      portal,
      estado: 'pendiente',
      auto_publicar: true,
    }, { onConflict: 'propiedad_id,portal' })

    if (error) {
      toast.error('Error al publicar')
    } else {
      toast.success(`Enviado a ${portal}`)
      loadPropiedad()
    }
  }

  if (loading || !propiedad) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  const caracteristicas = [
    { icon: BedDouble, label: 'Habitaciones', value: propiedad.habitaciones, show: propiedad.habitaciones > 0 },
    { icon: Bath, label: 'Baños', value: propiedad.banos, show: propiedad.banos > 0 },
    { icon: Maximize2, label: 'Superficie construida', value: `${propiedad.superficie_construida} m²`, show: !!propiedad.superficie_construida },
    { icon: Maximize2, label: 'Superficie útil', value: `${propiedad.superficie_util} m²`, show: !!propiedad.superficie_util },
    { icon: Building, label: 'Planta', value: propiedad.planta, show: !!propiedad.planta },
    { icon: Building, label: 'Ascensor', value: propiedad.ascensor ? 'Sí' : 'No', show: true },
    { icon: Car, label: 'Parking', value: propiedad.parking ? 'Sí' : 'No', show: true },
    { icon: Snowflake, label: 'Aire acondicionado', value: propiedad.aire_acondicionado ? 'Sí' : 'No', show: true },
    { icon: Flame, label: 'Calefacción', value: propiedad.calefaccion ? 'Sí' : 'No', show: true },
    { icon: TreePine, label: 'Terraza', value: propiedad.terraza ? 'Sí' : 'No', show: true },
    { icon: Sofa, label: 'Amueblado', value: propiedad.amueblado ? 'Sí' : 'No', show: true },
  ]

  const idealistaStatus = publicaciones.find(p => p.portal === 'idealista')
  const fotocasaStatus = publicaciones.find(p => p.portal === 'fotocasa')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-mono text-gray-400">{propiedad.referencia}</span>
              <Badge className={ESTADO_PROPIEDAD[propiedad.estado]?.color}>
                {ESTADO_PROPIEDAD[propiedad.estado]?.label}
              </Badge>
              {propiedad.destacada && <Badge className="bg-amber-100 text-amber-800">Destacada</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{propiedad.titulo}</h1>
            {propiedad.ciudad && (
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" /> {propiedad.direccion ? `${propiedad.direccion}, ` : ''}{propiedad.ciudad}, {propiedad.provincia}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEstadoModal(true)} className="btn-secondary btn-sm">
            Cambiar estado
          </button>
          <Link href={`/propiedades/${id}/editar`} className="btn-primary btn-sm">
            <Edit className="w-3.5 h-3.5" /> Editar
          </Link>
        </div>
      </div>

      {/* Precio + Info rápida */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Precio</p>
          <p className="text-3xl font-bold text-brand-600">{formatPrecio(propiedad.precio)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {TIPO_OPERACION[propiedad.operacion]} · {TIPO_PROPIEDAD[propiedad.tipo]}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Leads interesados</p>
          <p className="text-3xl font-bold text-gray-900">{leads.length}</p>
          <p className="text-xs text-gray-400 mt-1">contactos</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Visitas realizadas</p>
          <p className="text-3xl font-bold text-gray-900">{visitas.length}</p>
          <p className="text-xs text-gray-400 mt-1">visitas</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Portales</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              {idealistaStatus?.estado === 'publicado' ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-300" />
              )}
              <span className="text-sm">Idealista</span>
            </div>
            <div className="flex items-center gap-1.5">
              {fotocasaStatus?.estado === 'publicado' ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-300" />
              )}
              <span className="text-sm">Fotocasa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 pb-0">
        {[
          { id: 'detalle', label: 'Detalle', icon: Building2 },
          { id: 'leads', label: `Leads (${leads.length})`, icon: Users },
          { id: 'visitas', label: `Visitas (${visitas.length})`, icon: Calendar },
          { id: 'portales', label: 'Portales', icon: Globe },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-1 py-3 text-sm border-b-2 transition-colors ${
              tab === t.id ? 'tab-active' : 'tab-inactive border-transparent'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'detalle' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Descripción */}
          <div className="lg:col-span-2 space-y-6">
            {propiedad.descripcion && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Descripción</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{propiedad.descripcion}</p>
              </div>
            )}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Características</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {caracteristicas.filter(c => c.show).map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <c.icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{c.label}</p>
                      <p className="text-sm font-medium text-gray-900">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info lateral */}
          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Información</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Oficina</span>
                  <span className="font-medium">{propiedad.oficina_nombre || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Agente</span>
                  <span className="font-medium">{propiedad.agente_nombre || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Creada</span>
                  <span className="font-medium">{formatFecha(propiedad.created_at)}</span>
                </div>
                {propiedad.certificado_energetico && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">C. Energético</span>
                    <Badge className="bg-emerald-100 text-emerald-800">{propiedad.certificado_energetico}</Badge>
                  </div>
                )}
                {propiedad.ano_construccion && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Año construcción</span>
                    <span className="font-medium">{propiedad.ano_construccion}</span>
                  </div>
                )}
                {propiedad.precio_comunidad && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Comunidad</span>
                    <span className="font-medium">{formatPrecio(propiedad.precio_comunidad)}/mes</span>
                  </div>
                )}
                {propiedad.precio_ibi && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">IBI</span>
                    <span className="font-medium">{formatPrecio(propiedad.precio_ibi)}/año</span>
                  </div>
                )}
              </div>
            </div>

            {propiedad.observaciones_internas && (
              <div className="card p-5 border-amber-200 bg-amber-50">
                <h3 className="font-semibold text-amber-900 mb-2">Notas internas</h3>
                <p className="text-sm text-amber-800">{propiedad.observaciones_internas}</p>
              </div>
            )}

            {/* Publicar en portales */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Publicar en portales</h3>
              <div className="space-y-2">
                <button
                  onClick={() => publicarEnPortal('idealista')}
                  disabled={idealistaStatus?.estado === 'publicado'}
                  className="btn-secondary w-full justify-start"
                >
                  <Globe className="w-4 h-4" />
                  {idealistaStatus?.estado === 'publicado' ? 'Publicado en Idealista' : 'Publicar en Idealista'}
                </button>
                <button
                  onClick={() => publicarEnPortal('fotocasa')}
                  disabled={fotocasaStatus?.estado === 'publicado'}
                  className="btn-secondary w-full justify-start"
                >
                  <Globe className="w-4 h-4" />
                  {fotocasaStatus?.estado === 'publicado' ? 'Publicado en Fotocasa' : 'Publicar en Fotocasa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'leads' && (
        <div className="card">
          {leads.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay leads para esta propiedad</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <Link key={lead.id} href={`/contactos/${lead.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{lead.nombre} {lead.apellidos}</p>
                    <p className="text-sm text-gray-500">{lead.telefono || lead.email}</p>
                  </div>
                  <Badge className={
                    lead.estado === 'nuevo' ? 'bg-blue-100 text-blue-800' :
                    lead.estado === 'negociando' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {lead.estado}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'visitas' && (
        <div className="card">
          {visitas.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay visitas registradas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {visitas.map((v) => (
                <div key={v.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{formatFecha(v.fecha)}</span>
                      {v.cancelada && <Badge className="bg-red-100 text-red-700">Cancelada</Badge>}
                    </div>
                    {v.resultado && <Badge className="bg-gray-100 text-gray-700">{v.resultado}</Badge>}
                  </div>
                  {v.notas && <p className="text-sm text-gray-500 mt-1 ml-7">{v.notas}</p>}
                  {v.feedback_cliente && <p className="text-sm text-blue-600 mt-1 ml-7">Feedback: {v.feedback_cliente}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'portales' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['idealista', 'fotocasa'].map((portal) => {
            const pub = publicaciones.find(p => p.portal === portal)
            return (
              <div key={portal} className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 capitalize">{portal}</h3>
                  {pub && (
                    <Badge className={ESTADO_PUBLICACION[pub.estado]?.color}>
                      {ESTADO_PUBLICACION[pub.estado]?.label}
                    </Badge>
                  )}
                </div>
                {pub ? (
                  <div className="space-y-2 text-sm">
                    {pub.id_externo && <p><span className="text-gray-500">ID externo:</span> {pub.id_externo}</p>}
                    {pub.fecha_publicacion && <p><span className="text-gray-500">Publicado:</span> {formatFecha(pub.fecha_publicacion)}</p>}
                    {pub.url_publicacion && (
                      <a href={pub.url_publicacion} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Ver en {portal}
                      </a>
                    )}
                    {pub.error_mensaje && <p className="text-red-600 text-xs">{pub.error_mensaje}</p>}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-3">No publicado en {portal}</p>
                    <button onClick={() => publicarEnPortal(portal)} className="btn-primary btn-sm">
                      <Share2 className="w-3.5 h-3.5" /> Publicar
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal cambiar estado */}
      <Modal open={showEstadoModal} onClose={() => setShowEstadoModal(false)} title="Cambiar estado" size="sm">
        <div className="space-y-2">
          {Object.entries(ESTADO_PROPIEDAD).map(([key, val]) => (
            <button
              key={key}
              onClick={() => cambiarEstado(key)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 border ${
                propiedad.estado === key ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
              }`}
            >
              <Badge className={val.color}>{val.label}</Badge>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
