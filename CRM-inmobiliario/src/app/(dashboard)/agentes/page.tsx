'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import SearchInput from '@/components/ui/SearchInput'
import { formatFecha } from '@/lib/utils'
import type { Perfil } from '@/types/database'
import {
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Building2,
  Users,
  Star,
  TrendingUp,
} from 'lucide-react'

export default function AgentesPage() {
  const [agentes, setAgentes] = useState<(Perfil & { oficina_nombre?: string; num_propiedades?: number; num_contactos?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadAgentes() }, [])

  async function loadAgentes() {
    const supabase = createClient()
    const { data } = await supabase
      .from('perfiles')
      .select('*, oficinas(nombre)')
      .in('rol', ['agente', 'director', 'admin'])
      .eq('activo', true)
      .order('nombre')

    if (data) {
      // Cargar stats por agente
      const agentesConStats = await Promise.all(data.map(async (a: any) => {
        const { count: numProps } = await supabase
          .from('propiedades')
          .select('*', { count: 'exact', head: true })
          .eq('agente_id', a.id)

        const { count: numContacts } = await supabase
          .from('contactos')
          .select('*', { count: 'exact', head: true })
          .eq('agente_id', a.id)

        return {
          ...a,
          oficina_nombre: a.oficinas?.nombre,
          num_propiedades: numProps || 0,
          num_contactos: numContacts || 0,
        }
      }))
      setAgentes(agentesConStats)
    }
    setLoading(false)
  }

  const filtered = agentes.filter(a => {
    if (!search) return true
    const s = search.toLowerCase()
    return a.nombre.toLowerCase().includes(s) ||
      (a.apellidos || '').toLowerCase().includes(s) ||
      a.email.toLowerCase().includes(s)
  })

  const rolLabel: Record<string, string> = { admin: 'Administrador', director: 'Director', agente: 'Agente' }
  const rolColor: Record<string, string> = { admin: 'bg-purple-100 text-purple-800', director: 'bg-blue-100 text-blue-800', agente: 'bg-gray-100 text-gray-700' }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agentes</h1>
          <p className="text-sm text-gray-500 mt-1">{agentes.length} agentes activos</p>
        </div>
      </div>

      <div className="max-w-md">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar agente..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="Sin agentes" description="No hay agentes registrados" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agente) => (
            <div key={agente.id} className="card-hover p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {agente.nombre[0]}{(agente.apellidos || '')[0] || ''}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {agente.nombre} {agente.apellidos}
                  </h3>
                  <Badge className={rolColor[agente.rol]}>
                    {rolLabel[agente.rol]}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" /> {agente.email}
                </p>
                {agente.telefono && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" /> {agente.telefono}
                  </p>
                )}
                {agente.oficina_nombre && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" /> {agente.oficina_nombre}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{agente.num_propiedades}</p>
                  <p className="text-xs text-gray-500">Propiedades</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{agente.num_contactos}</p>
                  <p className="text-xs text-gray-500">Contactos</p>
                </div>
              </div>

              {agente.comision_porcentaje > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Comisión</span>
                  <span className="font-semibold text-gray-900">{agente.comision_porcentaje}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
