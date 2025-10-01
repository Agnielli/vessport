/*
  # Esquema inicial para plataforma e-commerce de camisetas personalizadas

  1. Tablas principales
    - `profiles` - Perfiles de usuario extendidos
    - `categories` - Categorías de productos
    - `products` - Productos base (camisetas)
    - `designs` - Diseños creados por usuarios
    - `design_sales` - Ventas por diseño para tracking
    - `orders` - Pedidos de clientes
    - `order_items` - Items de cada pedido
    - `payments` - Registro de pagos con Stripe

  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas de acceso por rol de usuario
    - Validaciones de datos

  3. Funciones y triggers
    - Actualización automática de contadores
    - Validaciones de negocio
*/

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para roles de usuario
CREATE TYPE user_role AS ENUM ('customer', 'designer', 'admin');

-- Enum para estados de diseño
CREATE TYPE design_status AS ENUM ('draft', 'published', 'in_progress', 'free_achieved');

-- Enum para estados de pedido
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- Enum para estados de pago
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role user_role DEFAULT 'customer',
  phone text,
  address jsonb, -- {street, city, postal_code, country}
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabla de productos base (tipos de camisetas)
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id),
  base_price decimal(10,2) NOT NULL DEFAULT 25.00,
  images jsonb, -- Array de URLs de imágenes
  sizes jsonb DEFAULT '["XS", "S", "M", "L", "XL", "XXL"]',
  colors jsonb DEFAULT '["white", "black", "navy", "gray"]',
  is_active boolean DEFAULT true,
  stock_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de diseños
CREATE TABLE IF NOT EXISTS designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  design_data jsonb NOT NULL, -- Datos del editor visual
  preview_url text, -- URL de imagen de preview
  product_id uuid REFERENCES products(id),
  status design_status DEFAULT 'draft',
  price decimal(10,2) DEFAULT 80.00, -- Precio del diseño si no alcanza 10 ventas
  sales_count integer DEFAULT 0,
  target_sales integer DEFAULT 10,
  is_public boolean DEFAULT false,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de ventas por diseño (para tracking)
CREATE TABLE IF NOT EXISTS design_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id uuid REFERENCES designs(id) ON DELETE CASCADE,
  order_id uuid, -- Se llenará cuando se cree el pedido
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  order_number text UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  design_fee decimal(10,2) DEFAULT 0, -- Fee por diseños que no alcanzaron 10 ventas
  shipping_cost decimal(10,2) DEFAULT 0,
  tax_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  shipping_address jsonb NOT NULL,
  billing_address jsonb,
  notes text,
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de items de pedido
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  design_id uuid REFERENCES designs(id),
  quantity integer NOT NULL DEFAULT 1,
  size text NOT NULL,
  color text NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  design_fee decimal(10,2) DEFAULT 0,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  stripe_payment_intent_id text UNIQUE NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'eur',
  status payment_status DEFAULT 'pending',
  payment_method jsonb, -- Datos del método de pago de Stripe
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_status ON designs(status);
CREATE INDEX IF NOT EXISTS idx_designs_sales_count ON designs(sales_count);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_design_sales_design_id ON design_sales(design_id);

-- Función para generar número de pedido único
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
BEGIN
  RETURN 'VES-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar contador de ventas de diseño
CREATE OR REPLACE FUNCTION update_design_sales_count()
RETURNS trigger AS $$
BEGIN
  -- Actualizar contador de ventas
  UPDATE designs 
  SET 
    sales_count = (
      SELECT COALESCE(SUM(quantity), 0) 
      FROM design_sales 
      WHERE design_id = NEW.design_id
    ),
    status = CASE 
      WHEN (
        SELECT COALESCE(SUM(quantity), 0) 
        FROM design_sales 
        WHERE design_id = NEW.design_id
      ) >= 10 THEN 'free_achieved'::design_status
      ELSE 'in_progress'::design_status
    END,
    updated_at = now()
  WHERE id = NEW.design_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar contador de ventas
CREATE TRIGGER trigger_update_design_sales_count
  AFTER INSERT ON design_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_design_sales_count();

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_designs_updated_at BEFORE UPDATE ON designs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para categories (públicas para lectura)
CREATE POLICY "Anyone can read active categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para products (públicos para lectura)
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para designs
CREATE POLICY "Users can read own designs"
  ON designs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can read public designs"
  ON designs FOR SELECT
  TO anon, authenticated
  USING (is_public = true AND status IN ('published', 'in_progress', 'free_achieved'));

CREATE POLICY "Users can create own designs"
  ON designs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own designs"
  ON designs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all designs"
  ON designs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para design_sales
CREATE POLICY "Users can read sales of own designs"
  ON design_sales FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM designs 
      WHERE id = design_sales.design_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert design sales"
  ON design_sales FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Se validará en la aplicación

-- Políticas RLS para orders
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para order_items
CREATE POLICY "Users can read items of own orders"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

-- Políticas RLS para payments
CREATE POLICY "Users can read payments of own orders"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = payments.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );