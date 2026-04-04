-- ============================================================
-- ANDY SUBLIMADOS - SUPABASE DATABASE SCHEMA
-- Sistema de gestión integral para negocio de sublimados
-- ============================================================
--
-- CONVENCIONES:
-- - Nombres de tablas y columnas: inglés (snake_case)
-- - Enums y descripciones: español
-- - Todas las tablas tienen descripción (COMMENT)
-- - Todas las columnas tienen descripción (COMMENT)
-- ============================================================

-- ============================================================
-- EXTENSIONES NECESARIAS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS (Tipos enumerados)
-- ============================================================

-- Métodos de pago
CREATE TYPE payment_method AS ENUM (
    'Efectivo Físico',
    'Dinero Digital'
);
COMMENT ON TYPE payment_method IS 'Métodos de pago disponibles: Efectivo Físico (efectivo físico en mano) y Dinero Digital (transferencias, Mercado Pago, etc.)';

-- Estados de pedidos
CREATE TYPE order_status AS ENUM (
    'pedido',
    'proceso',
    'terminado'
);
COMMENT ON TYPE order_status IS 'Estados del ciclo de vida de un pedido: pedido (pendiente), proceso (en fabricación), terminado (listo para entregar)';

-- Tipos de movimiento de caja
CREATE TYPE movement_type AS ENUM (
    'Ingreso',
    'Egreso'
);
COMMENT ON TYPE movement_type IS 'Tipo de movimiento de caja: Ingreso (entrada de dinero) o Egreso (salida de dinero)';

-- Categorías de movimientos de caja
CREATE TYPE cash_category AS ENUM (
    'Modista',
    'Transporte',
    'Empresa',
    'Varios'
);
COMMENT ON TYPE cash_category IS 'Categorías para clasificar movimientos de caja';

-- Métodos de contacto con clientes
CREATE TYPE contact_method AS ENUM (
    'WhatsApp',
    'Instagram',
    'Facebook',
    'Presencial'
);
COMMENT ON TYPE contact_method IS 'Canal por el cual se contactó o realizó el pedido el cliente';

-- Categorías de productos/insumos
CREATE TYPE product_category AS ENUM (
    'Tela',
    'Ceramica',
    'Vidrio',
    'metal',
    'papel',
    'polymer'
);
COMMENT ON TYPE product_category IS 'Categorías de productos e insumos para sublimado';

-- Roles de usuario
CREATE TYPE user_role AS ENUM (
    'admin'
);
COMMENT ON TYPE user_role IS 'Roles de usuario en el sistema (por ahora solo admin)';

-- ============================================================
-- TABLA: user_profiles
-- Perfiles de usuarios del sistema con autenticación
-- ============================================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

COMMENT ON TABLE user_profiles IS 'Perfiles de usuarios del sistema con autenticación y datos personales';
COMMENT ON COLUMN user_profiles.id IS 'Identificador único del usuario (UUID)';
COMMENT ON COLUMN user_profiles.email IS 'Correo electrónico del usuario (único, usado para login)';
COMMENT ON COLUMN user_profiles.full_name IS 'Nombre completo del usuario';
COMMENT ON COLUMN user_profiles.phone IS 'Número de teléfono de contacto';
COMMENT ON COLUMN user_profiles.role IS 'Rol del usuario en el sistema';
COMMENT ON COLUMN user_profiles.is_active IS 'Indica si el usuario está activo en el sistema';
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL de la imagen de perfil del usuario';
COMMENT ON COLUMN user_profiles.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN user_profiles.updated_at IS 'Fecha y hora de última actualización';
COMMENT ON COLUMN user_profiles.last_login_at IS 'Fecha y hora del último inicio de sesión';

-- Índices para user_profiles
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- ============================================================
-- TABLA: customers
-- Clientes del negocio
-- ============================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_number INTEGER UNIQUE,
    name TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    notes TEXT,
    total_orders INTEGER NOT NULL DEFAULT 0,
    last_order_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE customers IS 'Registro de clientes del negocio';
