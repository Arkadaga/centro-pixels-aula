-- ============================================================
-- CENTRO PIXELS — AULA VIRTUAL
-- Supabase Schema
-- ============================================================
-- Run this in Supabase SQL Editor (supabase.com > project > SQL Editor)
-- ============================================================

-- 1. PROFILES table
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text not null,
  email text not null,
  role text not null check (role in ('direccion', 'profesor', 'alumno')),
  bio text default '',
  asignaturas text[] default '{}',
  photo_url text default '',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- 1b. Helper function (needs profiles table to exist)
-- ============================================================
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 1c. Profiles policies (needs get_my_role to exist)
-- ============================================================
create policy "Profiles: anyone authenticated can read"
  on public.profiles for select
  to authenticated using (true);

create policy "Profiles: users can update own"
  on public.profiles for update
  to authenticated using (id = auth.uid());

create policy "Profiles: direccion can insert"
  on public.profiles for insert
  to authenticated with check (public.get_my_role() = 'direccion');

create policy "Profiles: direccion can delete"
  on public.profiles for delete
  to authenticated using (public.get_my_role() = 'direccion');

-- 2. MODULOS
-- ============================================================
create table public.modulos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  profesor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.modulos enable row level security;

create policy "Modulos: authenticated can read"
  on public.modulos for select to authenticated using (true);

create policy "Modulos: profesor/direccion can insert"
  on public.modulos for insert to authenticated
  with check (public.get_my_role() in ('profesor', 'direccion'));

create policy "Modulos: profesor/direccion can update"
  on public.modulos for update to authenticated
  using (public.get_my_role() in ('profesor', 'direccion'));

create policy "Modulos: profesor/direccion can delete"
  on public.modulos for delete to authenticated
  using (public.get_my_role() in ('profesor', 'direccion'));

-- 3. CLASES
-- ============================================================
create table public.clases (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid references public.modulos(id) on delete cascade not null,
  title text not null,
  video_url text not null,
  orden int default 1,
  duracion text default '',
  fecha date default current_date
);

alter table public.clases enable row level security;

create policy "Clases: authenticated can read"
  on public.clases for select to authenticated using (true);

create policy "Clases: profesor/direccion can insert"
  on public.clases for insert to authenticated
  with check (public.get_my_role() in ('profesor', 'direccion'));

create policy "Clases: profesor/direccion can update"
  on public.clases for update to authenticated
  using (public.get_my_role() in ('profesor', 'direccion'));

create policy "Clases: profesor/direccion can delete"
  on public.clases for delete to authenticated
  using (public.get_my_role() in ('profesor', 'direccion'));

-- 4. RECURSOS
-- ============================================================
create table public.recursos (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid references public.modulos(id) on delete cascade not null,
  title text not null,
  tipo text not null check (tipo in ('pdf', 'video', 'link', 'imagen', 'archivo')),
  url text default '',
  descripcion text default '',
  fecha date default current_date
);

alter table public.recursos enable row level security;

create policy "Recursos: authenticated can read"
  on public.recursos for select to authenticated using (true);

create policy "Recursos: profesor/direccion can insert"
  on public.recursos for insert to authenticated
  with check (public.get_my_role() in ('profesor', 'direccion'));

create policy "Recursos: profesor/direccion can update"
  on public.recursos for update to authenticated
  using (public.get_my_role() in ('profesor', 'direccion'));

create policy "Recursos: profesor/direccion can delete"
  on public.recursos for delete to authenticated
  using (public.get_my_role() in ('profesor', 'direccion'));

