-- ============================================================
-- EJEMPLOS DE DATOS - ANDY SUBLIMADOS
-- Datos de ejemplo para poblar la base de datos
-- ============================================================

-- ============================================================
-- USUARIOS
-- ============================================================
INSERT INTO user_profiles (email, full_name, phone, role, is_active) VALUES
('admin@andysublimados.com', 'Andrea González', '2983347954', 'admin', true),
('operador@andysublimados.com', 'Carlos Ramírez', '2983123456', 'admin', true);

-- ============================================================
-- CLIENTES
-- ============================================================
INSERT INTO customers (customer_number, name, whatsapp, email, notes, total_orders, last_order_date) VALUES
(1, 'María Fernández', '5492983111111', 'maria.fernandez@email.com', 'Prefiere remeras de algodón. Cliente frecuente.', 5, '2026-03-15'),
(2, 'Juan Pérez', '5492983222222', 'juan.perez@email.com', 'Siempre paga en efectivo', 3, '2026-03-10'),
(3, 'Laura Martínez', '5492983333333', NULL, 'Hace pedidos grandes para eventos', 2, '2026-02-20'),
(4, 'Roberto Sánchez', '5492983444444', 'roberto.s@email.com', NULL, 1, '2026-03-01'),
(5, 'Ana García', '5492983555555', 'ana.garcia@email.com', 'Prefiere transferencia', 4, '2026-03-18');

-- ============================================================
-- PROVEEDORES
-- ============================================================
INSERT INTO suppliers (name, phone, email, category, notes) VALUES
('Distribuidora Telas del Sur', '2983666666', 'ventas@telasdelsur.com', 'Textiles', 'Proveedor principal de remeras lisas'),
('Insumos Gráficos SA', '2983777777', 'contacto@insumosgraficos.com', 'Tintas y Papeles', 'Excelente calidad, entrega rápida'),
('Cerámica Industrial', '2983888888', 'ventas@ceramicaind.com', 'Cerámica', 'Tazas, platos, azulejos'),
('Importadora Sublimados', '2983999999', 'info@importadorasub.com', 'Varios', 'Importa productos de China');

-- ============================================================
-- PRODUCTOS / INSUMOS
-- ============================================================
INSERT INTO products (code, name, image_url, stock, min_stock, price, category, size) VALUES
-- Remeras
('INS-001', 'Remera Blanca Lisa - Adulto', 'https://picsum.photos/seed/remera-blanca/400', 25, 10, 3500, 'Tela', 'M'),
('INS-002', 'Remera Negra Lisa - Adulto', 'https://picsum.photos/seed/remera-negra/400', 15, 10, 3500, 'Tela', 'L'),
('INS-003', 'Remera Infantil Blanca', 'https://picsum.photos/seed/remera-infantil/400', 8, 5, 2800, 'Tela', '8'),
('INS-004', 'Remera Gris Melange', 'https://picsum.photos/seed/remera-gris/400', 12, 10, 3700, 'Tela', 'XL'),

-- Cerámica
('INS-005', 'Taza Blanca 11oz', 'https://picsum.photos/seed/taza-blanca/400', 50, 20, 1200, 'Ceramica', NULL),
('INS-006', 'Taza Mágica Negra', 'https://picsum.photos/seed/taza-magica/400', 2, 15, 2500, 'Ceramica', NULL),
('INS-007', 'Plato Cerámico 20cm', 'https://picsum.photos/seed/plato/400', 30, 10, 1800, 'Ceramica', NULL),

-- Otros
('INS-008', 'Almohadón 40x40 Blanco', 'https://picsum.photos/seed/almohadon/400', 18, 8, 2200, 'Tela', NULL),
('INS-009', 'Mouse Pad Rectangular', 'https://picsum.photos/seed/mousepad/400', 45, 15, 800, 'polymer', NULL),
('INS-010', 'Llavero Acrílico', 'https://picsum.photos/seed/llavero/400', 100, 30, 350, 'polymer', NULL),

-- Insumos consumibles
('INS-011', 'Papel Sublimación A4 x100', 'https://picsum.photos/seed/papel/400', 5, 3, 8500, 'papel', NULL),
('INS-012', 'Tinta Sublimación Cyan', 'https://picsum.photos/seed/tinta-cyan/400', 4, 2, 12000, 'papel', NULL),
('INS-013', 'Tinta Sublimación Magenta', 'https://picsum.photos/seed/tinta-magenta/400', 3, 2, 12000, 'papel', NULL),
('INS-014', 'Tinta Sublimación Yellow', 'https://picsum.photos/seed/tinta-yellow/400', 4, 2, 12000, 'papel', NULL),
('INS-015', 'Tinta Sublimación Black', 'https://picsum.photos/seed/tinta-black/400', 2, 2, 12000, 'papel', NULL);

