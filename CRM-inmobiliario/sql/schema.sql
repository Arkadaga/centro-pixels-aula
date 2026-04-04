-- =====================================================
-- CRM INMOBILIARIO - Schema SQL para Supabase/PostgreSQL
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsquedas fuzzy

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE rol_usuario AS ENUM ('admin', 'director', 'agente');
CREATE TYPE tipo_propiedad AS ENUM ('piso', 'casa', 'chalet', 'atico', 'duplex', 'estudio', 'local', 'oficina', 'garaje', 'trastero', 'terreno', 'edificio');
CREATE TYPE tipo_operacion AS ENUM ('venta', 'alquiler', 'alquiler_opcion_compra', 'traspaso');
CREATE TYPE estado_propiedad AS ENUM ('disponible', 'reservada', 'vendida', 'alquilada', 'retirada', 'borrador');
CREATE TYPE estado_contacto AS ENUM ('nuevo', 'contactado', 'en_seguimiento', 'visitado', 'negociando', 'cerrado_ganado', 'cerrado_perdido', 'inactivo');
CREATE TYPE origen_contacto AS ENUM ('idealista', 'fotocasa', 'web', 'telefono', 'referido', 'captacion', 'walkin', 'redes_sociales', 'otro');
CREATE TYPE estado_captacion AS ENUM ('prospecto', 'contactado', 'valoracion', 'firmado', 'descartado');
CREATE TYPE tipo_interaccion AS ENUM ('llamada', 'email', 'whatsapp', 'visita', 'reunion', 'nota');
CREATE TYPE estado_publicacion AS ENUM ('pendiente', 'publicado', 'pausado', 'error', 'expirado');
CREATE TYPE tipo_documento AS ENUM ('contrato', 'escritura', 'nota_simple', 'certificado_energetico', 'plano', 'foto_dni', 'mandato', 'otro');

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- 1. OFICINAS
CREATE TABLE oficinas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(200) NOT NULL,
  direccion TEXT,
  ciudad VARCHAR(100),
  provincia VARCHAR(100),
  codigo_postal VARCHAR(10),
  telefono VARCHAR(20),
  email VARCHAR(200),
  foto_url TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PERFILES / USUARIOS (vinculado a auth.users de Supabase)
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL,
  apellidos VARCHAR(200),
  email VARCHAR(200) NOT NULL,
  telefono VARCHAR(20),
  rol rol_usuario DEFAULT 'agente',
  oficina_id UUID REFERENCES oficinas(id) ON DELETE SET NULL,
  foto_url TEXT,
  bio TEXT,
  licencia VARCHAR(50), -- Número de licencia/colegiado
  comision_porcentaje DECIMAL(5,2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROPIEDADES
CREATE TABLE propiedades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referencia VARCHAR(20) UNIQUE NOT NULL, -- REF-001, auto-generada
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE RESTRICT,
  agente_id UUID REFERENCES perfiles(id) ON DELETE SET NULL,

  -- Datos básicos
  titulo VARCHAR(300) NOT NULL,
  descripcion TEXT,
  tipo tipo_propiedad NOT NULL,
  operacion tipo_operacion NOT NULL,
  estado estado_propiedad DEFAULT 'borrador',

  -- Precio
  precio DECIMAL(12,2),
  precio_comunidad DECIMAL(8,2),
  precio_ibi DECIMAL(8,2),

  -- Ubicación
  direccion TEXT,
  ciudad VARCHAR(100),
  provincia VARCHAR(100),
  codigo_postal VARCHAR(10),
  barrio VARCHAR(100),
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8),
  ocultar_direccion BOOLEAN DEFAULT false,

  -- Características
  superficie_construida INTEGER, -- m²
  superficie_util INTEGER,
  superficie_parcela INTEGER,
  habitaciones INTEGER DEFAULT 0,
  banos INTEGER DEFAULT 0,
  planta VARCHAR(20),
  ascensor BOOLEAN DEFAULT false,
  parking BOOLEAN DEFAULT false,
  trastero BOOLEAN DEFAULT false,
  terraza BOOLEAN DEFAULT false,
  balcon BOOLEAN DEFAULT false,
  jardin BOOLEAN DEFAULT false,
  piscina BOOLEAN DEFAULT false,
  aire_acondicionado BOOLEAN DEFAULT false,
  calefaccion BOOLEAN DEFAULT false,
  amueblado BOOLEAN DEFAULT false,

  -- Certificado energético
  certificado_energetico VARCHAR(1), -- A-G
  consumo_energetico DECIMAL(8,2),
  emisiones_co2 DECIMAL(8,2),

  -- Extra
  ano_construccion INTEGER,
  orientacion VARCHAR(50),
  estado_conservacion VARCHAR(50),
  observaciones_internas TEXT, -- Notas privadas del agente

  -- SEO / Portales
  destacada BOOLEAN DEFAULT false,

  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_propiedades_estado ON propiedades(estado);
