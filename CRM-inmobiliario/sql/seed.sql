-- =====================================================
-- DATOS DE EJEMPLO - CRM Inmobiliario
-- =====================================================

-- Oficinas
INSERT INTO oficinas (id, nombre, direccion, ciudad, provincia, codigo_postal, telefono, email) VALUES
('a1111111-1111-1111-1111-111111111111', 'Oficina Central Bilbao', 'Gran Vía 45, 2º', 'Bilbao', 'Bizkaia', '48001', '944 123 456', 'bilbao@inmobiliaria.com'),
('a2222222-2222-2222-2222-222222222222', 'Oficina Getxo', 'Calle Mayor 12', 'Getxo', 'Bizkaia', '48930', '944 654 321', 'getxo@inmobiliaria.com'),
('a3333333-3333-3333-3333-333333333333', 'Oficina Barakaldo', 'Avenida de la Libertad 8', 'Barakaldo', 'Bizkaia', '48901', '944 789 012', 'barakaldo@inmobiliaria.com');

-- Configuración de oficinas
INSERT INTO configuracion_oficina (oficina_id, prefijo_referencia, auto_publicar_idealista, auto_publicar_fotocasa) VALUES
('a1111111-1111-1111-1111-111111111111', 'BIL', true, true),
('a2222222-2222-2222-2222-222222222222', 'GTX', true, false),
('a3333333-3333-3333-3333-333333333333', 'BRK', false, false);

-- NOTA: Los perfiles se crean automáticamente al registrar usuarios en Supabase Auth.
-- Para testing, crea usuarios desde el dashboard de Supabase y luego actualiza sus perfiles:
--
-- UPDATE perfiles SET
--   nombre = 'Carlos',
--   apellidos = 'García López',
--   rol = 'admin',
--   oficina_id = 'a1111111-1111-1111-1111-111111111111'
-- WHERE email = 'admin@inmobiliaria.com';