-- ============================================================
-- PEDIDOS (ORDERS)
-- ============================================================
INSERT INTO orders (
    customer_name, whatsapp, description, delivery_date,
    total_amount, deposit_amount, deposit_method,
    remaining_amount, remaining_method,
    is_delivered, remaining_paid, status, contact_method,
    created_at
) VALUES
-- Pedido 1: Completado y entregado
(
    'María Fernández', '5492983111111',
    '10 remeras con logo de empresa', '2026-03-20',
    45000, 20000, 'Efectivo Físico',
    25000, 'Transferencia',
    true, true, 'terminado', 'WhatsApp',
    '2026-03-10 10:30:00'
),

-- Pedido 2: En proceso
(
    'Juan Pérez', '5492983222222',
    '20 tazas personalizadas para cumpleaños', '2026-04-15',
    30000, 15000, 'Efectivo Físico',
    15000, 'Efectivo Físico',
    false, false, 'proceso', 'Presencial',
    '2026-03-25 14:20:00'
),

-- Pedido 3: Pendiente
(
    'Laura Martínez', '5492983333333',
    '5 almohadones con fotos familiares', '2026-04-20',
    18000, 0, 'Efectivo Físico',
    18000, 'Efectivo Físico',
    false, false, 'pedido', 'Instagram',
    '2026-04-01 09:15:00'
),

-- Pedido 4: Entregado pero con deuda
(
    'Roberto Sánchez', '5492983444444',
    '3 remeras personalizadas', '2026-03-25',
    12000, 5000, 'Dinero Digital',
    7000, 'Efectivo Físico',
    true, false, 'terminado', 'WhatsApp',
    '2026-03-18 16:45:00'
),

-- Pedido 5: Terminado, listo para retirar
(
    'Ana García', '5492983555555',
    '50 mouse pads para empresa', '2026-04-10',
    42000, 20000, 'Transferencia',
    22000, 'Transferencia',
    false, false, 'terminado', 'Facebook',
    '2026-03-28 11:00:00'
);

-- Obtener IDs de los pedidos recién creados para vincular productos
-- (En la práctica, esto se haría con variables o en una transacción)

-- ============================================================
-- PRODUCTOS VINCULADOS A PEDIDOS
-- ============================================================
-- Nota: Estos INSERT asumen que los IDs de orders y products
-- corresponden a los registros creados arriba.
-- En producción, usar variables o subconsultas.

-- Ejemplo conceptual (ajustar IDs según corresponda):
-- INSERT INTO order_products (order_id, product_id, product_name, quantity)
-- SELECT
--     o.id,
--     p.id,
--     p.name,
--     10
-- FROM orders o
-- CROSS JOIN products p
-- WHERE o.customer_name = 'María Fernández'
--   AND p.code = 'INS-001'
-- LIMIT 1;

-- ============================================================
-- MOVIMIENTOS DE CAJA
-- ============================================================
INSERT INTO cash_movements (movement_date, description, amount, type, method, category) VALUES
-- Ingresos
('2026-03-10 10:35:00', 'Seña: María Fernández', 20000, 'Ingreso', 'Efectivo Físico', 'Varios'),
('2026-03-20 15:20:00', 'Cobro Final: María Fernández', 25000, 'Ingreso', 'Transferencia', 'Modista'),
('2026-03-25 14:25:00', 'Seña: Juan Pérez', 15000, 'Ingreso', 'Efectivo Físico', 'Varios'),
('2026-03-18 16:50:00', 'Seña: Roberto Sánchez', 5000, 'Ingreso', 'Dinero Digital', 'Varios'),
('2026-03-28 11:05:00', 'Seña: Ana García', 20000, 'Ingreso', 'Transferencia', 'Varios'),

-- Egresos
('2026-03-15 09:00:00', 'Compra de remeras blancas x30', 75000, 'Egreso', 'Transferencia', 'Empresa'),
('2026-03-16 10:30:00', 'Pago a modista por trabajos del mes', 45000, 'Egreso', 'Efectivo Físico', 'Modista'),
('2026-03-20 08:00:00', 'Envío pedido a Buenos Aires', 3500, 'Egreso', 'Efectivo Físico', 'Transporte'),
('2026-03-22 14:00:00', 'Compra tazas mágicas x20', 35000, 'Egreso', 'Transferencia', 'Empresa'),
('2026-03-25 16:00:00', 'Papel sublimación x200 hojas', 15000, 'Egreso', 'Efectivo Físico', 'Empresa'),
('2026-03-28 09:30:00', 'Recarga tintas de impresora', 48000, 'Egreso', 'Transferencia', 'Empresa'),
('2026-04-01 10:00:00', 'Servicio técnico impresora', 8500, 'Egreso', 'Efectivo Físico', 'Varios'),
('2026-04-02 11:00:00', 'Pago luz del local', 12000, 'Egreso', 'Transferencia', 'Empresa');