CREATE INDEX idx_propiedades_operacion ON propiedades(operacion);
CREATE INDEX idx_propiedades_tipo ON propiedades(tipo);
CREATE INDEX idx_propiedades_ciudad ON propiedades(ciudad);
CREATE INDEX idx_propiedades_precio ON propiedades(precio);
CREATE INDEX idx_propiedades_oficina ON propiedades(oficina_id);
CREATE INDEX idx_propiedades_agente ON propiedades(agente_id);
CREATE INDEX idx_propiedades_referencia ON propiedades(referencia);

-- 4. IMÁGENES DE PROPIEDADES
CREATE TABLE propiedad_imagenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  propiedad_id UUID NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  es_principal BOOLEAN DEFAULT false,
  descripcion VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_imagenes_propiedad ON propiedad_imagenes(propiedad_id);

-- 5. DOCUMENTOS DE PROPIEDADES
CREATE TABLE propiedad_documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  propiedad_id UUID NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  tipo tipo_documento DEFAULT 'otro',
  nombre VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONTACTOS / LEADS
CREATE TABLE contactos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(200) NOT NULL,
  apellidos VARCHAR(200),
  email VARCHAR(200),
  telefono VARCHAR(20),
  telefono2 VARCHAR(20),

  -- Clasificación
  estado estado_contacto DEFAULT 'nuevo',
  origen origen_contacto DEFAULT 'otro',

  -- Interés
  busca_operacion tipo_operacion,
  busca_tipo tipo_propiedad,
  presupuesto_min DECIMAL(12,2),
  presupuesto_max DECIMAL(12,2),
  zona_interes VARCHAR(200),
  habitaciones_min INTEGER,
  superficie_min INTEGER,

  -- Asignación
  agente_id UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  oficina_id UUID REFERENCES oficinas(id) ON DELETE SET NULL,
  propiedad_interes_id UUID REFERENCES propiedades(id) ON DELETE SET NULL, -- Propiedad por la que preguntó

  -- Puntuación
  puntuacion INTEGER DEFAULT 0 CHECK (puntuacion >= 0 AND puntuacion <= 100), -- Lead scoring

  -- Extra
  notas TEXT,
  fecha_ultimo_contacto TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contactos_estado ON contactos(estado);
CREATE INDEX idx_contactos_agente ON contactos(agente_id);
CREATE INDEX idx_contactos_origen ON contactos(origen);
CREATE INDEX idx_contactos_nombre ON contactos USING gin(nombre gin_trgm_ops);

-- 7. INTERACCIONES CON CONTACTOS
CREATE TABLE interacciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contacto_id UUID NOT NULL REFERENCES contactos(id) ON DELETE CASCADE,
  agente_id UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  tipo tipo_interaccion NOT NULL,
  descripcion TEXT,
  propiedad_id UUID REFERENCES propiedades(id) ON DELETE SET NULL, -- Si está relacionada con una propiedad
  fecha TIMESTAMPTZ DEFAULT NOW(),
  proxima_accion TEXT,
  fecha_proxima_accion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interacciones_contacto ON interacciones(contacto_id);
CREATE INDEX idx_interacciones_agente ON interacciones(agente_id);

-- 8. VISITAS PROGRAMADAS
CREATE TABLE visitas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  propiedad_id UUID NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  contacto_id UUID NOT NULL REFERENCES contactos(id) ON DELETE CASCADE,
  agente_id UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  fecha TIMESTAMPTZ NOT NULL,
  duracion_minutos INTEGER DEFAULT 30,
  notas TEXT,
  resultado VARCHAR(50), -- 'interesado', 'no_interesado', 'segunda_visita', 'oferta'
  feedback_cliente TEXT,
  cancelada BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visitas_fecha ON visitas(fecha);
CREATE INDEX idx_visitas_propiedad ON visitas(propiedad_id);
CREATE INDEX idx_visitas_agente ON visitas(agente_id);

