# 📊 ANÁLISIS COMPLETO - ANDY SUBLIMADOS

## 🎯 Descripción General del Proyecto

**Andy Sublimados** es un sistema de gestión integral para un negocio de sublimados que incluye:
- Gestión de inventario de insumos
- Agenda de pedidos y producción
- Control de caja y finanzas
- Gestión de clientes y proveedores
- Sistema de presupuestos
- Arqueo de caja
- Análisis de deudores

---

## 📁 Estructura del Proyecto

### Archivos Principales
- `App.tsx` - Componente principal con navegación
- `types.ts` - Definiciones de tipos TypeScript
- `server.ts` - Servidor Express para API
- `components/` - Componentes de React

### Componentes Principales
1. **Dashboard** - Panel principal con resumen
2. **Inventory** - Gestión de insumos y productos
3. **OrdersAgenda** - Agenda de pedidos y producción
4. **CashFlow** - Movimientos de caja
5. **CustomersList** - Gestión de clientes
6. **SuppliersList** - Gestión de proveedores
7. **QuotesManager** - Generación de presupuestos
8. **CashReconciliation** - Arqueo de caja
9. **DebtorCustomers** - Control de deudores
10. **ChartsView** - Gráficos y análisis
11. **PricingCalculator** - Calculadora de costos

---

## 🔍 ANÁLISIS DETALLADO POR COMPONENTE

### 1️⃣ **INVENTORY (Gestión de Insumos)**

#### Inputs y Campos
| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `code` | texto | Código interno del producto (auto-generado) | No |
| `name` | texto | Nombre comercial del producto | Sí |
| `stock` | número | Cantidad disponible en inventario | Sí |
| `minStock` | número | Stock mínimo para alertas (default: 3) | Sí |
| `price` | número | Precio de venta del producto | Sí |
| `imageUrl` | texto/archivo | URL o archivo de imagen del producto | No |
| `category` | selector | Categoría: Tela, Ceramica, Vidrio, metal, papel, polymer | No |
| `size` | selector condicional | Talle (solo si es remera) | No |

#### Selectores de Talle (Remeras)
- **Adultos**: S, M, L, XL, XXL, XXXL
- **Niños**: 1, 2, 4, 6, 8, 10, 12, 14, 16

#### Filtros
- `searchTerm`: Búsqueda por nombre, categoría o código
- `showCriticalOnly`: Toggle para mostrar solo productos con stock <= minStock

#### Funcionalidades
- ✅ Crear nuevo insumo
- ✅ Editar insumo existente
- ✅ Eliminar insumo (con confirmación)
- ✅ Autoguardado al editar
- ✅ Alerta visual para stock crítico
- ✅ Carga de imagen desde URL o archivo local
- ✅ Detección automática de remeras para mostrar selector de talle

---

### 2️⃣ **ORDERS AGENDA (Agenda de Pedidos)**

#### Inputs del Formulario de Pedido
| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `customerName` | texto autocompletar | Nombre del cliente (con sugerencias) | Sí |
| `whatsapp` | tel | WhatsApp del cliente | No |
| `contactMethod` | selector | WhatsApp, Instagram, Facebook, Presencial | No |
| `description` | textarea | Descripción detallada del trabajo | Sí |
| `deliveryDate` | date | Fecha de entrega | Sí |
| `totalAmount` | número | Precio total del pedido | Sí |
| `depositAmount` | número | Seña o anticipo | No |
| `depositMethod` | selector | Efectivo Físico, Dinero Digital | Sí (si hay seña) |
| `remainingAmount` | calculado | Saldo pendiente (total - seña) | Auto |
| `remainingMethod` | selector | Efectivo Físico, Dinero Digital | Sí (si se marca cobrado) |
| `remainingPaid` | toggle | Marca si el saldo fue cobrado | No |
| `isDelivered` | toggle | Marca si fue entregado | No |
| `status` | selector | pedido, proceso, terminado | Sí |
| `linkedProducts` | multi-select | Productos vinculados con cantidad | No |

#### Modos de Vista
1. **Calendario (calendar)** - Vista mensual con pedidos por día
2. **Kanban** - Columnas por estado (Pendiente, En Proceso, Terminado, Entregado)
3. **Lista (list)** - Vista de tarjetas en grilla

#### Filtros
- `search`: Búsqueda por cliente o descripción
- `statusFilter`: todos, pedido, proceso, terminado, entregado
- `dateFilter`: hoy, semana, mes, personalizado (rango)