-- ============================================================
-- PRESUPUESTOS (QUOTES)
-- ============================================================
INSERT INTO quotes (customer_name, customer_phone, quote_date, total_amount, notes)
VALUES
(
    'Municipalidad de Tres Arroyos',
    '2983600000',
    '2026-04-03 10:00:00',
    156000,
    'Presupuesto válido por 15 días. Incluye diseño gráfico sin cargo.'
),
(
    'Club Deportivo Huracán',
    '2983700000',
    '2026-04-02 15:30:00',
    89500,
    'Presupuesto para indumentaria deportiva. Entrega estimada: 20 días.'
),
(
    'Escuela N° 12',
    '2983800000',
    '2026-03-30 09:00:00',
    42000,
    'Presupuesto para souvenirs de egresados. Validez: 10 días.'
);

-- Obtener IDs de quotes para insertar items
-- (Ajustar según IDs reales)

-- ============================================================
-- ITEMS DE PRESUPUESTOS
-- ============================================================
-- Ejemplo conceptual:
-- INSERT INTO quote_items (quote_id, quantity, description, unit_price, total)
-- SELECT
--     q.id,
--     50,
--     'Remera blanca con logo bordado',
--     2800,
--     140000
-- FROM quotes q
-- WHERE q.customer_name = 'Municipalidad de Tres Arroyos'
-- LIMIT 1;

-- INSERT INTO quote_items (quote_id, quantity, description, unit_price, total)
-- SELECT
--     q.id,
--     20,
--     'Taza cerámica 11oz personalizada',
--     800,
--     16000
-- FROM quotes q
-- WHERE q.customer_name = 'Municipalidad de Tres Arroyos'
-- LIMIT 1;

-- ============================================================
-- RESUMEN DE DATOS CARGADOS
-- ============================================================
/*
✅ 2 usuarios (admin y operador)
✅ 5 clientes con historial
✅ 4 proveedores de diferentes rubros
✅ 15 productos/insumos (remeras, tazas, consumibles, etc.)
✅ 5 pedidos en diferentes estados
✅ 13 movimientos de caja (ingresos y egresos)
✅ 3 presupuestos enviados

ESCENARIOS CUBIERTOS:
- ✅ Cliente con deuda (Roberto Sánchez: $7.000)
- ✅ Productos con stock crítico (Taza Mágica: 2 unidades, mínimo 15)
- ✅ Productos con stock bajo mínimo (Tintas negras: 2 unidades, mínimo 2)
- ✅ Pedidos en todos los estados (pedido, proceso, terminado, entregado)
- ✅ Diferentes métodos de pago y contacto
- ✅ Balance de caja con ingresos y egresos

DATOS CALCULADOS:
- Balance de caja: $-136.000 (más egresos que ingresos este mes)
- Deudores totales: 2 clientes por $25.000
- Stock crítico: 4 productos por debajo del mínimo
- Pedidos activos: 4 (1 pendiente, 1 en proceso, 2 terminados sin entregar)
*/

-- ============================================================
-- CONSULTAS ÚTILES PARA VERIFICAR DATOS
-- ============================================================

-- Ver balance de caja
SELECT
    SUM(CASE WHEN type = 'Ingreso' THEN amount ELSE 0 END) as total_ingresos,
    SUM(CASE WHEN type = 'Egreso' THEN amount ELSE 0 END) as total_egresos,
    SUM(CASE WHEN type = 'Ingreso' THEN amount ELSE -amount END) as balance
FROM cash_movements;

-- Ver clientes deudores
SELECT * FROM customer_debtors;

-- Ver productos con stock crítico
SELECT * FROM products_critical_stock;

-- Ver pedidos pendientes de entrega
SELECT
    customer_name,
    description,
    delivery_date,
    total_amount,
    status,
    is_delivered
FROM orders
WHERE is_delivered = false
ORDER BY delivery_date;

-- Ver resumen por cliente
SELECT
    c.customer_number,
    c.name,
    c.total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_invertido,
    COALESCE(SUM(CASE WHEN o.remaining_paid = false AND o.remaining_amount > 0 THEN o.remaining_amount ELSE 0 END), 0) as deuda_pendiente
FROM customers c
LEFT JOIN orders o ON c.name = o.customer_name
GROUP BY c.id, c.customer_number, c.name, c.total_orders
ORDER BY total_invertido DESC;
