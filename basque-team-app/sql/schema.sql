-- =============================================================================
-- Basque Team App - Esquema de base de datos para Supabase
-- =============================================================================
-- Este archivo define el esquema completo de la aplicación de gestión del
-- equipo deportivo vasco, incluyendo tablas, tipos, políticas de seguridad
-- a nivel de fila (RLS), índices y datos de ejemplo.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extensiones necesarias
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 2. Tipos enumerados personalizados
-- ---------------------------------------------------------------------------

-- Rol del usuario dentro de la plataforma
CREATE TYPE user_role AS ENUM ('kirolaria', 'zuzendaritza', 'medikua');

-- Tipo de deportista (olímpico o paralímpico)
CREATE TYPE athlete_type AS ENUM ('olimpiar', 'paralinpiar');

-- Tipo de cita médica / servicio
CREATE TYPE appointment_type AS ENUM ('biomedikoa', 'fisioterapia', 'psikologia', 'nutrizioa');

-- Estado de una cita
CREATE TYPE appointment_status AS ENUM ('zain', 'berretsi', 'bukatua', 'ezeztatua');

-- Tipo de documento clínico
CREATE TYPE document_type AS ENUM ('erradiografia', 'txosten', 'analitika', 'beste');

-- Tipo de prueba / test deportivo
CREATE TYPE test_type AS ENUM ('biomekanika', 'fisiologia', 'indarrak', 'nutrizio');

-- Tipo de evento en el calendario
CREATE TYPE event_type AS ENUM ('entrenamendua', 'lehiaketa', 'medikua', 'bilera', 'ekitaldia');

-- Tipo de notificación
CREATE TYPE notification_type AS ENUM ('info', 'garrantzitsua', 'gertaera', 'medikua');

-- Tipo de recurso formativo
CREATE TYPE resource_type AS ENUM ('pdf', 'bideo', 'liburu', 'artikulu');

-- Categoría de recurso formativo
CREATE TYPE resource_category AS ENUM ('entrenamendua', 'nutrizio', 'psikologia', 'fisioterapia', 'biomekanika');

-- Tipo de empleo
CREATE TYPE job_type AS ENUM ('osoa', 'partziala', 'praktikak', 'urrunekoa');

-- Intensidad de sesión de entrenamiento (usada dentro del JSONB de training_plans)
-- Se define como referencia, aunque en la práctica se valida en la aplicación
CREATE TYPE training_intensity AS ENUM ('baxua', 'ertaina', 'altua', 'oso-altua');

-- ---------------------------------------------------------------------------
-- 3. Tablas
-- ---------------------------------------------------------------------------