COMMENT ON COLUMN customers.id IS 'Identificador único del cliente (UUID)';
COMMENT ON COLUMN customers.customer_number IS 'Número de cliente asignado secuencialmente';
COMMENT ON COLUMN customers.name IS 'Nombre completo del cliente';
COMMENT ON COLUMN customers.whatsapp IS 'Número de WhatsApp del cliente';
COMMENT ON COLUMN customers.email IS 'Correo electrónico del cliente';
COMMENT ON COLUMN customers.notes IS 'Notas y preferencias del cliente';
COMMENT ON COLUMN customers.total_orders IS 'Cantidad total de pedidos realizados por el cliente';
COMMENT ON COLUMN customers.last_order_date IS 'Fecha del último pedido del cliente';
COMMENT ON COLUMN customers.created_at IS 'Fecha y hora de registro del cliente';
COMMENT ON COLUMN customers.updated_at IS 'Fecha y hora de última actualización';

-- Índices para customers
CREATE INDEX idx_customers_customer_number ON customers(customer_number);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_whatsapp ON customers(whatsapp);

-- ============================================================
-- TABLA: suppliers
-- Proveedores de insumos
-- ============================================================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    category TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE suppliers IS 'Proveedores de insumos y materiales';
COMMENT ON COLUMN suppliers.id IS 'Identificador único del proveedor (UUID)';
COMMENT ON COLUMN suppliers.name IS 'Nombre o razón social del proveedor';
COMMENT ON COLUMN suppliers.phone IS 'Teléfono de contacto del proveedor';
COMMENT ON COLUMN suppliers.email IS 'Correo electrónico del proveedor';
COMMENT ON COLUMN suppliers.category IS 'Categoría o rubro del proveedor';
COMMENT ON COLUMN suppliers.notes IS 'Notas adicionales sobre el proveedor';
COMMENT ON COLUMN suppliers.created_at IS 'Fecha y hora de registro del proveedor';
COMMENT ON COLUMN suppliers.updated_at IS 'Fecha y hora de última actualización';

-- Índices para suppliers
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_category ON suppliers(category);

-- ============================================================
-- TABLA: products
-- Productos e insumos del inventario
-- ============================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    image_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 3,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category product_category,
    size TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE products IS 'Inventario de productos e insumos para sublimado';
COMMENT ON COLUMN products.id IS 'Identificador único del producto (UUID)';
COMMENT ON COLUMN products.code IS 'Código interno del producto (auto-generado si no se provee)';
COMMENT ON COLUMN products.name IS 'Nombre comercial del producto';
COMMENT ON COLUMN products.image_url IS 'URL de la imagen del producto';
COMMENT ON COLUMN products.stock IS 'Cantidad disponible en stock';
COMMENT ON COLUMN products.min_stock IS 'Stock mínimo para alertas (por defecto 3)';
COMMENT ON COLUMN products.price IS 'Precio de venta del producto';
COMMENT ON COLUMN products.category IS 'Categoría del producto (Tela, Ceramica, etc.)';
COMMENT ON COLUMN products.size IS 'Talle del producto (para remeras: S, M, L, XL, etc.)';
COMMENT ON COLUMN products.created_at IS 'Fecha y hora de registro del producto';
COMMENT ON COLUMN products.updated_at IS 'Fecha y hora de última actualización';

-- Índices para products
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_stock_critical ON products(stock) WHERE stock <= min_stock;

-- ============================================================
-- TABLA: orders
-- Pedidos y trabajos de clientes
-- ============================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    whatsapp TEXT,
    description TEXT NOT NULL,
    delivery_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    deposit_method payment_method,
    remaining_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    remaining_method payment_method,
    is_delivered BOOLEAN NOT NULL DEFAULT false,
    remaining_paid BOOLEAN NOT NULL DEFAULT false,
    status order_status NOT NULL DEFAULT 'pedido',
    contact_method contact_method,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Pedidos y trabajos de sublimado de clientes';
