-- ============================================================
-- SEED DATA — Centro Pixels
-- ============================================================
-- Ejecuta esto en SQL Editor DESPUÉS de haber creado los 3 usuarios demo
-- ============================================================

-- Actualizar perfil de Marta con bio y asignaturas
update public.profiles
set bio = 'Diseñadora gráfica con 12 años de experiencia. Especialista en branding e identidad visual.',
    asignaturas = ARRAY['Diseño Gráfico', 'Branding']
where username = 'marta';

-- Módulos
insert into public.modulos (id, title, description, profesor_id) values
  ('00000000-0000-0000-0000-000000000001', 'Fundamentos del Diseño',
   'Bases del diseño gráfico: composición, color, tipografía y layout.',
   (select id from public.profiles where username = 'marta')),
  ('00000000-0000-0000-0000-000000000002', 'Branding & Identidad Visual',
   'Creación de marcas desde cero: estrategia, naming y sistemas visuales.',
   (select id from public.profiles where username = 'marta'));

-- Clases
insert into public.clases (modulo_id, title, video_url, orden, duracion, fecha) values
  ('00000000-0000-0000-0000-000000000001', 'Introducción a la composición',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 1, '45 min', '2026-03-05'),
  ('00000000-0000-0000-0000-000000000001', 'Teoría del color',
   'https://www.youtube.com/embed/dQw4w9WgXcQ', 2, '60 min', '2026-03-12'),
  ('00000000-0000-0000-0000-000000000002', 'Qué es una marca',
   'https://player.vimeo.com/video/76979871', 1, '50 min', '2026-03-20');

-- Recursos
insert into public.recursos (modulo_id, title, tipo, url, descripcion, fecha) values
  ('00000000-0000-0000-0000-000000000001', 'Guía de composición PDF', 'pdf', '#',
   'Manual completo de composición visual.', '2026-03-05'),
  ('00000000-0000-0000-0000-000000000001', 'Rueda de color interactiva', 'link',
   'https://color.adobe.com', 'Herramienta de Adobe para combinaciones de color.', '2026-03-12'),
  ('00000000-0000-0000-0000-000000000002', 'Vídeo: Casos de branding', 'video', '#',
   'Análisis de 5 casos de éxito en branding.', '2026-03-20'),
  ('00000000-0000-0000-0000-000000000001', 'Pack iconos SVG', 'archivo', '#',
   'Set de iconos para prácticas de diseño.', '2026-03-08');

-- Trabajos
insert into public.trabajos (id, modulo_id, title, descripcion, fecha_limite, profesor_id) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
   'Composición fotográfica',
   'Crear una composición usando la regla de los tercios con 3 fotografías propias.',
   '2026-04-10', (select id from public.profiles where username = 'marta')),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002',
   'Diseño de logotipo',
   'Diseñar un logotipo para una marca ficticia de café artesanal. Entregar en AI o SVG.',
   '2026-04-20', (select id from public.profiles where username = 'marta'));

-- Calendario
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
