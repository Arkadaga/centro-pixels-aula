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
  formatFechaHora,
  timeAgo,
  ESTADO_CONTACTO,
  ORIGEN_CONTACTO,
  TIPO_OPERACION,
  TIPO_PROPIEDAD,
  TIPO_INTERACCION,
} from '@/lib/utils'
import type { Contacto, Interaccion, Visita, TipoInteraccion, EstadoContacto } from '@/types/database'
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Plus,
  Edit,
  Star,
  Clock,
  User,
  Building2,
} from 'lucide-react'
import Link from 'next/link'

export default function ContactoDetallePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [contacto, setContacto] = useState<Contacto | null>(null)
  const [interacciones, setInteracciones] = useState<Interaccion[]>([])
  const [visitas, setVisitas] = useState<Visita[]>([])
  const [loading, setLoading] = useState(true)
  const [showInteraccionModal, setShowInteraccionModal] = useState(false)
  const [showEstadoModal, setShowEstadoModal] = useState(false)
  const [interForm, setInterForm] = useState({
    tipo: 'llamada' as TipoInteraccion,
    descripcion: '',
    proxima_accion: '',
    fecha_proxima_accion: '',
  })

  useEffect(() => { loadContacto() }, [id])

  async function loadContacto() {
    const supabase = createClient()

    const { data: c } = await supabase
      .from('contactos')
      .select('*, perfiles(nombre, apellidos), propiedades(titulo, referencia)')
      .eq('id', id)
      .single()

    if (c) {
      setContacto({
        ...c,
        agente_nombre: (c as any).perfiles ? `${(c as any).perfiles.nombre} ${(c as any).perfiles.apellidos || ''}`.trim() : null,
        propiedad_titulo: (c as any).propiedades?.titulo,
        propiedad_referencia: (c as any).propiedades?.referencia,
      } as Contacto)
    }

    const { data: inters } = await supabase
      .from('interacciones')
      .select('*')
      .eq('contacto_id', id)
      .order('fecha', { ascending: false })
    if (inters) setInteracciones(inters)

    const { data: vis } = await supabase
      .from('visitas')
      .select('*')
      .eq('contacto_id', id)
      .order('fecha', { ascending: false })
    if (vis) setVisitas(vis)

    setLoading(false)
  }

  async function crearInteraccion(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.from('interacciones').insert({
      contacto_id: id as string,
      agente_id: user?.id,
      tipo: interForm.tipo,
      descripcion: interForm.descripcion || null,
      proxima_accion: interForm.proxima_accion || null,
      fecha_proxima_accion: interForm.fecha_proxima_accion || null,
    })

    // Actualizar fecha último contacto
    await supabase.from('contactos').update({
      fecha_ultimo_contacto: new Date().toISOString()
    }).eq('id', id)

    if (error) {
      toast.error('Error al registrar interacción')
    } else {
      toast.success('Interacción registrada')
      setShowInteraccionModal(false)
      setInterForm({ tipo: 'llamada', descripcion: '', proxima_accion: '', fecha_proxima_accion: '' })
      loadContacto()
    }
  }

  async function cambiarEstado(estado: EstadoContacto) {
    const supabase = createClient()
    const { error } = await supabase.from('contactos').update({ estado }).eq('id', id)
    if (error) toast.error('Error')
    else { toast.success('Estado actualizado'); setShowEstadoModal(false); loadContacto() }
  }

  if (loading || !contacto) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Badge className={ESTADO_CONTACTO[contacto.estado]?.color}>
                {ESTADO_CONTACTO[contacto.estado]?.label}
              </Badge>
              <Badge className="bg-gray-100 text-gray-600">{ORIGEN_CONTACTO[contacto.origen]}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {contacto.nombre} {contacto.apellidos}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEstadoModal(true)} className="btn-secondary btn-sm">Cambiar estado</button>
          <button onClick={() => setShowInteraccionModal(true)} className="btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Registrar interacción
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: info + historial */}
        <div className="lg:col-span-2 space-y-6">
          {/* Acciones rápidas */}
          <div className="flex gap-2">
            {contacto.telefono && (
              <a href={`tel:${contacto.telefono}`} className="btn-secondary btn-sm">
                <Phone className="w-3.5 h-3.5" /> Llamar
              </a>
            )}
            {contacto.email && (
              <a href={`mailto:${contacto.email}`} className="btn-secondary btn-sm">
                <Mail className="w-3.5 h-3.5" /> Email
              </a>
            )}
            {contacto.telefono && (
              <a href={`https://wa.me/${contacto.telefono.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            )}
          </div>

          {/* Timeline de interacciones */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Historial de interacciones</h2>
              <span className="text-xs text-gray-400">{interacciones.length} registros</span>
            </div>
            <div className="divide-y divide-gray-100">
              {interacciones.length === 0 ? (
                <div className="p-6 text-center">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Sin interacciones registradas</p>
                </div>
              ) : (
                interacciones.map((inter) => {
                  const tipoConfig = TIPO_INTERACCION[inter.tipo]
                  return (
                    <div key={inter.id} className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-base">
                          {tipoConfig?.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{tipoConfig?.label}</span>
                            <span className="text-xs text-gray-400">{formatFechaHora(inter.fecha)}</span>
                          </div>
                          {inter.descripcion && (
                            <p className="text-sm text-gray-600 mt-1">{inter.descripcion}</p>
                          )}
                          {inter.proxima_accion && (
                            <div className="mt-2 p-2 bg-amber-50 rounded-lg text-xs text-amber-800">
                              <strong>Próxima acción:</strong> {inter.proxima_accion}
                              {inter.fecha_proxima_accion && ` (${formatFecha(inter.fecha_proxima_accion)})`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Visitas */}
          {visitas.length > 0 && (
            <div className="card">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Visitas ({visitas.length})</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {visitas.map((v) => (
                  <div key={v.id} className="px-5 py-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{formatFechaHora(v.fecha)}</span>
                      {v.resultado && <Badge className="bg-gray-100 text-gray-700">{v.resultado}</Badge>}
                      {v.cancelada && <Badge className="bg-red-100 text-red-700">Cancelada</Badge>}
                    </div>
                    {v.notas && <p className="text-sm text-gray-500 mt-1">{v.notas}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: datos */}
        <div className="space-y-6">
          {/* Datos de contacto */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Datos de contacto</h3>
            <div className="space-y-3 text-sm">
              {contacto.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${contacto.email}`} className="text-brand-600 hover:underline">{contacto.email}</a>
                </div>
              )}
              {contacto.telefono && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${contacto.telefono}`} className="text-gray-700">{contacto.telefono}</a>
                </div>
              )}
              {contacto.telefono2 && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{contacto.telefono2}</span>
                </div>
              )}
            </div>
          </div>

          {/* Puntuación */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Puntuación lead</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${contacto.puntuacion >= 70 ? 'bg-emerald-500' : contacto.puntuacion >= 40 ? 'bg-amber-500' : 'bg-gray-400'}`}
                  style={{ width: `${contacto.puntuacion}%` }}
                />
              </div>
              <span className="text-lg font-bold text-gray-900">{contacto.puntuacion}</span>
            </div>
          </div>

          {/* Lo que busca */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Búsqueda</h3>
            <div className="space-y-2 text-sm">
              {contacto.busca_operacion && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Operación</span>
                  <span className="font-medium">{TIPO_OPERACION[contacto.busca_operacion]}</span>
                </div>
              )}
              {contacto.busca_tipo && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipo</span>
                  <span className="font-medium">{TIPO_PROPIEDAD[contacto.busca_tipo]}</span>
                </div>
              )}
              {(contacto.presupuesto_min || contacto.presupuesto_max) && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Presupuesto</span>
                  <span className="font-medium">
                    {contacto.presupuesto_min ? formatPrecio(contacto.presupuesto_min) : '?'} - {contacto.presupuesto_max ? formatPrecio(contacto.presupuesto_max) : '?'}
                  </span>
                </div>
              )}
              {contacto.zona_interes && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Zona</span>
                  <span className="font-medium">{contacto.zona_interes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Propiedad de interés */}
          {contacto.propiedad_referencia && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Propiedad de interés</h3>
              <Link href={`/propiedades/${contacto.propiedad_interes_id}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{contacto.propiedad_titulo}</p>
                  <p className="text-xs text-gray-500 font-mono">{contacto.propiedad_referencia}</p>
                </div>
              </Link>
            </div>
          )}

          {/* Info */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Información</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Agente</span>
                <span className="font-medium">{contacto.agente_nombre || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Creado</span>
                <span className="font-medium">{formatFecha(contacto.created_at)}</span>
              </div>
              {contacto.fecha_ultimo_contacto && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Último contacto</span>
                  <span className="font-medium">{timeAgo(contacto.fecha_ultimo_contacto)}</span>
                </div>
              )}
            </div>
          </div>

          {contacto.notas && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Notas</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{contacto.notas}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal nueva interacción */}
      <Modal open={showInteraccionModal} onClose={() => setShowInteraccionModal(false)} title="Registrar interacción"
        footer={
          <>
            <button onClick={() => setShowInteraccionModal(false)} className="btn-secondary">Cancelar</button>
            <button onClick={crearInteraccion as any} className="btn-primary">Registrar</button>
          </>
        }
      >
        <form onSubmit={crearInteraccion} className="space-y-4">
          <div>
            <label className="label">Tipo de interacción</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(TIPO_INTERACCION) as [TipoInteraccion, { label: string; icon: string }][]).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setInterForm({ ...interForm, tipo: key })}
                  className={`p-3 rounded-lg border text-center text-sm transition-colors ${
                    interForm.tipo === key ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg block mb-1">{config.icon}</span>
                  {config.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea className="input min-h-[100px]" placeholder="Describe la interacción..." value={interForm.descripcion} onChange={(e) => setInterForm({ ...interForm, descripcion: e.target.value })} />
          </div>
          <div>
            <label className="label">Próxima acción</label>
            <input className="input" placeholder="Ej: Llamar para confirmar visita" value={interForm.proxima_accion} onChange={(e) => setInterForm({ ...interForm, proxima_accion: e.target.value })} />
          </div>
          <div>
            <label className="label">Fecha próxima acción</label>
            <input type="datetime-local" className="input" value={interForm.fecha_proxima_accion} onChange={(e) => setInterForm({ ...interForm, fecha_proxima_accion: e.target.value })} />
          </div>
        </form>
      </Modal>

      {/* Modal cambiar estado */}
      <Modal open={showEstadoModal} onClose={() => setShowEstadoModal(false)} title="Cambiar estado" size="sm">
        <div className="space-y-2">
          {(Object.entries(ESTADO_CONTACTO) as [EstadoContacto, { label: string; color: string }][]).map(([key, val]) => (
            <button
              key={key}
              onClick={() => cambiarEstado(key)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors hover:bg-gray-50 border ${
                contacto.estado === key ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
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
