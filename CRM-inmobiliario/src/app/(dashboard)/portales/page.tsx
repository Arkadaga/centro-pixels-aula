'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { formatFecha, ESTADO_PUBLICACION } from '@/lib/utils'
import type { PublicacionPortal } from '@/types/database'
import {
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Building2,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function PortalesPage() {
  const [publicaciones, setPublicaciones] = useState<(PublicacionPortal & { propiedad_titulo?: string; propiedad_referencia?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroPortal, setFiltroPortal] = useState<string>('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')

  useEffect(() => { loadPublicaciones() }, [])

  async function loadPublicaciones() {
    const supabase = createClient()
    const { data } = await supabase
      .from('publicaciones_portales')
      .select('*, propiedades(titulo, referencia)')
      .order('updated_at', { ascending: false })

    if (data) {
      setPublicaciones(data.map((p: any) => ({
        ...p,
        propiedad_titulo: p.propiedades?.titulo,
        propiedad_referencia: p.propiedades?.referencia,
      })))
    }
    setLoading(false)
  }

  async function reintentarPublicacion(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('publicaciones_portales')
      .update({ estado: 'pendiente', error_mensaje: null })
      .eq('id', id)

    if (error) toast.error('Error')
    else { toast.success('Reintentando publicación...'); loadPublicaciones() }
  }

  const statsIdealist = publicaciones.filter(p => p.portal === 'idealista')
  const statsFotocasa = publicaciones.filter(p => p.portal === 'fotocasa')

  const filtered = publicaciones.filter(p => {
    if (filtroPortal && p.portal !== filtroPortal) return false
    if (filtroEstado && p.estado !== filtroEstado) return false
    return true
  })

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Portales inmobiliarios</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona las publicaciones en Idealista y Fotocasa</p>
        </div>
      </div>

      {/* Resumen portales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Idealista */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Idealista</h3>
                <p className="text-xs text-gray-500">{statsIdealist.length} publicaciones</p>
              </div>
            </div>
            <Badge className={statsIdealist.some(p => p.estado === 'error') ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}>
              {statsIdealist.some(p => p.estado === 'error') ? 'Con errores' : 'Operativo'}
            </Badge>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-emerald-600">{statsIdealist.filter(p => p.estado === 'publicado').length}</p>
              <p className="text-xs text-gray-500">Publicados</p>
            </div>
            <div>
              <p className="text-xl font-bold text-amber-600">{statsIdealist.filter(p => p.estado === 'pendiente').length}</p>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-500">{statsIdealist.filter(p => p.estado === 'pausado').length}</p>
              <p className="text-xs text-gray-500">Pausados</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-600">{statsIdealist.filter(p => p.estado === 'error').length}</p>
              <p className="text-xs text-gray-500">Errores</p>
            </div>
          </div>
        </div>

        {/* Fotocasa */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fotocasa</h3>
                <p className="text-xs text-gray-500">{statsFotocasa.length} publicaciones</p>
              </div>
            </div>
            <Badge className={statsFotocasa.some(p => p.estado === 'error') ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}>
              {statsFotocasa.some(p => p.estado === 'error') ? 'Con errores' : 'Operativo'}
            </Badge>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-emerald-600">{statsFotocasa.filter(p => p.estado === 'publicado').length}</p>
              <p className="text-xs text-gray-500">Publicados</p>
            </div>
            <div>
              <p className="text-xl font-bold text-amber-600">{statsFotocasa.filter(p => p.estado === 'pendiente').length}</p>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-500">{statsFotocasa.filter(p => p.estado === 'pausado').length}</p>
              <p className="text-xs text-gray-500">Pausados</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-600">{statsFotocasa.filter(p => p.estado === 'error').length}</p>
              <p className="text-xs text-gray-500">Errores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <select className="select w-40" value={filtroPortal} onChange={(e) => setFiltroPortal(e.target.value)}>
          <option value="">Todos los portales</option>
          <option value="idealista">Idealista</option>
          <option value="fotocasa">Fotocasa</option>
        </select>
        <select className="select w-40" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADO_PUBLICACION).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="Sin publicaciones"
          description="Publica tus propiedades en Idealista y Fotocasa desde la ficha de cada propiedad"
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Propiedad</th>
                <th>Portal</th>
                <th>Estado</th>
                <th>ID externo</th>
                <th>Publicado</th>
                <th>Actualizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pub) => (
                <tr key={pub.id}>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900">{pub.propiedad_titulo}</p>
                      <p className="text-xs text-gray-500 font-mono">{pub.propiedad_referencia}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`font-medium capitalize ${pub.portal === 'idealista' ? 'text-green-700' : 'text-blue-700'}`}>
                      {pub.portal}
                    </span>
                  </td>
                  <td>
                    <Badge className={ESTADO_PUBLICACION[pub.estado]?.color}>
                      {ESTADO_PUBLICACION[pub.estado]?.label}
                    </Badge>
                  </td>
                  <td className="text-sm text-gray-500 font-mono">{pub.id_externo || '-'}</td>
                  <td className="text-sm text-gray-500">{formatFecha(pub.fecha_publicacion)}</td>
                  <td className="text-sm text-gray-500">{formatFecha(pub.updated_at)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {pub.url_publicacion && (
                        <a href={pub.url_publicacion} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {pub.estado === 'error' && (
                        <button onClick={() => reintentarPublicacion(pub.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-amber-500 hover:text-amber-600" title="Reintentar">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