COMMENT ON COLUMN orders.id IS 'Identificador único del pedido (UUID)';
COMMENT ON COLUMN orders.customer_id IS 'Referencia al cliente (puede ser NULL si se eliminó)';
COMMENT ON COLUMN orders.customer_name IS 'Nombre del cliente (guardado para mantener historial)';
COMMENT ON COLUMN orders.whatsapp IS 'WhatsApp del cliente al momento del pedido';
COMMENT ON COLUMN orders.description IS 'Descripción detallada del trabajo a realizar';
COMMENT ON COLUMN orders.delivery_date IS 'Fecha de entrega comprometida';
COMMENT ON COLUMN orders.total_amount IS 'Monto total del pedido';
COMMENT ON COLUMN orders.deposit_amount IS 'Seña o anticipo pagado';
COMMENT ON COLUMN orders.deposit_method IS 'Método de pago de la seña';
COMMENT ON COLUMN orders.remaining_amount IS 'Saldo restante a cobrar';
COMMENT ON COLUMN orders.remaining_method IS 'Método de pago para el saldo';
COMMENT ON COLUMN orders.is_delivered IS 'Indica si el pedido fue entregado al cliente';
COMMENT ON COLUMN orders.remaining_paid IS 'Indica si el saldo fue cobrado';
COMMENT ON COLUMN orders.status IS 'Estado del pedido (pedido/proceso/terminado)';
COMMENT ON COLUMN orders.contact_method IS 'Canal por el cual se contactó el cliente';
COMMENT ON COLUMN orders.created_at IS 'Fecha y hora de creación del pedido';
COMMENT ON COLUMN orders.updated_at IS 'Fecha y hora de última actualización';

-- Índices para orders
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_customer_name ON orders(customer_name);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_is_delivered ON orders(is_delivered);
CREATE INDEX idx_orders_remaining_paid ON orders(remaining_paid);
CREATE INDEX idx_orders_debtors ON orders(remaining_amount) WHERE remaining_paid = false AND remaining_amount > 0;

-- ============================================================
-- TABLA: order_products
-- Productos vinculados a cada pedido
-- ============================================================
CREATE TABLE order_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE order_products IS 'Materiales e insumos vinculados a cada pedido';
COMMENT ON COLUMN order_products.id IS 'Identificador único del vínculo (UUID)';
COMMENT ON COLUMN order_products.order_id IS 'Referencia al pedido';
COMMENT ON COLUMN order_products.product_id IS 'Referencia al producto (puede ser NULL si se eliminó)';
COMMENT ON COLUMN order_products.product_name IS 'Nombre del producto (guardado para mantener historial)';
COMMENT ON COLUMN order_products.quantity IS 'Cantidad de unidades utilizadas';
COMMENT ON COLUMN order_products.created_at IS 'Fecha y hora de vinculación';

-- Índices para order_products
CREATE INDEX idx_order_products_order_id ON order_products(order_id);
CREATE INDEX idx_order_products_product_id ON order_products(product_id);

-- ============================================================
-- TABLA: cash_movements
-- Movimientos de caja (ingresos y egresos)
-- ============================================================
CREATE TABLE cash_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movement_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type movement_type NOT NULL,
    method payment_method NOT NULL,
    category cash_category NOT NULL DEFAULT 'Varios',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE cash_movements IS 'Registro de movimientos de caja del negocio';
COMMENT ON COLUMN cash_movements.id IS 'Identificador único del movimiento (UUID)';
COMMENT ON COLUMN cash_movements.movement_date IS 'Fecha y hora del movimiento';
COMMENT ON COLUMN cash_movements.description IS 'Descripción del concepto del movimiento';
COMMENT ON COLUMN cash_movements.amount IS 'Monto del movimiento';
COMMENT ON COLUMN cash_movements.type IS 'Tipo de movimiento (Ingreso/Egreso)';
COMMENT ON COLUMN cash_movements.method IS 'Método de pago utilizado';
COMMENT ON COLUMN cash_movements.category IS 'Categoría del movimiento (Modista, Transporte, etc.)';
COMMENT ON COLUMN cash_movements.created_at IS 'Fecha y hora de registro del movimiento';

-- Índices para cash_movements
CREATE INDEX idx_cash_movements_date ON cash_movements(movement_date);
CREATE INDEX idx_cash_movements_type ON cash_movements(type);
CREATE INDEX idx_cash_movements_category ON cash_movements(category);
CREATE INDEX idx_cash_movements_method ON cash_movements(method);

-- ============================================================
-- TABLA: quotes
-- Presupuestos para clientes
-- ============================================================
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    quote_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE quotes IS 'Presupuestos generados para clientes';
COMMENT ON COLUMN quotes.id IS 'Identificador único del presupuesto (UUID)';
COMMENT ON COLUMN quotes.customer_id IS 'Referencia al cliente (puede ser NULL)';
COMMENT ON COLUMN quotes.customer_name IS 'Nombre del cliente';
COMMENT ON COLUMN quotes.customer_phone IS 'Teléfono del cliente';
COMMENT ON COLUMN quotes.quote_date IS 'Fecha de emisión del presupuesto';
COMMENT ON COLUMN quotes.total_amount IS 'Monto total del presupuesto';
COMMENT ON COLUMN quotes.notes IS 'Observaciones y notas adicionales';
COMMENT ON COLUMN quotes.created_at IS 'Fecha y hora de creación';
COMMENT ON COLUMN quotes.updated_at IS 'Fecha y hora de última actualización';