#### Estados del Pedido
- **pedido** (Pendiente) → Color rojo
- **proceso** (En Proceso) → Color amarillo
- **terminado** (Terminado) → Color verde
- **entregado** (Entregado) → Color azul índigo

#### Funcionalidades Especiales
- ✅ **Autoguardado**: Los cambios se guardan automáticamente al editar
- ✅ **Autocompletar clientes**: Sugerencias mientras escribes
- ✅ **Vinculación de productos**: Reduce stock automáticamente
- ✅ **Control de stock**: No permite vincular más de la cantidad disponible
- ✅ **Advertencia de deuda**: Alerta si se entrega con saldo pendiente
- ✅ **Movimientos de caja automáticos**: Registra seña y cobro final
- ✅ **WhatsApp directo**: Botón para enviar mensaje al cliente
- ✅ **Actualización de clientes**: Incrementa totalOrders y actualiza lastOrderDate

---

### 3️⃣ **CASH FLOW (Movimientos de Caja)**

#### Inputs del Formulario
| Campo | Tipo | Descripción | Valores Posibles |
|-------|------|-------------|------------------|
| `description` | texto | Descripción del movimiento | Libre |
| `amount` | número | Monto del movimiento | > 0 |
| `type` | toggle dual | Tipo de movimiento | Ingreso / Egreso |
| `method` | selector | Medio de pago | Efectivo Físico, Dinero Digital |
| `category` | selector | Categoría del movimiento | Modista, Transporte, Empresa, Varios |

#### Categorías
- **Modista**: Gastos o ingresos relacionados con modista/confección
- **Transporte**: Gastos de envíos y transporte
- **Empresa**: Gastos operativos de la empresa
- **Varios**: Otros movimientos

#### Filtros
- `filterType`: TODOS, Ingreso, Egreso
- `filterCategory`: TODOS, Modista, Transporte, Empresa, Varios
- `dateRange`: Fecha inicio y fin

#### Tarjetas Resumen
1. **Ingresos Totales** - Suma de todos los ingresos (verde)
2. **Egresos Totales** - Suma de todos los egresos (rojo)
3. **Balance Neto** - Diferencia entre ingresos y egresos (negro)

#### Funcionalidades
- ✅ Registro manual de movimientos
- ✅ Historial completo con filtros
- ✅ Eliminación con confirmación doble
- ✅ Cálculo automático de balances
- ✅ Filtrado por tipo, categoría y fechas

---

### 4️⃣ **CUSTOMERS LIST (Gestión de Clientes)**

#### Campos del Cliente
| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `customerNumber` | número | Número de cliente (auto-incrementa) | Auto |
| `name` | texto | Nombre completo | Sí |
| `whatsapp` | texto | Número de WhatsApp | No |
| `notes` | textarea | Notas y preferencias | No |
| `totalOrders` | número | Total de pedidos (auto) | Auto |
| `lastOrderDate` | fecha | Última fecha de pedido (auto) | Auto |

#### Vista de Perfil Detallado
Cuando se ve el perfil de un cliente, se muestra:
- **Estadísticas**:
  - Total de pedidos
  - Total invertido (suma de todos sus pedidos)
  - Ticket promedio
  - Última visita
- **Notas y preferencias** del cliente
- **Historial completo de pedidos** con estado y monto
- **Productos preferidos** (los más comprados)
- **Mensajes rápidos de WhatsApp** predefinidos

#### Filtros y Ordenamiento
- `search`: Búsqueda por nombre o celular
- `sort`: Ordenar por:
  - Número de cliente
  - Nombre
  - Total de pedidos
  - Última compra
  - Total invertido

#### Funcionalidades
- ✅ Edición de datos del cliente
- ✅ Autoguardado al editar
- ✅ Ver historial completo de pedidos
- ✅ Mensajes predefinidos de WhatsApp
- ✅ Botón para crear nuevo pedido
- ✅ Eliminación con advertencia
- ✅ Estadísticas en tiempo real

---

### 5️⃣ **QUOTES MANAGER (Gestor de Presupuestos)**

#### Campos del Presupuesto
| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `customerName` | texto autocompletar | Nombre del cliente | Sí |
| `customerPhone` | texto | Teléfono del cliente | No |
| `date` | fecha | Fecha de emisión (auto) | Auto |
| `notes` | textarea | Observaciones adicionales | No |

#### Items del Presupuesto
Cada presupuesto puede tener múltiples ítems:
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `quantity` | número | Cantidad de unidades |
| `description` | texto | Descripción del producto/servicio |
| `unitPrice` | número | Precio unitario |
| `total` | calculado | quantity × unitPrice |