-- 9. CAPTACIONES (Posibles propiedades a captar)
CREATE TABLE captaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Propietario
  propietario_nombre VARCHAR(200) NOT NULL,
  propietario_telefono VARCHAR(20),
  propietario_email VARCHAR(200),

  -- Propiedad
  direccion TEXT,
  ciudad VARCHAR(100),
  provincia VARCHAR(100),
  tipo tipo_propiedad,
  superficie INTEGER,
  habitaciones INTEGER,
  precio_estimado DECIMAL(12,2),
  precio_propietario DECIMAL(12,2), -- Lo que pide el propietario

  -- Gestión
  estado estado_captacion DEFAULT 'prospecto',
  agente_id UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  oficina_id UUID REFERENCES oficinas(id) ON DELETE SET NULL,
  origen VARCHAR(100), -- De dónde viene la captación
  notas TEXT,

  -- Valoración
  valoracion_min DECIMAL(12,2),
  valoracion_max DECIMAL(12,2),
  fecha_valoracion TIMESTAMPTZ,

  -- Resultado
  propiedad_id UUID REFERENCES propiedades(id) ON DELETE SET NULL, -- Si se convierte en propiedad
  fecha_firma_mandato TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_captaciones_estado ON captaciones(estado);
CREATE INDEX idx_captaciones_agente ON captaciones(agente_id);

-- 10. PUBLICACIONES EN PORTALES
CREATE TABLE publicaciones_portales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  propiedad_id UUID NOT NULL REFERENCES propiedades(id) ON DELETE CASCADE,
  portal VARCHAR(50) NOT NULL, -- 'idealista', 'fotocasa'
  estado estado_publicacion DEFAULT 'pendiente',
  id_externo VARCHAR(200), -- ID en el portal
  url_publicacion TEXT, -- URL en el portal
  fecha_publicacion TIMESTAMPTZ,
  fecha_actualizacion TIMESTAMPTZ,
  fecha_expiracion TIMESTAMPTZ,
  error_mensaje TEXT,
  auto_publicar BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(propiedad_id, portal)
);

CREATE INDEX idx_publicaciones_portal ON publicaciones_portales(portal);
CREATE INDEX idx_publicaciones_estado ON publicaciones_portales(estado);

-- 11. HISTORIAL DE ACTIVIDAD (Audit Log)
CREATE TABLE actividad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES perfiles(id) ON DELETE SET NULL,
  accion VARCHAR(50) NOT NULL, -- 'crear', 'editar', 'eliminar', 'publicar', 'contactar'
  entidad VARCHAR(50) NOT NULL, -- 'propiedad', 'contacto', 'captacion', etc.
  entidad_id UUID,
  descripcion TEXT,
  datos_extra JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_actividad_usuario ON actividad(usuario_id);
CREATE INDEX idx_actividad_entidad ON actividad(entidad, entidad_id);
CREATE INDEX idx_actividad_fecha ON actividad(created_at DESC);

