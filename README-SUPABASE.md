# 🚀 Andy Sublimados - Migración a Supabase

## 📦 Archivos Generados

### 1. `supabase-schema.sql` ⭐
**Script principal de base de datos**
- Contiene TODA la estructura de la base de datos
- Incluye tablas, enums, índices, triggers y políticas RLS
- Documentación completa en español
- Listo para ejecutar en Supabase

### 2. `ANALISIS-PROYECTO.md` 📊
**Documentación completa del proyecto**
- Análisis detallado de cada componente
- Todos los inputs, selectores y campos
- Flujos de negocio
- Reglas de validación
- Relaciones entre datos

### 3. `EJEMPLOS-DATOS.sql` 💾
**Datos de ejemplo**
- Datos realistas para probar la base de datos
- Usuarios, clientes, productos, pedidos
- Movimientos de caja y presupuestos
- Escenarios completos (deudores, stock crítico, etc.)

---

## 🎯 CÓMO USAR ESTOS ARCHIVOS

### Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota las credenciales (URL del proyecto y API keys)

### Paso 2: Ejecutar el Schema

1. En Supabase, ve a **SQL Editor**
2. Crea un nuevo query
3. Copia y pega el contenido completo de `supabase-schema.sql`
4. Click en **Run** o presiona `Ctrl+Enter`
5. Espera a que termine (debería tardar ~10-15 segundos)
6. ✅ ¡Listo! Todas las tablas están creadas

### Paso 3: Cargar Datos de Ejemplo (Opcional)

1. En el mismo SQL Editor
2. Crea otro query
3. Copia y pega el contenido de `EJEMPLOS-DATOS.sql`
4. Click en **Run**
5. ✅ Ahora tienes datos de ejemplo para probar

### Paso 4: Verificar Instalación

Ejecuta estas consultas para verificar:

```sql
-- Ver todas las tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver cantidad de registros (si cargaste ejemplos)
SELECT
    'customers' as tabla, COUNT(*) FROM customers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'cash_movements', COUNT(*) FROM cash_movements
UNION ALL
SELECT 'quotes', COUNT(*) FROM quotes;

-- Ver balance de caja
SELECT * FROM monthly_financial_summary;

-- Ver productos con stock crítico
SELECT * FROM products_critical_stock;

-- Ver clientes deudores
SELECT * FROM customer_debtors;
```

---

## 🔐 CONFIGURAR AUTENTICACIÓN

### Paso 1: Habilitar Email Auth

1. En Supabase, ve a **Authentication** → **Providers**
2. Habilita **Email** (viene habilitado por defecto)
3. Configura las URLs de redirección si es necesario

### Paso 2: Crear Usuario Administrador

Opción A - Desde SQL:
```sql
-- El usuario ya se crea automáticamente en el schema
-- Solo necesitas crear el usuario de auth de Supabase
```

Opción B - Desde UI:
1. Ve a **Authentication** → **Users**
2. Click en **Add user** → **Create new user**
3. Email: `admin@andysublimados.com`
4. Password: (tu contraseña segura)
5. Click **Create user**

### Paso 3: Vincular Usuario Auth con Perfil

```sql
-- Actualizar user_profiles con el ID de auth.users
UPDATE user_profiles
SET id = (SELECT id FROM auth.users WHERE email = 'admin@andysublimados.com')
WHERE email = 'admin@andysublimados.com';
```

---

## 🔌 CONECTAR DESDE LA APLICACIÓN

### Instalar Cliente de Supabase

```bash
npm install @supabase/supabase-js
```

### Configurar Cliente

Crea un archivo `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'TU_SUPABASE_URL'
const supabaseKey = 'TU_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Ejemplo de Uso

```typescript
// Obtener productos
const { data: products, error } = await supabase
  .from('products')
  .select('*')
  .order('name')

// Crear pedido
const { data: order, error } = await supabase
  .from('orders')
  .insert({
    customer_name: 'Juan Pérez',
    description: 'Remeras personalizadas',
    delivery_date: '2026-04-15',
    total_amount: 15000,
    status: 'pedido'
  })
  .select()
  .single()

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@andysublimados.com',
  password: 'tu-contraseña'
})
```

---

## 📊 ESTRUCTURA DE LA BASE DE DATOS

### Tablas Principales

| Tabla | Descripción | Registros Ejemplo |
|-------|-------------|-------------------|
| `user_profiles` | Usuarios del sistema | 2 |
| `customers` | Clientes del negocio | 5 |
| `suppliers` | Proveedores | 4 |
| `products` | Inventario de insumos | 15 |
| `orders` | Pedidos de clientes | 5 |
| `order_products` | Productos de cada pedido | Variable |
| `cash_movements` | Movimientos de caja | 13 |
| `quotes` | Presupuestos | 3 |
| `quote_items` | Items de presupuestos | Variable |

### Enums Importantes

```typescript
// Métodos de Pago
'Efectivo Físico' | 'Dinero Digital' | 'Transferencia' | 'Tarjeta' | 'Mercado Pago'