#### Funcionalidades
- ✅ Agregar/eliminar ítems dinámicamente
- ✅ Cálculo automático de totales
- ✅ Autocompletar cliente desde base de datos
- ✅ **Imprimir presupuesto** (formato profesional con logo)
- ✅ **Compartir por WhatsApp** (mensaje formateado)
- ✅ Editar presupuesto existente
- ✅ Eliminar con confirmación
- ✅ Búsqueda por cliente o fecha

#### Formato de Impresión
El presupuesto impreso incluye:
- Logo de Andy Sublimados
- Datos de contacto del negocio
- Fecha de emisión
- Datos del cliente
- Tabla de ítems con cantidades y precios
- Total destacado
- Observaciones
- Validez del presupuesto (15 días)

---

### 6️⃣ **CASH RECONCILIATION (Arqueo de Caja)**

#### Denominaciones Soportadas
Billetes argentinos:
- $20,000
- $10,000
- $2,000
- $1,000
- $500
- $200
- $100
- $50
- $20
- $10
- $5

#### Inputs
Por cada denominación:
- **Cantidad de billetes** (número)
- **Total calculado** (automático = cantidad × denominación)

#### Resumen en Tiempo Real
- Lista de denominaciones con cantidad > 0
- **Total general** de efectivo contado
- Botón para imprimir arqueo

#### Funcionalidades
- ✅ Cálculo automático por denominación
- ✅ Total general en tiempo real
- ✅ Limpiar todo el arqueo (con confirmación)
- ✅ Imprimir reporte de arqueo
- ✅ Consejo: Comparar con registros de caja

---

### 7️⃣ **DEBTOR CUSTOMERS (Clientes Deudores)**

Vista de **solo lectura** que analiza pedidos con saldo pendiente.

#### Datos Mostrados
Por cada cliente deudor:
| Campo | Descripción |
|-------|-------------|
| `name` | Nombre del cliente |
| `whatsapp` | WhatsApp (con botón para contactar) |
| `totalDebt` | Suma de todos los saldos pendientes |
| `ordersCount` | Cantidad de pedidos con deuda |
| `oldestOrderDate` | Fecha del pedido más antiguo con deuda |
| `lastOrderDate` | Fecha del último pedido |
| Días desde deuda | Días transcurridos desde el pedido más antiguo |

#### Tarjetas de Resumen
1. **Clientes con Deuda** - Cantidad total de deudores
2. **Total por Cobrar** - Suma total de todas las deudas

#### Funcionalidades
- ✅ Ordenado por monto de deuda (mayor a menor)
- ✅ WhatsApp directo con mensaje predefinido
- ✅ Navegar a agenda para cobrar
- ✅ Cálculo automático desde orders

---

## 🎨 ENUMS Y VALORES CONSTANTES

### PaymentMethod (Métodos de Pago)
```typescript
'Efectivo Físico'
'Dinero Digital'
'Transferencia'
'Tarjeta'
'Mercado Pago'
```

### OrderStatus (Estados de Pedido)
```typescript
'pedido'     // Pendiente
'proceso'    // En Proceso
'terminado'  // Terminado
```

### MovementType (Tipos de Movimiento)
```typescript
'Ingreso'
'Egreso'
```

### CashCategory (Categorías de Caja)
```typescript
'Modista'
'Transporte'
'Empresa'
'Varios'
```

### ContactMethod (Métodos de Contacto)
```typescript
'WhatsApp'
'Instagram'
'Facebook'
'Presencial'
```

### ProductCategory (Categorías de Productos)
```typescript
'Tela'
'Ceramica'
'Vidrio'
'metal'
'papel'
'polymer'
```

---

## 🔄 FLUJOS DE NEGOCIO PRINCIPALES

### Flujo 1: Crear Nuevo Pedido
1. Cliente llama o contacta
2. Ir a **Agenda** → **Nuevo Trabajo**
3. Buscar/crear cliente (autocompletar)
4. Completar datos del pedido
5. Vincular productos (descuenta stock automáticamente)
6. Registrar seña (crea movimiento de caja automático)
7. Guardar → Aparece en vista kanban en columna "Pendiente"

### Flujo 2: Procesar Pedido
1. En vista **Kanban**, mover pedido a "En Proceso"
2. Trabajar en el pedido
3. Al terminar, mover a "Terminado"
4. Cuando el cliente retira:
   - Marcar como "Entregado"
   - Si tiene saldo: Marcar "Saldo Cobrado" (crea movimiento de caja)