-- Usuarios de la plataforma (deportistas, dirección, personal médico)
CREATE TABLE users (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email      TEXT UNIQUE NOT NULL,
    name       TEXT NOT NULL,
    role       user_role NOT NULL,
    avatar     TEXT,
    sport      TEXT,
    athlete_type athlete_type,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Fichas de deportistas (catálogo público de atletas del programa)
CREATE TABLE athletes (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT NOT NULL,
    sport      TEXT NOT NULL,
    sport_eu   TEXT,
    type       athlete_type NOT NULL,
    photo      TEXT,
    birth_year INT,
    hometown   TEXT,
    beca_year  INT,
    active     BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Logros de cada deportista
CREATE TABLE athlete_achievements (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    achievement TEXT NOT NULL,
    year       INT
);

-- Citas médicas y de servicios de apoyo
CREATE TABLE appointments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        appointment_type NOT NULL,
    date        DATE NOT NULL,
    time        TIME NOT NULL,
    status      appointment_status DEFAULT 'zain',
    reason      TEXT,
    notes       TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Documentos clínicos de los deportistas
CREATE TABLE documents (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    type        document_type NOT NULL,
    description TEXT,
    file_url    TEXT,
    file_name   TEXT,
    file_size   TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Registros de pruebas deportivas (biomecánica, fisiología, etc.)
CREATE TABLE test_records (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       test_type NOT NULL,
    title      TEXT NOT NULL,
    date       DATE NOT NULL,
    results    TEXT,
    file_url   TEXT,
    video_url  TEXT,
    notes      TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Eventos del calendario compartido
CREATE TABLE calendar_events (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT NOT NULL,
    date        DATE NOT NULL,
    time        TIME,
    location    TEXT,
    type        event_type NOT NULL,
    description TEXT,
    created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Notificaciones enviadas a los usuarios
CREATE TABLE notifications (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title          TEXT NOT NULL,
    message        TEXT NOT NULL,
    type           notification_type NOT NULL,
    recipient_type TEXT DEFAULT 'all',
    created_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ DEFAULT now()
);

-- Registro de lecturas de notificaciones (relación muchos-a-muchos)
CREATE TABLE notification_reads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at         TIMESTAMPTZ DEFAULT now(),
    UNIQUE (notification_id, user_id)
);

-- Recursos formativos (PDFs, vídeos, libros, artículos)
CREATE TABLE resources (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT NOT NULL,
    type        resource_type NOT NULL,
    category    resource_category NOT NULL,
    url         TEXT,
    description TEXT,
    added_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    added_at    TIMESTAMPTZ DEFAULT now()
);

-- Empresas colaboradoras (para bolsa de empleo)
CREATE TABLE companies (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    logo          TEXT,
    sector        TEXT,
    description   TEXT,
    website       TEXT,
    contact_email TEXT,
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- Ofertas de empleo publicadas por empresas
CREATE TABLE jobs (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    description  TEXT NOT NULL,
    location     TEXT,
    type         job_type NOT NULL,
    requirements TEXT[],
    published_at TIMESTAMPTZ DEFAULT now(),
    active       BOOLEAN DEFAULT true
);

-- Planes de entrenamiento semanales (las sesiones se almacenan como JSONB)
CREATE TABLE training_plans (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day        TEXT NOT NULL,
    sessions   JSONB NOT NULL DEFAULT '[]'::jsonb,
    week_start DATE NOT NULL
);

-- Objetivos de entrenamiento del deportista
CREATE TABLE training_goals (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    target     NUMERIC NOT NULL,
    current    NUMERIC NOT NULL DEFAULT 0,
    unit       TEXT
);

-- ---------------------------------------------------------------------------
-- 4. Índices para mejorar el rendimiento de consultas frecuentes
-- ---------------------------------------------------------------------------

-- Índices en claves foráneas
CREATE INDEX idx_athlete_achievements_athlete ON athlete_achievements(athlete_id);
CREATE INDEX idx_appointments_athlete         ON appointments(athlete_id);
CREATE INDEX idx_appointments_approved_by     ON appointments(approved_by);
CREATE INDEX idx_documents_athlete            ON documents(athlete_id);
CREATE INDEX idx_test_records_athlete         ON test_records(athlete_id);
CREATE INDEX idx_calendar_events_created_by   ON calendar_events(created_by);
CREATE INDEX idx_notifications_created_by     ON notifications(created_by);
CREATE INDEX idx_notification_reads_notif     ON notification_reads(notification_id);
CREATE INDEX idx_notification_reads_user      ON notification_reads(user_id);
CREATE INDEX idx_resources_added_by           ON resources(added_by);
CREATE INDEX idx_jobs_company                 ON jobs(company_id);
CREATE INDEX idx_training_plans_athlete       ON training_plans(athlete_id);
CREATE INDEX idx_training_goals_athlete       ON training_goals(athlete_id);

-- Índices en columnas frecuentemente consultadas
CREATE INDEX idx_appointments_date            ON appointments(date);
CREATE INDEX idx_appointments_status          ON appointments(status);
CREATE INDEX idx_calendar_events_date         ON calendar_events(date);
CREATE INDEX idx_calendar_events_type         ON calendar_events(type);
CREATE INDEX idx_notifications_recipient      ON notifications(recipient_type);
CREATE INDEX idx_jobs_active                  ON jobs(active);
CREATE INDEX idx_athletes_active              ON athletes(active);
CREATE INDEX idx_athletes_type                ON athletes(type);
CREATE INDEX idx_training_plans_week          ON training_plans(week_start);

-- ---------------------------------------------------------------------------
-- 5. Habilitar Row Level Security (RLS) en todas las tablas
-- ---------------------------------------------------------------------------

ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_records       ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources          ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans     ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_goals     ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 6. Función auxiliar para obtener el rol del usuario actual
-- ---------------------------------------------------------------------------

-- Devuelve el rol del usuario autenticado consultando la tabla users
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT role FROM users WHERE id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- 7. Políticas de seguridad a nivel de fila (RLS)
-- ---------------------------------------------------------------------------

-- ===== USERS =====
-- Todos los usuarios autenticados pueden ver los perfiles
CREATE POLICY "users_select_all" ON users
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Solo la dirección puede modificar usuarios
CREATE POLICY "users_modify_admin" ON users
    FOR ALL USING (auth_user_role() = 'zuzendaritza');

-- ===== ATHLETES (catálogo público) =====
-- Todos los usuarios autenticados pueden ver los deportistas
CREATE POLICY "athletes_select_all" ON athletes
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Solo la dirección puede gestionar el catálogo de deportistas
CREATE POLICY "athletes_modify_admin" ON athletes
    FOR ALL USING (auth_user_role() = 'zuzendaritza');

-- ===== ATHLETE_ACHIEVEMENTS =====
-- Todos los usuarios autenticados pueden ver logros
CREATE POLICY "achievements_select_all" ON athlete_achievements
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Solo la dirección puede gestionar logros
CREATE POLICY "achievements_modify_admin" ON athlete_achievements
    FOR ALL USING (auth_user_role() = 'zuzendaritza');

-- ===== APPOINTMENTS =====
-- Los deportistas solo ven sus propias citas
CREATE POLICY "appointments_select_athlete" ON appointments
    FOR SELECT USING (
        auth_user_role() = 'kirolaria' AND athlete_id = auth.uid()
    );

-- El personal médico puede ver todas las citas
CREATE POLICY "appointments_select_medical" ON appointments
    FOR SELECT USING (auth_user_role() = 'medikua');

-- La dirección puede ver y gestionar todas las citas
CREATE POLICY "appointments_all_admin" ON appointments
    FOR ALL USING (auth_user_role() = 'zuzendaritza');

-- Los deportistas pueden crear sus propias citas
CREATE POLICY "appointments_insert_athlete" ON appointments
    FOR INSERT WITH CHECK (
        auth_user_role() = 'kirolaria' AND athlete_id = auth.uid()
    );

-- El personal médico puede actualizar citas (aprobar, añadir notas, etc.)
CREATE POLICY "appointments_update_medical" ON appointments
    FOR UPDATE USING (auth_user_role() = 'medikua');

-- ===== DOCUMENTS =====
-- Los deportistas solo ven sus propios documentos
CREATE POLICY "documents_select_athlete" ON documents
    FOR SELECT USING (
        auth_user_role() = 'kirolaria' AND athlete_id = auth.uid()
    );

-- El personal médico puede ver todos los documentos
CREATE POLICY "documents_select_medical" ON documents
    FOR SELECT USING (auth_user_role() = 'medikua');

-- La dirección puede ver y gestionar todos los documentos
CREATE POLICY "documents_all_admin" ON documents
    FOR ALL USING (auth_user_role() = 'zuzendaritza');

-- El personal médico puede subir documentos
CREATE POLICY "documents_insert_medical" ON documents
    FOR INSERT WITH CHECK (auth_user_role() = 'medikua');

-- ===== TEST_RECORDS =====
-- Los deportistas solo ven sus propios registros de pruebas
CREATE POLICY "tests_select_athlete" ON test_records
    FOR SELECT USING (
        auth_user_role() = 'kirolaria' AND athlete_id = auth.uid()
    );

-- El personal médico puede ver todos los registros de pruebas
CREATE POLICY "tests_select_medical" ON test_records
    FOR SELECT USING (auth_user_role() = 'medikua');

-- La dirección puede ver y gestionar todos los registros
CREATE POLICY "tests_all_admin" ON test_records
    FOR ALL USING (auth_user_role() = 'zuzendaritza');

-- El personal médico puede crear y actualizar registros de pruebas
CREATE POLICY "tests_insert_medical" ON test_records
    FOR INSERT WITH CHECK (auth_user_role() = 'medikua');

CREATE POLICY "tests_update_medical" ON test_records
    FOR UPDATE USING (auth_user_role() = 'medikua');

-- ===== CALENDAR_EVENTS =====
-- Todos los usuarios autenticados pueden ver los eventos
CREATE POLICY "events_select_all" ON calendar_events
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Solo la dirección puede gestionar eventos
CREATE POLICY "events_modify_admin" ON calendar_events
    FOR ALL USING (auth_user_role() = 'zuzendaritza');

-- ===== NOTIFICATIONS =====
-- Los usuarios ven las notificaciones dirigidas a todos o a su tipo de deportista
CREATE POLICY "notifications_select_all" ON notifications
    FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND (
            recipient_type = 'all'
            OR recipient_type::text = (
                SELECT COALESCE(athlete_type::text, 'all')
                FROM users
                WHERE id = auth.uid()
            )
        )
    );

-- Solo la dirección puede crear y gestionar notificaciones
CREATE POLICY "notifications_modify_admin" ON notifications
    FOR ALL USING (auth_user_role() = 'zuzendaritza');

-- ===== NOTIFICATION_READS =====
-- Cada usuario solo ve sus propias lecturas
CREATE POLICY "reads_select_own" ON notification_reads
    FOR SELECT USING (user_id = auth.uid());

-- Cada usuario puede marcar sus propias notificaciones como leídas
CREATE POLICY "reads_insert_own" ON notification_reads
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ===== RESOURCES =====
-- Todos los usuarios autenticados pueden ver los recursos
CREATE POLICY "resources_select_all" ON resources
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Solo la dirección puede gestionar recursos
CREATE POLICY "resources_modify_admin" ON resources
    FOR ALL USING (auth_user_role() = 'zuzendaritza');

-- ===== COMPANIES =====
-- Todos los usuarios autenticados pueden ver las empresas
CREATE POLICY "companies_select_all" ON companies
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Solo la dirección puede gestionar empresas
CREATE POLICY "companies_modify_admin" ON companies
    FOR ALL USING (auth_user_role() = 'zuzendaritza');

-- ===== JOBS =====
-- Todos los usuarios autenticados pueden ver ofertas activas
CREATE POLICY "jobs_select_all" ON jobs
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Solo la dirección puede gestionar ofertas de empleo
CREATE POLICY "jobs_modify_admin" ON jobs
    FOR ALL USING (auth_user_role() = 'zuzendaritza');

-- ===== TRAINING_PLANS =====
-- Los deportistas solo ven sus propios planes de entrenamiento
CREATE POLICY "plans_select_athlete" ON training_plans
    FOR SELECT USING (
        auth_user_role() = 'kirolaria' AND athlete_id = auth.uid()
    );

-- La dirección puede ver y gestionar todos los planes
CREATE POLICY "plans_all_admin" ON training_plans
    FOR ALL USING (auth_user_role() = 'zuzendaritza');

-- El personal médico puede ver planes de entrenamiento
CREATE POLICY "plans_select_medical" ON training_plans
    FOR SELECT USING (auth_user_role() = 'medikua');

-- ===== TRAINING_GOALS =====
-- Los deportistas solo ven sus propios objetivos
CREATE POLICY "goals_select_athlete" ON training_goals
    FOR SELECT USING (
        auth_user_role() = 'kirolaria' AND athlete_id = auth.uid()
    );

-- La dirección puede ver y gestionar todos los objetivos
CREATE POLICY "goals_all_admin" ON training_goals
    FOR ALL USING (auth_user_role() = 'zuzendaritza');

-- El personal médico puede ver los objetivos
CREATE POLICY "goals_select_medical" ON training_goals
    FOR SELECT USING (auth_user_role() = 'medikua');

-- ---------------------------------------------------------------------------
-- 8. Datos de ejemplo - Usuarios iniciales
-- ---------------------------------------------------------------------------
-- Los IDs coinciden con los usuarios mock de la aplicación (auth-context.tsx)

INSERT INTO users (id, email, name, role, avatar, sport, athlete_type) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'admin@basqueteam.eus',
    'Ane Etxeberria',
    'zuzendaritza',
    NULL,
    NULL,
    NULL
),
(
    '00000000-0000-0000-0000-000000000002',
    'kirolaria@basqueteam.eus',
    'Mikel Arana',
    'kirolaria',
    NULL,
    'Atletismoa',
    'olimpiar'
),
(
    '00000000-0000-0000-0000-000000000003',
    'medikua@basqueteam.eus',
    'Dr. Leire Zubia',
    'medikua',
    NULL,
    NULL,
    NULL
);

-- =============================================================================
-- Fin del esquema
-- =============================================================================
