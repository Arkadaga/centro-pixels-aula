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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

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

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const rolLabel = {
    admin: 'Administrador',
    director: 'Director',
    agente: 'Agente',
  }

  return (
    <>
      {/* Botón mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-sidebar z-50 flex flex-col transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className={cn('flex items-center h-16 px-4 border-b border-white/10', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-white font-semibold text-sm">CRM Inmobiliario</span>
            </Link>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false) }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-sidebar-hover transition-colors"
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  isActive ? 'sidebar-link-active' : 'sidebar-link-inactive',
                  collapsed && 'justify-center px-0'
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className={cn('border-t border-white/10 p-3', collapsed && 'flex flex-col items-center')}>
          {!collapsed && user && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium text-white truncate">
                {user.nombre} {user.apellidos}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {rolLabel[user.rol]}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'sidebar-link-inactive w-full text-red-400 hover:text-red-300 hover:bg-red-500/10',
              collapsed && 'justify-center px-0'
            )}
            title={collapsed ? 'Cerrar sesión' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
