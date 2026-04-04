/**
 * Servicio de integración con portales inmobiliarios
 *
 * Este módulo gestiona la publicación automática de propiedades
 * en Idealista y Fotocasa.
 *
 * NOTA: Las APIs de Idealista y Fotocasa requieren acuerdos comerciales.
 * Este código prepara la estructura para cuando se tengan las credenciales.
 *
 * Flujo de publicación:
 * 1. El agente marca la propiedad para publicar en un portal
 * 2. Se crea un registro en publicaciones_portales con estado 'pendiente'
 * 3. Un job (Edge Function o cron) lee las pendientes y las envía a la API
 * 4. Se actualiza el estado a 'publicado' o 'error'
 *
 * Para auto-publicación:
 * - Se configura en configuracion_oficina (auto_publicar_idealista/fotocasa)
 * - Al crear una propiedad con estado 'disponible', se crea automáticamente
 *   el registro de publicación pendiente
 */

import { createClient } from './supabase'
import type { Propiedad } from '@/types/database'

interface PortalConfig {
  api_key: string
  customer_id: string
}

// Mapeo de campos al formato XML/JSON que espera Idealista
export function mapPropiedadToIdealista(propiedad: Propiedad) {
  return {
    propertyCode: propiedad.referencia,
    propertyType: mapTipoToIdealista(propiedad.tipo),
    propertySubtype: propiedad.tipo,
    operation: propiedad.operacion === 'venta' ? 'sale' : 'rent',
    price: propiedad.precio,
    description: propiedad.descripcion,
    address: {
      addressLine: propiedad.direccion,
      postalCode: propiedad.codigo_postal,
      city: propiedad.ciudad,
      province: propiedad.provincia,
      country: 'ES',
      latitude: propiedad.latitud,
      longitude: propiedad.longitud,
      showAddress: !propiedad.ocultar_direccion,
    },
    features: {
      bedrooms: propiedad.habitaciones,
      bathrooms: propiedad.banos,
      constructedArea: propiedad.superficie_construida,
      usableArea: propiedad.superficie_util,
      plotArea: propiedad.superficie_parcela,
      floor: propiedad.planta,
      hasLift: propiedad.ascensor,
      hasParking: propiedad.parking,
      hasStorageRoom: propiedad.trastero,
      hasTerrace: propiedad.terraza,
      hasBalcony: propiedad.balcon,
      hasGarden: propiedad.jardin,
      hasPool: propiedad.piscina,
      hasAirConditioning: propiedad.aire_acondicionado,
      hasHeating: propiedad.calefaccion,
      isFurnished: propiedad.amueblado,
    },
    energyCertificate: propiedad.certificado_energetico ? {
      rating: propiedad.certificado_energetico,
      consumption: propiedad.consumo_energetico,
      emissions: propiedad.emisiones_co2,
    } : undefined,
    communityFees: propiedad.precio_comunidad,
    yearBuilt: propiedad.ano_construccion,
  }
}

// Mapeo de campos al formato que espera Fotocasa
export function mapPropiedadToFotocasa(propiedad: Propiedad) {
  return {
    reference: propiedad.referencia,
    type: mapTipoToFotocasa(propiedad.tipo),
    transaction: propiedad.operacion === 'venta' ? 1 : 2,
    price: propiedad.precio,
    description: propiedad.descripcion,
    location: {
      address: propiedad.direccion,
      zipCode: propiedad.codigo_postal,
      city: propiedad.ciudad,
      province: propiedad.provincia,
      latitude: propiedad.latitud,
      longitude: propiedad.longitud,
    },
    surface: propiedad.superficie_construida,
    rooms: propiedad.habitaciones,
    bathrooms: propiedad.banos,
    floor: propiedad.planta,
    features: {
      elevator: propiedad.ascensor,
      parking: propiedad.parking,
      terrace: propiedad.terraza,
      airConditioning: propiedad.aire_acondicionado,
      heating: propiedad.calefaccion,
      pool: propiedad.piscina,
      garden: propiedad.jardin,
      furnished: propiedad.amueblado,
    },
    energyRating: propiedad.certificado_energetico,
  }
}

function mapTipoToIdealista(tipo: string): string {
  const map: Record<string, string> = {
    piso: 'flat', casa: 'house', chalet: 'chalet', atico: 'penthouse',
    duplex: 'duplex', estudio: 'studio', local: 'premises', oficina: 'office',
    garaje: 'garage', trastero: 'storageRoom', terreno: 'land', edificio: 'building',
  }
  return map[tipo] || 'flat'
}

function mapTipoToFotocasa(tipo: string): number {
  const map: Record<string, number> = {
    piso: 1, casa: 2, chalet: 3, atico: 4, duplex: 5, estudio: 6,
    local: 7, oficina: 8, garaje: 9, trastero: 10, terreno: 11, edificio: 12,
  }
  return map[tipo] || 1
}

/**
 * Publica una propiedad en un portal
 * Esta función será llamada por la Edge Function / API route
 */
export async function publicarEnPortal(
  propiedad: Propiedad,
  portal: 'idealista' | 'fotocasa',
  config: PortalConfig
): Promise<{ success: boolean; id_externo?: string; error?: string }> {
  try {
    const payload = portal === 'idealista'
      ? mapPropiedadToIdealista(propiedad)
      : mapPropiedadToFotocasa(propiedad)

    // TODO: Implementar llamada real a la API del portal
    // cuando se tengan las credenciales y documentación oficial
    //
    // const response = await fetch(portalApiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${config.api_key}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(payload),
    // })

    console.log(`[Portales] Publicando en ${portal}:`, payload)

    return {
      success: true,
      id_externo: `${portal.toUpperCase()}-${Date.now()}`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error desconocido',
    }
  }
}

/**
 * Procesa las publicaciones pendientes
 * Diseñado para ejecutarse como cron job o Edge Function
 */
export async function procesarPublicacionesPendientes() {
  const supabase = createClient()

  const { data: pendientes } = await supabase
    .from('publicaciones_portales')
    .select('*, propiedades(*)')
    .eq('estado', 'pendiente')
    .eq('auto_publicar', true)

  if (!pendientes?.length) return

  for (const pub of pendientes) {
    const propiedad = (pub as any).propiedades as Propiedad

    // Obtener config de la oficina
    const { data: configOficina } = await supabase
      .from('configuracion_oficina')
      .select('*')
      .eq('oficina_id', propiedad.oficina_id)
      .single()

    if (!configOficina) continue

    const apiKey = pub.portal === 'idealista'
      ? configOficina.idealista_api_key
      : configOficina.fotocasa_api_key

    const customerId = pub.portal === 'idealista'
      ? configOficina.idealista_customer_id
      : configOficina.fotocasa_customer_id

    if (!apiKey || !customerId) {
      await supabase.from('publicaciones_portales').update({
        estado: 'error',
        error_mensaje: `API Key o Customer ID no configurados para ${pub.portal}`,
      }).eq('id', pub.id)
      continue
    }

    const result = await publicarEnPortal(propiedad, pub.portal as any, {
      api_key: apiKey,
      customer_id: customerId,
    })

    if (result.success) {
      await supabase.from('publicaciones_portales').update({
        estado: 'publicado',
        id_externo: result.id_externo,
        fecha_publicacion: new Date().toISOString(),
        error_mensaje: null,
      }).eq('id', pub.id)
    } else {
      await supabase.from('publicaciones_portales').update({
        estado: 'error',
        error_mensaje: result.error,
      }).eq('id', pub.id)
    }
  }
}