// Estados de Pedido
'pedido' | 'proceso' | 'terminado'

// Tipos de Movimiento
'Ingreso' | 'Egreso'

// Categorías de Caja
'Modista' | 'Transporte' | 'Empresa' | 'Varios'

// Métodos de Contacto
'WhatsApp' | 'Instagram' | 'Facebook' | 'Presencial'

// Categorías de Productos
'Tela' | 'Ceramica' | 'Vidrio' | 'metal' | 'papel' | 'polymer'
```

### Vistas Disponibles

1. **`products_critical_stock`**
   - Productos que necesitan reposición
   - Ordenados por urgencia

2. **`customer_debtors`**
   - Clientes con saldos pendientes
   - Incluye monto total y cantidad de pedidos

3. **`monthly_financial_summary`**
   - Resumen mensual de ingresos/egresos
   - Balance neto por mes

---

## 🔄 MIGRACIÓN DE DATOS EXISTENTES

Si ya tienes datos en JSON, puedes migrarlos:

### Paso 1: Exportar JSON Actual

Desde la app actual:
1. Click en **Backup** en el menú
2. Descarga el archivo JSON

### Paso 2: Convertir a SQL

Usa un script de migración:

```javascript
// migrate.js
const fs = require('fs')
const data = JSON.parse(fs.readFileSync('backup.json', 'utf8'))

// Generar INSERTs para customers
data.customers.forEach(c => {
  console.log(`INSERT INTO customers (name, whatsapp, notes, total_orders, last_order_date) VALUES ('${c.name}', '${c.whatsapp}', '${c.notes}', ${c.totalOrders}, '${c.lastOrderDate}');`)
})

// Repetir para products, orders, etc.
```

### Paso 3: Ejecutar en Supabase

1. Copia el SQL generado
2. Ejecútalo en SQL Editor
3. Verifica que se hayan creado correctamente

---

## 🛡️ SEGURIDAD Y MEJORES PRÁCTICAS

### Row Level Security (RLS)

Las políticas ya están configuradas para:
- ✅ Solo usuarios autenticados pueden acceder a los datos
- ✅ Todos los usuarios ven todos los datos (por ahora)
- ⚠️ Ajusta según tus necesidades de seguridad

### Recomendaciones

1. **No uses la `service_role` key en el cliente**
   - Solo usa `anon` key o `authenticated` key
   - La service_role bypasea RLS

2. **Habilita 2FA para usuarios admin**
   - Ve a **Authentication** → **Providers** → **Phone Auth**

3. **Configura backups automáticos**
   - Supabase hace backups automáticos
   - También puedes exportar manualmente

4. **Monitorea el uso**
   - Ve a **Project Settings** → **Billing**
   - Plan gratuito: 500MB DB, 2GB bandwidth

---

## 📈 PRÓXIMOS PASOS

### Funcionalidades a Implementar

1. **Tiempo Real**
```typescript
// Suscribirse a cambios en pedidos
supabase
  .channel('orders-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('Pedido actualizado:', payload)
    }
  )
  .subscribe()
```

2. **Storage para Imágenes**
```typescript
// Subir imagen de producto
const { data, error } = await supabase.storage
  .from('product-images')
  .upload('public/remera-1.jpg', file)
```

3. **Functions (Edge Functions)**
   - Enviar emails automáticos
   - Notificaciones de WhatsApp
   - Reportes automáticos

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "relation does not exist"
**Solución**: Ejecuta `supabase-schema.sql` completo

### Error: "permission denied"
**Solución**: Verifica que RLS esté configurado correctamente

### Error: "duplicate key value"
**Solución**: Los IDs ya existen, elimina y vuelve a cargar

### La autenticación no funciona
**Solución**:
1. Verifica que el email esté en `auth.users`
2. Verifica que el ID coincida en `user_profiles`

---

## 📞 SOPORTE

- 📧 Documentación de Supabase: [https://supabase.com/docs](https://supabase.com/docs)
- 💬 Discord de Supabase: [https://discord.supabase.com](https://discord.supabase.com)
- 🐛 Issues: Crea un issue en el repositorio

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear proyecto en Supabase
- [ ] Ejecutar `supabase-schema.sql`
- [ ] Cargar `EJEMPLOS-DATOS.sql` (opcional)
- [ ] Crear usuario admin en Auth
- [ ] Vincular usuario con `user_profiles`
- [ ] Obtener credenciales (URL + API key)
- [ ] Instalar `@supabase/supabase-js`
- [ ] Configurar cliente en la app
- [ ] Migrar datos existentes (si aplica)
- [ ] Probar autenticación
- [ ] Probar consultas básicas
- [ ] Configurar RLS según necesidades
- [ ] Implementar tiempo real (opcional)
- [ ] Configurar backups
- [ ] ¡Listo! 🎉

---

**Documento creado:** 2026-04-04
**Versión del Schema:** 1.0
**Compatibilidad:** PostgreSQL 14+ (Supabase)
