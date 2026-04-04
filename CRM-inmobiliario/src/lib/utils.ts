import { type EstadoPropiedad, type EstadoContacto, type EstadoCaptacion, type EstadoPublicacion, type TipoOperacion, type TipoPropiedad, type OrigenContacto, type TipoInteraccion } from '@/types/database'

export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatPrecio(precio: number | null): string {
  if (!precio) return '-'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(precio)
}

export function formatFecha(fecha: string | null): string {
  if (!fecha) return '-'
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(fecha))
}

export function formatFechaHora(fecha: string | null): string {
  if (!fecha) return '-'
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(fecha))
}

export function timeAgo(fecha: string): string {
  const now = new Date()
  const then = new Date(fecha)
  const diff = now.getTime() - then.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `Hace ${days}d`
  return formatFecha(fecha)
}

export const ESTADO_PROPIEDAD: Record<EstadoPropiedad, { label: string; color: string }> = {
  disponible: { label: 'Disponible', color: 'bg-emerald-100 text-emerald-800' },
  reservada: { label: 'Reservada', color: 'bg-amber-100 text-amber-800' },
  vendida: { label: 'Vendida', color: 'bg-blue-100 text-blue-800' },
  alquilada: { label: 'Alquilada', color: 'bg-purple-100 text-purple-800' },
  retirada: { label: 'Retirada', color: 'bg-gray-100 text-gray-800' },
  borrador: { label: 'Borrador', color: 'bg-slate-100 text-slate-600' },
}

export const ESTADO_CONTACTO: Record<EstadoContacto, { label: string; color: string }> = {
  nuevo: { label: 'Nuevo', color: 'bg-blue-100 text-blue-800' },
  contactado: { label: 'Contactado', color: 'bg-cyan-100 text-cyan-800' },
  en_seguimiento: { label: 'En seguimiento', color: 'bg-amber-100 text-amber-800' },
  visitado: { label: 'Visitado', color: 'bg-purple-100 text-purple-800' },
  negociando: { label: 'Negociando', color: 'bg-orange-100 text-orange-800' },
  cerrado_ganado: { label: 'Cerrado (ganado)', color: 'bg-emerald-100 text-emerald-800' },
  cerrado_perdido: { label: 'Cerrado (perdido)', color: 'bg-red-100 text-red-800' },
  inactivo: { label: 'Inactivo', color: 'bg-gray-100 text-gray-600' },
}

export const ESTADO_CAPTACION: Record<EstadoCaptacion, { label: string; color: string }> = {
  prospecto: { label: 'Prospecto', color: 'bg-slate-100 text-slate-700' },
  contactado: { label: 'Contactado', color: 'bg-blue-100 text-blue-800' },
  valoracion: { label: 'En valoración', color: 'bg-amber-100 text-amber-800' },
  firmado: { label: 'Firmado', color: 'bg-emerald-100 text-emerald-800' },
  descartado: { label: 'Descartado', color: 'bg-red-100 text-red-800' },
}

export const ESTADO_PUBLICACION: Record<EstadoPublicacion, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800' },
  publicado: { label: 'Publicado', color: 'bg-emerald-100 text-emerald-800' },
  pausado: { label: 'Pausado', color: 'bg-gray-100 text-gray-600' },
  error: { label: 'Error', color: 'bg-red-100 text-red-800' },
  expirado: { label: 'Expirado', color: 'bg-slate-100 text-slate-600' },
}

export const TIPO_OPERACION: Record<TipoOperacion, string> = {
  venta: 'Venta',
  alquiler: 'Alquiler',
  alquiler_opcion_compra: 'Alquiler con opción a compra',
  traspaso: 'Traspaso',
}

export const TIPO_PROPIEDAD: Record<TipoPropiedad, string> = {
  piso: 'Piso',
  casa: 'Casa',
  chalet: 'Chalet',
  atico: 'Ático',
  duplex: 'Dúplex',
  estudio: 'Estudio',
  local: 'Local comercial',
  oficina: 'Oficina',
  garaje: 'Garaje',
  trastero: 'Trastero',
  terreno: 'Terreno',
  edificio: 'Edificio',
}

export const ORIGEN_CONTACTO: Record<OrigenContacto, string> = {
  idealista: 'Idealista',
  fotocasa: 'Fotocasa',
  web: 'Web propia',
  telefono: 'Teléfono',
  referido: 'Referido',
  captacion: 'Captación',
  walkin: 'Walk-in',
  redes_sociales: 'Redes sociales',
  otro: 'Otro',
}

export const TIPO_INTERACCION: Record<TipoInteraccion, { label: string; icon: string }> = {
  llamada: { label: 'Llamada', icon: '📞' },
  email: { label: 'Email', icon: '✉️' },
  whatsapp: { label: 'WhatsApp', icon: '💬' },
  visita: { label: 'Visita', icon: '🏠' },
  reunion: { label: 'Reunión', icon: '🤝' },
  nota: { label: 'Nota', icon: '📝' },
}
