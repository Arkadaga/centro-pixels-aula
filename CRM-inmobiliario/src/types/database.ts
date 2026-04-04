export type RolUsuario = 'admin' | 'director' | 'agente'
export type TipoPropiedad = 'piso' | 'casa' | 'chalet' | 'atico' | 'duplex' | 'estudio' | 'local' | 'oficina' | 'garaje' | 'trastero' | 'terreno' | 'edificio'
export type TipoOperacion = 'venta' | 'alquiler' | 'alquiler_opcion_compra' | 'traspaso'
export type EstadoPropiedad = 'disponible' | 'reservada' | 'vendida' | 'alquilada' | 'retirada' | 'borrador'
export type EstadoContacto = 'nuevo' | 'contactado' | 'en_seguimiento' | 'visitado' | 'negociando' | 'cerrado_ganado' | 'cerrado_perdido' | 'inactivo'
export type OrigenContacto = 'idealista' | 'fotocasa' | 'web' | 'telefono' | 'referido' | 'captacion' | 'walkin' | 'redes_sociales' | 'otro'
export type EstadoCaptacion = 'prospecto' | 'contactado' | 'valoracion' | 'firmado' | 'descartado'
export type TipoInteraccion = 'llamada' | 'email' | 'whatsapp' | 'visita' | 'reunion' | 'nota'
export type EstadoPublicacion = 'pendiente' | 'publicado' | 'pausado' | 'error' | 'expirado'

export interface Oficina {
  id: string
  nombre: string
  direccion: string | null
  ciudad: string | null
  provincia: string | null
  codigo_postal: string | null
  telefono: string | null
  email: string | null
  foto_url: string | null
  activa: boolean
  created_at: string
  updated_at: string
}

export interface Perfil {
  id: string
  nombre: string
  apellidos: string | null
  email: string
  telefono: string | null
  rol: RolUsuario
  oficina_id: string | null
  foto_url: string | null
  bio: string | null
  licencia: string | null
  comision_porcentaje: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Propiedad {
  id: string
  referencia: string
  oficina_id: string
  agente_id: string | null
  titulo: string
  descripcion: string | null
  tipo: TipoPropiedad
  operacion: TipoOperacion
  estado: EstadoPropiedad
  precio: number | null
  precio_comunidad: number | null
  precio_ibi: number | null
  direccion: string | null
  ciudad: string | null
  provincia: string | null
  codigo_postal: string | null
  barrio: string | null
  latitud: number | null
  longitud: number | null
  ocultar_direccion: boolean
  superficie_construida: number | null
  superficie_util: number | null
  superficie_parcela: number | null
  habitaciones: number
  banos: number
  planta: string | null
  ascensor: boolean
  parking: boolean
  trastero: boolean
  terraza: boolean
  balcon: boolean
  jardin: boolean
  piscina: boolean
  aire_acondicionado: boolean
  calefaccion: boolean
  amueblado: boolean
  certificado_energetico: string | null
  consumo_energetico: number | null
  emisiones_co2: number | null
  ano_construccion: number | null
  orientacion: string | null
  estado_conservacion: string | null
  observaciones_internas: string | null
  destacada: boolean
  created_at: string
  updated_at: string
  // Campos de vista
  oficina_nombre?: string
  agente_nombre?: string
  imagen_principal?: string
  num_imagenes?: number
  num_leads?: number
  num_visitas?: number
}

export interface PropiedadImagen {
  id: string
  propiedad_id: string
  url: string
  orden: number
  es_principal: boolean
  descripcion: string | null
  created_at: string
}

export interface Contacto {
  id: string
  nombre: string
  apellidos: string | null
  email: string | null
  telefono: string | null
  telefono2: string | null
  estado: EstadoContacto
  origen: OrigenContacto
  busca_operacion: TipoOperacion | null
  busca_tipo: TipoPropiedad | null
  presupuesto_min: number | null
  presupuesto_max: number | null
  zona_interes: string | null
  habitaciones_min: number | null
  superficie_min: number | null
  agente_id: string | null
  oficina_id: string | null
  propiedad_interes_id: string | null
  puntuacion: number
  notas: string | null
  fecha_ultimo_contacto: string | null
  created_at: string
  updated_at: string
  // Campos de vista
  nombre_completo?: string
  agente_nombre?: string
  oficina_nombre?: string
  propiedad_titulo?: string
  propiedad_referencia?: string
  num_interacciones?: number
  num_visitas?: number
}

export interface Interaccion {
  id: string
  contacto_id: string
  agente_id: string | null
  tipo: TipoInteraccion
  descripcion: string | null
  propiedad_id: string | null
  fecha: string
  proxima_accion: string | null
  fecha_proxima_accion: string | null
  created_at: string
}

export interface Visita {
  id: string
  propiedad_id: string
  contacto_id: string
  agente_id: string | null
  fecha: string
  duracion_minutos: number
  notas: string | null
  resultado: string | null
  feedback_cliente: string | null
  cancelada: boolean
  created_at: string
}

export interface Captacion {
  id: string
  propietario_nombre: string
  propietario_telefono: string | null
  propietario_email: string | null
  direccion: string | null
  ciudad: string | null
  provincia: string | null
  tipo: TipoPropiedad | null
  superficie: number | null
  habitaciones: number | null
  precio_estimado: number | null
  precio_propietario: number | null
  estado: EstadoCaptacion
  agente_id: string | null
  oficina_id: string | null
  origen: string | null
  notas: string | null
  valoracion_min: number | null
  valoracion_max: number | null
  fecha_valoracion: string | null
  propiedad_id: string | null
  fecha_firma_mandato: string | null
  created_at: string
  updated_at: string
}

export interface PublicacionPortal {
  id: string
  propiedad_id: string
  portal: string
  estado: EstadoPublicacion
  id_externo: string | null
  url_publicacion: string | null
  fecha_publicacion: string | null
  fecha_actualizacion: string | null
  fecha_expiracion: string | null
  error_mensaje: string | null
  auto_publicar: boolean
  created_at: string
  updated_at: string
}

export interface Actividad {
  id: string
  usuario_id: string | null
  accion: string
  entidad: string
  entidad_id: string | null
  descripcion: string | null
  datos_extra: Record<string, unknown> | null
  created_at: string
}

// Tipo genérico para Supabase
export interface Database {
  public: {
    Tables: {
      oficinas: { Row: Oficina; Insert: Partial<Oficina>; Update: Partial<Oficina> }
      perfiles: { Row: Perfil; Insert: Partial<Perfil>; Update: Partial<Perfil> }
      propiedades: { Row: Propiedad; Insert: Partial<Propiedad>; Update: Partial<Propiedad> }
      propiedad_imagenes: { Row: PropiedadImagen; Insert: Partial<PropiedadImagen>; Update: Partial<PropiedadImagen> }
      contactos: { Row: Contacto; Insert: Partial<Contacto>; Update: Partial<Contacto> }
      interacciones: { Row: Interaccion; Insert: Partial<Interaccion>; Update: Partial<Interaccion> }
      visitas: { Row: Visita; Insert: Partial<Visita>; Update: Partial<Visita> }
      captaciones: { Row: Captacion; Insert: Partial<Captacion>; Update: Partial<Captacion> }
      publicaciones_portales: { Row: PublicacionPortal; Insert: Partial<PublicacionPortal>; Update: Partial<PublicacionPortal> }
      actividad: { Row: Actividad; Insert: Partial<Actividad>; Update: Partial<Actividad> }
    }
    Views: {
      vista_propiedades: { Row: Propiedad }
      vista_contactos: { Row: Contacto }
    }
  }
}