-- Índices para quotes
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_customer_name ON quotes(customer_name);
CREATE INDEX idx_quotes_quote_date ON quotes(quote_date);

-- ============================================================
-- TABLA: quote_items
-- Items/líneas de cada presupuesto
-- ============================================================
CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    description TEXT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE quote_items IS 'Ítems individuales de cada presupuesto';
COMMENT ON COLUMN quote_items.id IS 'Identificador único del ítem (UUID)';
COMMENT ON COLUMN quote_items.quote_id IS 'Referencia al presupuesto';
COMMENT ON COLUMN quote_items.quantity IS 'Cantidad de unidades';
COMMENT ON COLUMN quote_items.description IS 'Descripción del producto o servicio';
COMMENT ON COLUMN quote_items.unit_price IS 'Precio unitario';
COMMENT ON COLUMN quote_items.total IS 'Total de la línea (cantidad × precio unitario)';
COMMENT ON COLUMN quote_items.created_at IS 'Fecha y hora de creación';

-- Índices para quote_items
CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);

-- ============================================================
-- TRIGGERS PARA ACTUALIZAR updated_at
-- ============================================================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Función trigger para actualizar automáticamente la columna updated_at';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- ============================================================
-- Nota: Las políticas deben configurarse según los requisitos
-- de autenticación de Supabase

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- Política básica: Los usuarios autenticados pueden ver todos los datos
-- (ajustar según necesidades de seguridad)
CREATE POLICY "Usuarios autenticados pueden ver user_profiles"
    ON user_profiles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver customers"
    ON customers FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden gestionar suppliers"
    ON suppliers FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden gestionar products"
    ON products FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden gestionar orders"
    ON orders FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden gestionar order_products"
    ON order_products FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden gestionar cash_movements"
    ON cash_movements FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden gestionar quotes"
    ON quotes FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden gestionar quote_items"
    ON quote_items FOR ALL
    USING (auth.role() = 'authenticated');

-- ============================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================================

-- Usuario administrador de ejemplo
INSERT INTO user_profiles (email, full_name, phone, role)
VALUES ('admin@andysublimados.com', 'Administrador Andy', '2983347954', 'admin');

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista: Productos con stock crítico
CREATE OR REPLACE VIEW products_critical_stock AS
SELECT
    id,
    code,
    name,
    stock,
    min_stock,
    price,
    category,
    (min_stock - stock) as units_needed
FROM products
WHERE stock <= min_stock
ORDER BY (min_stock - stock) DESC;

COMMENT ON VIEW products_critical_stock IS 'Productos que necesitan reposición (stock <= stock mínimo)';

-- Vista: Clientes deudores
CREATE OR REPLACE VIEW customer_debtors AS
SELECT
    o.customer_name,
    o.whatsapp,
    COUNT(o.id) as pending_orders,
    SUM(o.remaining_amount) as total_debt,
    MIN(o.created_at) as oldest_order_date,
    MAX(o.delivery_date) as last_delivery_date
FROM orders o
WHERE o.remaining_paid = false
  AND o.remaining_amount > 0
GROUP BY o.customer_name, o.whatsapp
ORDER BY total_debt DESC;

COMMENT ON VIEW customer_debtors IS 'Resumen de clientes con saldos pendientes de pago';

-- Vista: Resumen financiero por mes
CREATE OR REPLACE VIEW monthly_financial_summary AS
SELECT
    DATE_TRUNC('month', movement_date) as month,
    SUM(CASE WHEN type = 'Ingreso' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'Egreso' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN type = 'Ingreso' THEN amount ELSE -amount END) as net_balance
FROM cash_movements
GROUP BY DATE_TRUNC('month', movement_date)
ORDER BY month DESC;

COMMENT ON VIEW monthly_financial_summary IS 'Resumen de ingresos, egresos y balance por mes';

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