-- 5. TRABAJOS
-- ============================================================
create table public.trabajos (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid references public.modulos(id) on delete cascade not null,
  title text not null,
  descripcion text default '',
  fecha_limite date not null,
  profesor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.trabajos enable row level security;

create policy "Trabajos: authenticated can read"
  on public.trabajos for select to authenticated using (true);

create policy "Trabajos: profesor/direccion can insert"
  on public.trabajos for insert to authenticated
  with check (public.get_my_role() in ('profesor', 'direccion'));

create policy "Trabajos: profesor/direccion can update"
  on public.trabajos for update to authenticated
  using (public.get_my_role() in ('profesor', 'direccion'));

create policy "Trabajos: profesor/direccion can delete"
  on public.trabajos for delete to authenticated
  using (public.get_my_role() in ('profesor', 'direccion'));

-- 6. ENTREGAS
-- ============================================================
create table public.entregas (
  id uuid primary key default gen_random_uuid(),
  trabajo_id uuid references public.trabajos(id) on delete cascade not null,
  alumno_id uuid references public.profiles(id) on delete cascade not null,
  archivo text not null,
  comentario text default '',
  fecha date default current_date,
  nota numeric(4,2) default null,
  feedback text default ''
);

alter table public.entregas enable row level security;

create policy "Entregas: alumno can read own"
  on public.entregas for select to authenticated
  using (
    alumno_id = auth.uid()
    or public.get_my_role() in ('profesor', 'direccion')
  );

create policy "Entregas: alumno can insert own"
  on public.entregas for insert to authenticated
  with check (alumno_id = auth.uid() and public.get_my_role() = 'alumno');

create policy "Entregas: profesor/direccion can update (grade)"
  on public.entregas for update to authenticated
  using (public.get_my_role() in ('profesor', 'direccion'));

-- 7. CALENDARIO
-- ============================================================
create table public.calendario (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  fecha date not null,
  fecha_fin date,
  tipo text not null check (tipo in ('clase', 'evento', 'tarea', 'cita', 'escolar')),
  categoria text default '',
  modulo_id uuid references public.modulos(id) on delete set null,
  trabajo_id uuid references public.trabajos(id) on delete set null
);

alter table public.calendario enable row level security;

create policy "Calendario: authenticated can read"
  on public.calendario for select to authenticated using (true);

create policy "Calendario: profesor/direccion can insert"
  on public.calendario for insert to authenticated
  with check (public.get_my_role() in ('profesor', 'direccion'));

create policy "Calendario: profesor/direccion can update"
  on public.calendario for update to authenticated
  using (public.get_my_role() in ('profesor', 'direccion'));

create policy "Calendario: profesor/direccion can delete"
  on public.calendario for delete to authenticated
  using (public.get_my_role() in ('profesor', 'direccion'));

-- 8. INCIDENCIAS
-- ============================================================
create table public.incidencias (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid references public.profiles(id) on delete cascade not null,
  asunto text not null,
  descripcion text default '',
  fecha date default current_date,
  estado text default 'pendiente' check (estado in ('pendiente', 'resuelta'))
);

alter table public.incidencias enable row level security;

create policy "Incidencias: alumno can read own"
  on public.incidencias for select to authenticated
  using (
    alumno_id = auth.uid()
    or public.get_my_role() in ('profesor', 'direccion')
  );

create policy "Incidencias: alumno can insert own"
  on public.incidencias for insert to authenticated
  with check (alumno_id = auth.uid());

create policy "Incidencias: profesor/direccion can update"
  on public.incidencias for update to authenticated
  using (public.get_my_role() in ('profesor', 'direccion'));

-- 9. INCIDENCIA_RESPUESTAS
-- ============================================================
create table public.incidencia_respuestas (
  id uuid primary key default gen_random_uuid(),
  incidencia_id uuid references public.incidencias(id) on delete cascade not null,
  autor_id uuid references public.profiles(id) on delete cascade not null,
  texto text not null,
  fecha date default current_date
);

alter table public.incidencia_respuestas enable row level security;

create policy "Respuestas: read if involved"
  on public.incidencia_respuestas for select to authenticated
  using (
    public.get_my_role() in ('profesor', 'direccion')
    or exists (
      select 1 from public.incidencias
      where incidencias.id = incidencia_respuestas.incidencia_id
      and incidencias.alumno_id = auth.uid()
    )
  );

create policy "Respuestas: profesor/direccion can insert"
  on public.incidencia_respuestas for insert to authenticated
  with check (public.get_my_role() in ('profesor', 'direccion'));

-- 10. NOTAS_PROFESOR (private teacher notes on students)
-- ============================================================
create table public.notas_profesor (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid references public.profiles(id) on delete cascade not null,
  profesor_id uuid references public.profiles(id) on delete cascade not null,
  texto text default '',
  unique(alumno_id, profesor_id)
);

alter table public.notas_profesor enable row level security;

create policy "NotasProf: only own notes"
  on public.notas_profesor for select to authenticated
  using (profesor_id = auth.uid());

create policy "NotasProf: insert own"
  on public.notas_profesor for insert to authenticated
  with check (profesor_id = auth.uid());

create policy "NotasProf: update own"
  on public.notas_profesor for update to authenticated
  using (profesor_id = auth.uid());

-- 11. APUNTES (student notes per class)
-- ============================================================
create table public.apuntes (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid references public.profiles(id) on delete cascade not null,
  clase_id uuid references public.clases(id) on delete cascade not null,
  contenido text default '',
  updated_at timestamptz default now(),
  unique(alumno_id, clase_id)
);

alter table public.apuntes enable row level security;

create policy "Apuntes: only own"
  on public.apuntes for select to authenticated
  using (alumno_id = auth.uid());

create policy "Apuntes: insert own"
  on public.apuntes for insert to authenticated
  with check (alumno_id = auth.uid());

create policy "Apuntes: update own"
  on public.apuntes for update to authenticated
  using (alumno_id = auth.uid());

-- 12. AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'alumno')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 13. STORAGE BUCKET for photos
-- ============================================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatars: anyone can read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Avatars: authenticated can upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

create policy "Avatars: users can update own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars');

-- ============================================================
-- SEED DATA (run AFTER creating the 3 demo users via Auth)
-- ============================================================
-- IMPORTANT: First create these 3 users in Supabase Auth:
--   Authentication > Users > Add User (with email confirmation OFF)
--
--   1. admin@centropixels.com  / admin123   (set metadata: {"role":"direccion","name":"Admin Centro Pixels","username":"admin"})
--   2. marta@centropixels.com  / profe123   (set metadata: {"role":"profesor","name":"Marta Ruiz","username":"marta"})
--   3. alumno1@centropixels.com / alumno123 (set metadata: {"role":"alumno","name":"Carlos López","username":"alumno1"})
--
-- After creating users, update profiles with extra data:
-- (the trigger auto-creates basic profiles, these UPDATEs add details)

-- Update Marta's profile with bio and subjects
update public.profiles
set bio = 'Diseñadora gráfica con 12 años de experiencia. Especialista en branding e identidad visual.',
    asignaturas = ARRAY['Diseño Gráfico', 'Branding']
where username = 'marta';

-- Seed modules (uses Marta's profile id)
insert into public.modulos (id, title, description, profesor_id) values
  ('00000000-0000-0000-0000-000000000001', 'Fundamentos del Diseño',
   'Bases del diseño gráfico: composición, color, tipografía y layout.',
   (select id from public.profiles where username = 'marta')),
  ('00000000-0000-0000-0000-000000000002', 'Branding & Identidad Visual',
   'Creación de marcas desde cero: estrategia, naming y sistemas visuales.',
   (select id from public.profiles where username = 'marta'));

-- Seed classes
insert into public.clases (modulo_id, title, video_url, orden, duracion, fecha) values
  ('00000000-0000-0000-0000-000000000001', 'Introducción a la composición',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 1, '45 min', '2026-03-05'),
  ('00000000-0000-0000-0000-000000000001', 'Teoría del color',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 2, '60 min', '2026-03-12'),
  ('00000000-0000-0000-0000-000000000002', 'Qué es una marca',
   'https://player.vimeo.com/video/76979871', 1, '50 min', '2026-03-20');

-- Seed resources
insert into public.recursos (modulo_id, title, tipo, url, descripcion, fecha) values
  ('00000000-0000-0000-0000-000000000001', 'Guía de composición PDF', 'pdf', '#',
   'Manual completo de composición visual.', '2026-03-05'),
  ('00000000-0000-0000-0000-000000000001', 'Rueda de color interactiva', 'link',
   'https://color.adobe.com', 'Herramienta de Adobe para combinaciones de color.', '2026-03-12'),
  ('00000000-0000-0000-0000-000000000002', 'Vídeo: Casos de branding', 'video', '#',
   'Análisis de 5 casos de éxito en branding.', '2026-03-20'),
  ('00000000-0000-0000-0000-000000000001', 'Pack iconos SVG', 'archivo', '#',
   'Set de iconos para prácticas de diseño.', '2026-03-08');

-- Seed assignments
insert into public.trabajos (id, modulo_id, title, descripcion, fecha_limite, profesor_id) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
   'Composición fotográfica',
   'Crear una composición usando la regla de los tercios con 3 fotografías propias.',
   '2026-04-10', (select id from public.profiles where username = 'marta')),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002',
   'Diseño de logotipo',
   'Diseñar un logotipo para una marca ficticia de café artesanal. Entregar en AI o SVG.',
   '2026-04-20', (select id from public.profiles where username = 'marta'));

-- Seed calendar events
insert into public.calendario (title, fecha, tipo) values
  ('Clase: Introducción composición', '2026-03-05', 'clase'),
  ('Clase: Teoría del color', '2026-03-12', 'clase'),
  ('Clase: Qué es una marca', '2026-03-20', 'clase'),
  ('Masterclass: Tendencias 2026', '2026-04-15', 'evento'),
  ('Fin del trimestre', '2026-06-19', 'escolar');

insert into public.calendario (title, fecha, tipo, categoria) values
  ('Semana Santa', '2026-03-30', 'escolar', 'vacaciones'),
  ('Semana Santa', '2026-03-31', 'escolar', 'vacaciones'),
  ('Semana Santa', '2026-04-01', 'escolar', 'vacaciones'),
  ('Semana Santa', '2026-04-02', 'escolar', 'vacaciones'),
  ('Semana Santa', '2026-04-03', 'escolar', 'vacaciones');

insert into public.calendario (title, fecha, tipo, trabajo_id) values
  ('Entrega: Composición fotográfica', '2026-04-10', 'tarea', '00000000-0000-0000-0000-000000000010'),
  ('Entrega: Diseño de logotipo', '2026-04-20', 'tarea', '00000000-0000-0000-0000-000000000011');