-- 12. CONFIGURACIÓN POR OFICINA
CREATE TABLE configuracion_oficina (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oficina_id UUID UNIQUE NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  idealista_api_key TEXT,
  idealista_customer_id TEXT,
  fotocasa_api_key TEXT,
  fotocasa_customer_id TEXT,
  email_notificaciones VARCHAR(200),
  auto_publicar_idealista BOOLEAN DEFAULT false,
  auto_publicar_fotocasa BOOLEAN DEFAULT false,
  prefijo_referencia VARCHAR(10) DEFAULT 'REF',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FUNCIONES
-- =====================================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS rol_usuario AS $$
  SELECT rol FROM perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Función para obtener la oficina del usuario actual
CREATE OR REPLACE FUNCTION get_my_oficina()
RETURNS UUID AS $$
  SELECT oficina_id FROM perfiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-crear perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO perfiles (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-generar referencia de propiedad
CREATE OR REPLACE FUNCTION generar_referencia()
RETURNS TRIGGER AS $$
DECLARE
  prefijo VARCHAR(10);
  siguiente INTEGER;
BEGIN
  SELECT COALESCE(co.prefijo_referencia, 'REF')
  INTO prefijo
  FROM configuracion_oficina co
  WHERE co.oficina_id = NEW.oficina_id;

  IF prefijo IS NULL THEN prefijo := 'REF'; END IF;

  SELECT COALESCE(MAX(
    CAST(NULLIF(regexp_replace(referencia, '[^0-9]', '', 'g'), '') AS INTEGER)
  ), 0) + 1
  INTO siguiente
  FROM propiedades
  WHERE oficina_id = NEW.oficina_id;

  NEW.referencia := prefijo || '-' || LPAD(siguiente::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_propiedad
  BEFORE INSERT ON propiedades
  FOR EACH ROW
  WHEN (NEW.referencia IS NULL OR NEW.referencia = '')
  EXECUTE FUNCTION generar_referencia();

-- Auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_oficinas BEFORE UPDATE ON oficinas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_perfiles BEFORE UPDATE ON perfiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_propiedades BEFORE UPDATE ON propiedades FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_contactos BEFORE UPDATE ON contactos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_captaciones BEFORE UPDATE ON captaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_publicaciones BEFORE UPDATE ON publicaciones_portales FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_config BEFORE UPDATE ON configuracion_oficina FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE oficinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE propiedad_imagenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE propiedad_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE interacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE captaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE publicaciones_portales ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_oficina ENABLE ROW LEVEL SECURITY;

-- Admins ven todo
CREATE POLICY admin_all_oficinas ON oficinas FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY admin_all_perfiles ON perfiles FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY admin_all_propiedades ON propiedades FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY admin_all_imagenes ON propiedad_imagenes FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY admin_all_documentos ON propiedad_documentos FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY admin_all_contactos ON contactos FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY admin_all_interacciones ON interacciones FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY admin_all_visitas ON visitas FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY admin_all_captaciones ON captaciones FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY admin_all_publicaciones ON publicaciones_portales FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY admin_all_actividad ON actividad FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY admin_all_config ON configuracion_oficina FOR ALL USING (get_my_role() = 'admin');

-- Directores ven su oficina
CREATE POLICY director_oficinas ON oficinas FOR SELECT USING (id = get_my_oficina() OR get_my_role() = 'director');
CREATE POLICY director_perfiles ON perfiles FOR SELECT USING (oficina_id = get_my_oficina() OR get_my_role() IN ('admin', 'director'));
CREATE POLICY director_propiedades ON propiedades FOR ALL USING (oficina_id = get_my_oficina() AND get_my_role() = 'director');
CREATE POLICY director_contactos ON contactos FOR ALL USING (oficina_id = get_my_oficina() AND get_my_role() = 'director');
CREATE POLICY director_captaciones ON captaciones FOR ALL USING (oficina_id = get_my_oficina() AND get_my_role() = 'director');

-- Agentes ven sus propios datos y los de su oficina (lectura)
CREATE POLICY agente_propiedades_select ON propiedades FOR SELECT USING (oficina_id = get_my_oficina());
CREATE POLICY agente_propiedades_modify ON propiedades FOR ALL USING (agente_id = auth.uid());
CREATE POLICY agente_contactos_select ON contactos FOR SELECT USING (oficina_id = get_my_oficina());
CREATE POLICY agente_contactos_own ON contactos FOR ALL USING (agente_id = auth.uid());
CREATE POLICY agente_captaciones_own ON captaciones FOR ALL USING (agente_id = auth.uid());

-- Todos los autenticados ven su propio perfil
CREATE POLICY own_profile ON perfiles FOR SELECT USING (id = auth.uid());
CREATE POLICY update_own_profile ON perfiles FOR UPDATE USING (id = auth.uid());

-- Visitas: agentes ven las suyas
CREATE POLICY agente_visitas ON visitas FOR ALL USING (agente_id = auth.uid());
CREATE POLICY director_visitas ON visitas FOR ALL USING (
  EXISTS (SELECT 1 FROM propiedades p WHERE p.id = visitas.propiedad_id AND p.oficina_id = get_my_oficina())
  AND get_my_role() = 'director'
);

-- Interacciones
CREATE POLICY agente_interacciones ON interacciones FOR ALL USING (agente_id = auth.uid());
CREATE POLICY director_interacciones ON interacciones FOR ALL USING (
  EXISTS (SELECT 1 FROM contactos c WHERE c.id = interacciones.contacto_id AND c.oficina_id = get_my_oficina())
  AND get_my_role() = 'director'
);

-- Publicaciones
CREATE POLICY agente_publicaciones ON publicaciones_portales FOR SELECT USING (
  EXISTS (SELECT 1 FROM propiedades p WHERE p.id = publicaciones_portales.propiedad_id AND p.agente_id = auth.uid())
);
CREATE POLICY director_publicaciones ON publicaciones_portales FOR ALL USING (
  EXISTS (SELECT 1 FROM propiedades p WHERE p.id = publicaciones_portales.propiedad_id AND p.oficina_id = get_my_oficina())
  AND get_my_role() = 'director'
);

-- Actividad: cada usuario ve la suya
CREATE POLICY own_actividad ON actividad FOR SELECT USING (usuario_id = auth.uid());
CREATE POLICY insert_actividad ON actividad FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Imágenes y documentos: vinculados a propiedades
CREATE POLICY imagenes_propiedad ON propiedad_imagenes FOR ALL USING (
  EXISTS (SELECT 1 FROM propiedades p WHERE p.id = propiedad_imagenes.propiedad_id AND (p.agente_id = auth.uid() OR p.oficina_id = get_my_oficina()))
);
CREATE POLICY documentos_propiedad ON propiedad_documentos FOR ALL USING (
  EXISTS (SELECT 1 FROM propiedades p WHERE p.id = propiedad_documentos.propiedad_id AND (p.agente_id = auth.uid() OR p.oficina_id = get_my_oficina()))
);

-- Config: solo directores y admins de la oficina
CREATE POLICY director_config ON configuracion_oficina FOR ALL USING (oficina_id = get_my_oficina() AND get_my_role() IN ('admin', 'director'));

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

CREATE OR REPLACE VIEW vista_propiedades AS
SELECT
  p.*,
  o.nombre AS oficina_nombre,
  CONCAT(pe.nombre, ' ', pe.apellidos) AS agente_nombre,
  pe.telefono AS agente_telefono,
  (SELECT url FROM propiedad_imagenes pi WHERE pi.propiedad_id = p.id AND pi.es_principal = true LIMIT 1) AS imagen_principal,
  (SELECT COUNT(*) FROM propiedad_imagenes pi WHERE pi.propiedad_id = p.id) AS num_imagenes,
  (SELECT COUNT(*) FROM contactos c WHERE c.propiedad_interes_id = p.id) AS num_leads,
  (SELECT COUNT(*) FROM visitas v WHERE v.propiedad_id = p.id AND v.cancelada = false) AS num_visitas
FROM propiedades p
LEFT JOIN oficinas o ON o.id = p.oficina_id
LEFT JOIN perfiles pe ON pe.id = p.agente_id;

CREATE OR REPLACE VIEW vista_contactos AS
SELECT
  c.*,
  CONCAT(c.nombre, ' ', c.apellidos) AS nombre_completo,
  CONCAT(pe.nombre, ' ', pe.apellidos) AS agente_nombre,
  o.nombre AS oficina_nombre,
  p.titulo AS propiedad_titulo,
  p.referencia AS propiedad_referencia,
  (SELECT COUNT(*) FROM interacciones i WHERE i.contacto_id = c.id) AS num_interacciones,
  (SELECT COUNT(*) FROM visitas v WHERE v.contacto_id = c.id) AS num_visitas
FROM contactos c
LEFT JOIN perfiles pe ON pe.id = c.agente_id
LEFT JOIN oficinas o ON o.id = c.oficina_id
LEFT JOIN propiedades p ON p.id = c.propiedad_interes_id;

CREATE OR REPLACE VIEW vista_dashboard AS
SELECT
  (SELECT COUNT(*) FROM propiedades WHERE estado = 'disponible') AS propiedades_disponibles,
  (SELECT COUNT(*) FROM propiedades WHERE estado = 'reservada') AS propiedades_reservadas,
  (SELECT COUNT(*) FROM propiedades WHERE estado = 'vendida') AS propiedades_vendidas,
  (SELECT COUNT(*) FROM contactos WHERE estado = 'nuevo') AS leads_nuevos,
  (SELECT COUNT(*) FROM contactos WHERE estado IN ('en_seguimiento', 'contactado', 'visitado', 'negociando')) AS leads_activos,
  (SELECT COUNT(*) FROM captaciones WHERE estado IN ('prospecto', 'contactado', 'valoracion')) AS captaciones_activas,
  (SELECT COUNT(*) FROM visitas WHERE fecha >= NOW() AND cancelada = false) AS visitas_pendientes,
  (SELECT COUNT(*) FROM publicaciones_portales WHERE estado = 'publicado') AS publicaciones_activas;
