'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  Briefcase,
  MapPin,
  Globe,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Home,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Propiedades', href: '/propiedades', icon: Building2 },
  { name: 'Contactos', href: '/contactos', icon: Users },
  { name: 'Captación', href: '/captacion', icon: UserPlus },
  { name: 'Portales', href: '/portales', icon: Globe },
  { name: 'Agentes', href: '/agentes', icon: Briefcase },
  { name: 'Oficinas', href: '/oficinas', icon: MapPin },
  { name: 'Configuración', href: '/configuracion', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Cerrar mobile sidebar al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Bloquear scroll cuando el menú mobile está abierto
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const rolLabel: Record<string, string> = {
    admin: 'Administrador',
    director: 'Director',
    agente: 'Agente',
  }

  return (
    <>
      {/* Header mobile con hamburguesa */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-gray-900">CRM Inmobiliario</span>
        </div>
      </header>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-sidebar z-50 flex flex-col transition-all duration-300 ease-in-out',
          // Desktop: respeta collapsed
          collapsed ? 'lg:w-[72px]' : 'lg:w-64',
          // Mobile: full width hasta 280px
          'w-[280px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 lg:h-16 px-4 border-b border-white/10">
          {(!collapsed || mobileOpen) && (
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold text-sm">CRM Inmobiliario</span>
            </Link>
          )}
          {/* Botón cerrar en mobile, colapsar en desktop */}
          <button
            onClick={() => {
              if (mobileOpen) {
                setMobileOpen(false)
              } else {
                setCollapsed(!collapsed)
              }
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-sidebar-hover transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> :
              collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            const showLabel = !collapsed || mobileOpen
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  isActive ? 'sidebar-link-active' : 'sidebar-link-inactive',
                  !showLabel && 'justify-center px-0'
                )}
                title={!showLabel ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {showLabel && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className={cn('border-t border-white/10 p-3', !collapsed || mobileOpen ? '' : 'flex flex-col items-center')}>
          {(!collapsed || mobileOpen) && user && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium text-white truncate">
                {user.nombre} {user.apellidos}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {rolLabel[user.rol] || user.rol}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'sidebar-link-inactive w-full text-red-400 hover:text-red-300 hover:bg-red-500/10',
              collapsed && !mobileOpen && 'justify-center px-0'
            )}
            title={collapsed && !mobileOpen ? 'Cerrar sesión' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