### Flujo 3: Control de Stock
1. Ver **Insumos**
2. Filtrar por "Productos Críticos" (stock <= mínimo)
3. Ver lista de productos a reponer
4. Contactar proveedor
5. Actualizar stock al recibir mercadería

### Flujo 4: Cobro de Deudas
1. Ver **Clientes Deudores**
2. Ordenados por monto (mayor primero)
3. Click en WhatsApp → Envía mensaje automático
4. Al cobrar:
   - Ir a **Agenda**
   - Buscar pedido del cliente
   - Marcar "Saldo Cobrado" + método de pago

### Flujo 5: Arqueo de Caja Diario
1. Al final del día, ir a **Arqueo de Caja**
2. Contar billetes físicos por denominación
3. Ingresar cantidades
4. El sistema calcula total
5. Comparar con balance en **Caja**
6. Imprimir reporte si es necesario

---

## 📊 RELACIONES ENTRE DATOS

```
customers (1) ──→ (N) orders
customers (1) ──→ (N) quotes

orders (1) ──→ (N) order_products
products (1) ──→ (N) order_products

orders → genera → cash_movements (cuando hay seña o cobro final)

orders (remainingPaid = false) → vista calculada → customer_debtors
```

---

## 🎯 REGLAS DE NEGOCIO IMPORTANTES

### Stock de Productos
- ✅ **Al crear pedido**: Si se vinculan productos, el stock se descuenta automáticamente
- ✅ **Stock mínimo**: Por defecto es 3, pero se puede configurar por producto
- ✅ **Alerta crítica**: Badge rojo cuando stock <= minStock

### Movimientos de Caja Automáticos
- ✅ **Seña del pedido**: Al crear pedido con depositAmount > 0
  - Descripción: "Seña: [Nombre Cliente]"
  - Tipo: Ingreso
  - Categoría: Varios
- ✅ **Cobro final**: Al marcar remainingPaid = true
  - Descripción: "Cobro Final: [Nombre Cliente]"
  - Tipo: Ingreso
  - Categoría: Modista

### Advertencias de Deuda
- ⚠️ Al marcar pedido como "Entregado" con saldo pendiente → Modal de confirmación
- ⚠️ Al guardar pedido nuevo marcado como entregado con saldo → Modal de confirmación

### Clientes
- ✅ **Auto-incremento**: customerNumber se asigna automáticamente
- ✅ **Actualización automática**: totalOrders y lastOrderDate se actualizan al crear/editar pedidos
- ✅ **Integridad histórica**: Al editar nombre de cliente, los pedidos antiguos mantienen el nombre original

---

## 🔐 CONSIDERACIONES DE SEGURIDAD PARA SUPABASE

### Autenticación
- Usar **Supabase Auth** para login con email
- Rol por defecto: `admin`
- Habilitar **Row Level Security (RLS)** en todas las tablas

### Políticas RLS Recomendadas
```sql
-- Solo usuarios autenticados pueden acceder
CREATE POLICY "authenticated_users_only"
ON tabla_name FOR ALL
USING (auth.role() = 'authenticated');
```

---

## 📝 NOTAS TÉCNICAS

### Autoguardado
Varios componentes implementan **autoguardado con debounce** (500ms):
- Inventory (al editar)
- OrdersAgenda (al editar)
- CustomersList (al editar)
- QuotesManager (al editar)

### Formato de Fechas
- **deliveryDate**: Formato 'YYYY-MM-DD' (input date)
- **createdAt**: ISO timestamp con zona horaria
- **movement_date**: ISO timestamp

### IDs
- Todos los IDs son generados con `Date.now().toString()`
- En Supabase se recomienda usar **UUID** (ya configurado en el schema)

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

1. ✅ Migrar datos existentes de JSON a Supabase
2. ✅ Implementar autenticación con Supabase Auth
3. ✅ Configurar políticas RLS según roles
4. ✅ Adaptar llamadas a API para usar Supabase client
5. ✅ Implementar sincronización en tiempo real (opcional)
6. ✅ Backup automático de Supabase
7. ✅ Dashboard de métricas (ya existe ChartsView)

---

## 📞 CONTACTO DEL NEGOCIO

**Andy Sublimados**
- 📍 Bolivar 1726 – Tres Arroyos
- ☎️ Tel: 2983-347954
- 📱 Instagram: @andysublimados

---

**Documento generado automáticamente - Fecha:** 2026-04-04
