/*
  # Datos iniciales para la plataforma

  1. Categorías de productos
  2. Productos base (tipos de camisetas)
  3. Usuario administrador de ejemplo
*/

-- Insertar categorías
INSERT INTO categories (name, slug, description, is_active) VALUES
('Camisetas Deportivas', 'camisetas-deportivas', 'Camisetas para actividades deportivas y fitness', true),
('Camisetas Casuales', 'camisetas-casuales', 'Camisetas para uso diario y casual', true),
('Camisetas Premium', 'camisetas-premium', 'Camisetas de alta calidad con materiales premium', true);

-- Insertar productos base
INSERT INTO products (name, slug, description, category_id, base_price, images, sizes, colors, stock_quantity) VALUES
(
  'Camiseta Deportiva Básica',
  'camiseta-deportiva-basica',
  'Camiseta deportiva de alta calidad, perfecta para entrenamientos y actividades físicas. Fabricada con materiales transpirables.',
  (SELECT id FROM categories WHERE slug = 'camisetas-deportivas'),
  25.00,
  '["https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg"]',
  '["XS", "S", "M", "L", "XL", "XXL"]',
  '["white", "black", "navy", "red", "blue"]',
  100
),
(
  'Camiseta Casual Comfort',
  'camiseta-casual-comfort',
  'Camiseta casual cómoda para el día a día. Corte moderno y tela suave al tacto.',
  (SELECT id FROM categories WHERE slug = 'camisetas-casuales'),
  22.00,
  '["https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg"]',
  '["XS", "S", "M", "L", "XL", "XXL"]',
  '["white", "black", "gray", "navy", "green"]',
  150
),
(
  'Camiseta Premium Cotton',
  'camiseta-premium-cotton',
  'Camiseta premium fabricada con algodón 100% orgánico. Máxima calidad y durabilidad.',
  (SELECT id FROM categories WHERE slug = 'camisetas-premium'),
  35.00,
  '["https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg"]',
  '["XS", "S", "M", "L", "XL", "XXL"]',
  '["white", "black", "navy", "charcoal"]',
  75
),
(
  'Camiseta Técnica Pro',
  'camiseta-tecnica-pro',
  'Camiseta técnica profesional con tecnología de secado rápido y control de humedad.',
  (SELECT id FROM categories WHERE slug = 'camisetas-deportivas'),
  30.00,
  '["https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg"]',
  '["XS", "S", "M", "L", "XL", "XXL"]',
  '["white", "black", "blue", "red", "yellow"]',
  80
),
(
  'Camiseta Vintage Style',
  'camiseta-vintage-style',
  'Camiseta con estilo vintage, perfecta para looks retro y casuales.',
  (SELECT id FROM categories WHERE slug = 'camisetas-casuales'),
  28.00,
  '["https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg"]',
  '["XS", "S", "M", "L", "XL", "XXL"]',
  '["white", "black", "gray", "brown", "olive"]',
  60
),
(
  'Camiseta Eco-Friendly',
  'camiseta-eco-friendly',
  'Camiseta ecológica fabricada con materiales reciclados y procesos sostenibles.',
  (SELECT id FROM categories WHERE slug = 'camisetas-premium'),
  32.00,
  '["https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg"]',
  '["XS", "S", "M", "L", "XL", "XXL"]',
  '["white", "natural", "green", "blue"]',
  90
);