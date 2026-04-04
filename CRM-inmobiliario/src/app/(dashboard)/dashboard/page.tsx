'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import { formatPrecio, formatFecha, timeAgo, ESTADO_PROPIEDAD, ESTADO_CONTACTO } from '@/lib/utils'
import {
  Building2,
  Users,
  UserPlus,
  Globe,
  Calendar,
  TrendingUp,
  Eye,
  Clock,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  propiedades_disponibles: number
  propiedades_reservadas: number
  propiedades_vendidas: number
  leads_nuevos: number
  leads_activos: number
  captaciones_activas: number
  visitas_pendientes: number
  publicaciones_activas: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [propiedadesRecientes, setPropiedadesRecientes] = useState<any[]>([])
  const [contactosRecientes, setContactosRecientes] = useState<any[]>([])
  const [actividadReciente, setActividadReciente] = useState<any[]>([])
  const [visitasHoy, setVisitasHoy] = useState<any[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const supabase = createClient()

    // Stats
    const { data: statsData } = await supabase.from('vista_dashboard').select('*').single()
    if (statsData) setStats(statsData)

    // Propiedades recientes
    const { data: props } = await supabase
      .from('propiedades')
      .select('id, referencia, titulo, tipo, operacion, estado, precio, ciudad, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    if (props) setPropiedadesRecientes(props)

    // Contactos recientes
    const { data: contacts } = await supabase
      .from('contactos')
      .select('id, nombre, apellidos, estado, origen, telefono, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    if (contacts) setContactosRecientes(contacts)

    // Actividad reciente
    const { data: activity } = await supabase
      .from('actividad')
      .select('id, accion, entidad, descripcion, created_at')
      .order('created_at', { ascending: false })
      .limit(8)
    if (activity) setActividadReciente(activity)

    // Visitas de hoy
    const today = new Date().toISOString().split('T')[0]
    const { data: visits } = await supabase
      .from('visitas')
      .select('id, fecha, notas, cancelada, propiedad_id, contacto_id')
      .gte('fecha', today + 'T00:00:00')
      .lte('fecha', today + 'T23:59:59')
      .eq('cancelada', false)
      .order('fecha', { ascending: true })
      .limit(5)
    if (visits) setVisitasHoy(visits)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">
          Hola, {user?.nombre} 👋
        </h1>
        <p className="text-gray-500 mt-1">Aquí tienes el resumen de tu actividad</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Propiedades disponibles"
          value={stats?.propiedades_disponibles ?? 0}
          icon={Building2}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Leads nuevos"
          value={stats?.leads_nuevos ?? 0}
          icon={Users}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Captaciones activas"
          value={stats?.captaciones_activas ?? 0}
          icon={UserPlus}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Publicaciones activas"
          value={stats?.publicaciones_activas ?? 0}
          icon={Globe}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Stats secundarias */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.propiedades_reservadas ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Reservadas</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{stats?.propiedades_vendidas ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Vendidas</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.leads_activos ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Leads activos</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-brand-600">{stats?.visitas_pendientes ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Visitas pendientes</p>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Propiedades recientes */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Propiedades recientes</h2>
              <Link href="/propiedades" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {propiedadesRecientes.length === 0 ? (
                <p className="text-sm text-gray-500 p-5">No hay propiedades aún</p>
              ) : (
                propiedadesRecientes.map((prop) => (
                  <Link
                    key={prop.id}
                    href={`/propiedades/${prop.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{prop.titulo}</p>
                        <p className="text-xs text-gray-500">{prop.referencia} · {prop.ciudad}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <Badge className={ESTADO_PROPIEDAD[prop.estado as keyof typeof ESTADO_PROPIEDAD]?.color}>
                        {ESTADO_PROPIEDAD[prop.estado as keyof typeof ESTADO_PROPIEDAD]?.label}
                      </Badge>
                      <span className="text-sm font-semibold text-gray-900">{formatPrecio(prop.precio)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Visitas de hoy */}
        <div>
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Visitas hoy</h2>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <div className="divide-y divide-gray-100">
              {visitasHoy.length === 0 ? (
                <div className="p-5 text-center">
                  <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay visitas para hoy</p>
                </div>
              ) : (
                visitasHoy.map((visita) => (
                  <div key={visita.id} className="px-5 py-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(visita.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {visita.notas && <p className="text-xs text-gray-500 ml-5">{visita.notas}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Contactos recientes */}
          <div className="card mt-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Últimos leads</h2>
              <Link href="/contactos" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {contactosRecientes.length === 0 ? (
                <p className="text-sm text-gray-500 p-5">No hay contactos aún</p>
              ) : (
                contactosRecientes.map((contact) => (
                  <Link
                    key={contact.id}
                    href={`/contactos/${contact.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.nombre} {contact.apellidos}
                      </p>
                      <p className="text-xs text-gray-500">{timeAgo(contact.created_at)}</p>
                    </div>
                    <Badge className={ESTADO_CONTACTO[contact.estado as keyof typeof ESTADO_CONTACTO]?.color}>
                      {ESTADO_CONTACTO[contact.estado as keyof typeof ESTADO_CONTACTO]?.label}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Actividad reciente</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {actividadReciente.length === 0 ? (
            <p className="text-sm text-gray-500 p-5">Sin actividad reciente</p>
          ) : (
            actividadReciente.map((act) => (
              <div key={act.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-2 h-2 bg-brand-400 rounded-full flex-shrink-0" />
                <p className="text-sm text-gray-700 flex-1">{act.descripcion || `${act.accion} ${act.entidad}`}</p>
                <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(act.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
