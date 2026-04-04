'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import {
  Settings,
  User,
  Building2,
  Globe,
  Key,
  Save,
  Shield,
} from 'lucide-react'

export default function ConfiguracionPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'perfil' | 'oficina' | 'portales'>('perfil')
  const [saving, setSaving] = useState(false)

  // Perfil
  const [perfil, setPerfil] = useState({
    nombre: '', apellidos: '', telefono: '', bio: '',
  })

  // Config oficina
  const [config, setConfig] = useState({
    idealista_api_key: '', idealista_customer_id: '',
    fotocasa_api_key: '', fotocasa_customer_id: '',
    auto_publicar_idealista: false, auto_publicar_fotocasa: false,
    prefijo_referencia: 'REF', email_notificaciones: '',
  })

  useEffect(() => {
    if (user) {
      setPerfil({
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        telefono: user.telefono || '',
        bio: user.bio || '',
      })
      loadConfig()
    }
  }, [user])

  async function loadConfig() {
    if (!user?.oficina_id) return
    const supabase = createClient()
    const { data } = await supabase
      .from('configuracion_oficina')
      .select('*')
      .eq('oficina_id', user.oficina_id)
      .single()

    if (data) {
      setConfig({
        idealista_api_key: data.idealista_api_key || '',
        idealista_customer_id: data.idealista_customer_id || '',
        fotocasa_api_key: data.fotocasa_api_key || '',
        fotocasa_customer_id: data.fotocasa_customer_id || '',
        auto_publicar_idealista: data.auto_publicar_idealista || false,
        auto_publicar_fotocasa: data.auto_publicar_fotocasa || false,
        prefijo_referencia: data.prefijo_referencia || 'REF',
        email_notificaciones: data.email_notificaciones || '',
      })
    }
  }

  async function guardarPerfil(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('perfiles').update({
      nombre: perfil.nombre,
      apellidos: perfil.apellidos || null,
      telefono: perfil.telefono || null,
      bio: perfil.bio || null,
    }).eq('id', user?.id)

    if (error) toast.error('Error al guardar')
    else toast.success('Perfil actualizado')
    setSaving(false)
  }

  async function guardarConfig(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.oficina_id) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('configuracion_oficina').upsert({
      oficina_id: user.oficina_id,
      idealista_api_key: config.idealista_api_key || null,
      idealista_customer_id: config.idealista_customer_id || null,
      fotocasa_api_key: config.fotocasa_api_key || null,
      fotocasa_customer_id: config.fotocasa_customer_id || null,
      auto_publicar_idealista: config.auto_publicar_idealista,
      auto_publicar_fotocasa: config.auto_publicar_fotocasa,
      prefijo_referencia: config.prefijo_referencia || 'REF',
      email_notificaciones: config.email_notificaciones || null,
    }, { onConflict: 'oficina_id' })

    if (error) toast.error('Error al guardar')
    else toast.success('Configuración guardada')
    setSaving(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona tu perfil y la configuración de tu oficina</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        {[
          { id: 'perfil', label: 'Mi perfil', icon: User },
          { id: 'oficina', label: 'Oficina', icon: Building2 },
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

      {/* Mi perfil */}
      {tab === 'perfil' && (
        <form onSubmit={guardarPerfil} className="card p-6 max-w-2xl space-y-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {user?.nombre?.[0]}{(user?.apellidos || '')[0] || ''}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.email}</p>
              <p className="text-sm text-gray-500 capitalize">{user?.rol}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre</label>
              <input className="input" value={perfil.nombre} onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })} />
            </div>
            <div>
              <label className="label">Apellidos</label>
              <input className="input" value={perfil.apellidos} onChange={(e) => setPerfil({ ...perfil, apellidos: e.target.value })} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input className="input" value={perfil.telefono} onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea className="input min-h-[80px]" value={perfil.bio} onChange={(e) => setPerfil({ ...perfil, bio: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      )}

      {/* Oficina */}
      {tab === 'oficina' && (
        <form onSubmit={guardarConfig} className="card p-6 max-w-2xl space-y-5">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 mb-4">
            <Shield className="w-4 h-4 flex-shrink-0" />
            Solo los administradores y directores pueden modificar esta configuración
          </div>

          <div>
            <label className="label">Prefijo de referencia</label>
            <input className="input max-w-[200px]" placeholder="REF" value={config.prefijo_referencia} onChange={(e) => setConfig({ ...config, prefijo_referencia: e.target.value })} />
            <p className="text-xs text-gray-500 mt-1">Las propiedades se numerarán como {config.prefijo_referencia || 'REF'}-0001</p>
          </div>

          <div>
            <label className="label">Email de notificaciones</label>
            <input type="email" className="input" placeholder="notificaciones@tuoficina.com" value={config.email_notificaciones} onChange={(e) => setConfig({ ...config, email_notificaciones: e.target.value })} />
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      )}

      {/* Portales */}
      {tab === 'portales' && (
        <form onSubmit={guardarConfig} className="card p-6 max-w-2xl space-y-6">
          {/* Idealista */}
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-green-600" /> Idealista
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">API Key</label>
                <input type="password" className="input font-mono" placeholder="Tu API Key de Idealista" value={config.idealista_api_key} onChange={(e) => setConfig({ ...config, idealista_api_key: e.target.value })} />
              </div>
              <div>
                <label className="label">Customer ID</label>
                <input className="input font-mono" placeholder="Tu Customer ID" value={config.idealista_customer_id} onChange={(e) => setConfig({ ...config, idealista_customer_id: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" checked={config.auto_publicar_idealista} onChange={(e) => setConfig({ ...config, auto_publicar_idealista: e.target.checked })} />
                Auto-publicar nuevas propiedades en Idealista
              </label>
            </div>
          </div>

          <hr />

          {/* Fotocasa */}
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-blue-600" /> Fotocasa
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">API Key</label>
                <input type="password" className="input font-mono" placeholder="Tu API Key de Fotocasa" value={config.fotocasa_api_key} onChange={(e) => setConfig({ ...config, fotocasa_api_key: e.target.value })} />
              </div>
              <div>
                <label className="label">Customer ID</label>
                <input className="input font-mono" placeholder="Tu Customer ID" value={config.fotocasa_customer_id} onChange={(e) => setConfig({ ...config, fotocasa_customer_id: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" checked={config.auto_publicar_fotocasa} onChange={(e) => setConfig({ ...config, auto_publicar_fotocasa: e.target.checked })} />
                Auto-publicar nuevas propiedades en Fotocasa
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar configuración de portales'}
          </button>
        </form>
      )}
    </div>
  )
}
