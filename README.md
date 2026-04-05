# 🎨 Andy Sublimados - Sistema de Gestión Integral

Sistema completo de gestión para negocios de sublimación y productos personalizados. Desarrollado con React, TypeScript y Supabase.

---

## 📋 Descripción

**Andy Sublimados** es una aplicación web moderna y profesional diseñada para gestionar todas las operaciones de un negocio de sublimación:

- 📦 **Gestión de Pedidos**: Sistema completo de órdenes con múltiples vistas (lista, calendario, kanban)
- 👥 **Clientes**: Base de datos de clientes con historial de compras
- 📊 **Inventario**: Control de stock con alertas de productos críticos
- 💰 **Caja**: Seguimiento de ingresos y egresos con múltiples métodos de pago
- 📈 **Reportes y Gráficos**: Visualización de ventas, gastos y tendencias
- 🧮 **Calculadora de Precios**: Herramienta para calcular costos de producción
- 🤖 **Asistente IA**: Integración con Gemini para consultas rápidas

---

## ✨ Características Principales

- ✅ Autenticación segura con Supabase Auth
- ✅ CRUD completo de pedidos, productos, clientes y proveedores
- ✅ Formulario multi-paso para creación de pedidos
- ✅ Auto-creación de clientes desde pedidos
- ✅ Deducción automática de stock al crear pedidos
- ✅ Registro automático de movimientos de caja
- ✅ Múltiples métodos de pago (Efectivo, Transferencia, MercadoPago, etc.)
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Vistas de calendario y kanban para pedidos
- ✅ Sistema de presupuestos/cotizaciones
- ✅ Responsive design (mobile-first)
- ✅ Animaciones fluidas con Framer Motion
- ✅ Temas y estilos con Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Librería de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router DOM** - Navegación y routing
- **Tailwind CSS** - Estilos y diseño
- **Framer Motion** - Animaciones
- **Recharts** - Gráficos y visualizaciones
- **Lucide React** - Iconos

### Backend & Database
- **Supabase** - Backend as a Service (PostgreSQL)
- **Supabase Auth** - Autenticación
- **Supabase Storage** - Almacenamiento de archivos

### AI
- **Google Gemini API** - Asistente virtual

---

## 🏗️ Arquitectura

Este proyecto sigue una **Layered Architecture** (Arquitectura en Capas) con organización por features, inspirada en Clean Architecture.

### Flujo de Datos

```
┌─────────────────────────────────┐
│  Presentation Layer             │  UI y Rutas
│  - pages/                       │
│  - components/                  │
│  - features/                    │
└────────────┬────────────────────┘
             │ usa
┌────────────▼────────────────────┐
│  Business Logic Layer           │  Lógica reutilizable
│  - hooks/                       │
└────────────┬────────────────────┘
             │ usa
┌────────────▼────────────────────┐
│  Data Access Layer              │  Comunicación con DB
│  - services/                    │
└────────────┬────────────────────┘
             │ usa
┌────────────▼────────────────────┐
│  External Services              │  Base de datos
│  - Supabase (PostgreSQL)        │
└─────────────────────────────────┘
```

### Principios

✅ **Separación de responsabilidades** - Cada capa tiene un propósito único
✅ **Dependencias hacia adentro** - UI depende de Services, nunca al revés
✅ **Reutilización** - Hooks y services compartidos
✅ **Testeable** - Cada capa se puede testear independientemente
✅ **Escalable** - Fácil agregar nuevas features

---

## 📁 Estructura de Carpetas

```
src/
├── pages/               # 📄 Conectores de React Router (livianos)
│   ├── Dashboard/       #    - Wrappers para cada ruta
│   ├── Orders/          #    - Manejan navegación
│   ├── Inventory/       #    - Pasan props a features
│   └── ...              #    (~20-50 líneas cada uno)
│
├── features/            # 🎯 Lógica de negocio por funcionalidad
│   ├── Dashboard/       #    - Componentes con lógica compleja
│   │   └── Dashboard.tsx     (~670 líneas)
│   ├── Orders/          #    - Específicos del dominio
│   │   ├── OrdersAgenda.tsx  (~960 líneas)
│   │   ├── NewOrderModal.tsx
│   │   └── ProductSelectorModal.tsx
│   ├── Customers/
│   ├── CashFlow/
│   └── ...
│
├── components/          # 🧩 Componentes presentacionales reutilizables
│   ├── ui/              #    - Sin lógica de negocio
│   │   ├── Toast.tsx    #    - Reutilizables en toda la app
│   │   ├── Modal.tsx    #    - Puros y predecibles
│   │   └── Button.tsx
│   ├── layout/
│   │   ├── Header/
│   │   └── Logo/
│   └── Dashboard/
│       ├── StatCard.tsx
│       ├── ActionItem.tsx
│       └── ...
│
├── hooks/               # 🪝 Lógica reutilizable con estado
│   ├── useOrders/       #    - Custom hooks
│   │   └── useOrders.ts #    - Gestión de estado complejo
│   ├── useToast.ts      #    - Lógica compartida
│   └── ...
│
├── services/            # 🔌 Capa de datos (comunicación con Supabase)
│   ├── supabase/        #    - CRUD operations
│   │   ├── orders/      #    - Queries y mutations
│   │   ├── customers/   #    - Tipo-safe
│   │   ├── products/    #    - Reutilizable
│   │   └── ...
│   ├── auth.ts          #    - Autenticación
│   └── index.ts         #    - fetchData() inicial
│
├── types/               # 📝 Definiciones de TypeScript
│   ├── interfaces.ts    #    - Tipos de negocio
│   ├── enums.ts         #    - Enumeraciones
│   └── index.ts
│
└── utils/               # 🛠️ Utilidades y helpers
    ├── navItems.ts      #    - Funciones puras
    └── ...              #    - Sin estado ni efectos
```

---

## 📦 Responsabilidades por Carpeta

### `pages/` - Conectores de Routing
**Propósito**: Conectar rutas de React Router con features

**Características**:
- Muy livianos (20-50 líneas)
- Solo manejan navegación
- Pasan props a features
- No contienen lógica de negocio

**Ejemplo**:
```typescript
// pages/Orders/OrdersPage.tsx
const OrdersPage: React.FC<Props> = (props) => {
  return <OrdersAgenda {...props} />;
};
```

---

### `features/` - Lógica de Negocio
**Propósito**: Componentes específicos de cada funcionalidad del negocio

**Características**:
- Contienen lógica compleja (200-1000 líneas)
- Específicos del dominio (pedidos, inventario, etc.)
- Usan hooks y services
- Tienen estado local
- Manejan interacciones del usuario

**Ejemplo**:
```typescript
// features/Orders/OrdersAgenda.tsx
// - Gestión completa de pedidos
// - Múltiples vistas (lista/calendario/kanban)
// - Filtros y búsquedas
// - Modales de creación/edición
// ~960 líneas de lógica
```

---

### `components/` - Componentes Reutilizables
**Propósito**: UI components sin lógica de negocio

**Características**:
- Presentacionales (solo UI)
- Reutilizables en múltiples features
- Reciben datos por props
- No hacen fetch de datos
- Puros y predecibles

**Ejemplo**:
```typescript
// components/Dashboard/StatCard.tsx
// - Tarjeta de estadística visual
// - Recibe datos por props
// - Sin lógica de negocio
// ~50 líneas
```

---

### `hooks/` - Lógica Reutilizable
**Propósito**: Custom hooks con lógica compartida

**Características**:
- Encapsulan lógica compleja
- Reutilizables en múltiples componentes
- Manejan estado y efectos
- Usan services para datos

**Ejemplo**:
```typescript
// hooks/useOrders/useOrders.ts
// - Gestión de estado de pedidos
// - Auto-creación de clientes
// - Deducción de stock
// - Validaciones
// ~350 líneas
```

---

### `services/` - Capa de Datos
**Propósito**: Comunicación con Supabase (base de datos)

**Características**:
- CRUD completo (Create, Read, Update, Delete)
- Queries tipo-safe
- Centraliza acceso a datos
- Independiente de UI
- Fácil de testear y mockear

**Ejemplo**:
```typescript
// services/supabase/orders/orders.service.ts
export const ordersService = {
  getAll: () => supabase.from('orders').select('*'),
  create: (data) => supabase.from('orders').insert(data),
  update: (id, data) => supabase.from('orders').update(data).eq('id', id),
  delete: (id) => supabase.from('orders').delete().eq('id', id)
};
```

---

### `types/` - Definiciones TypeScript
**Propósito**: Tipos e interfaces del negocio

**Características**:
- Tipos compartidos
- Interfaces de datos
- Enums y constantes
- Tipo-safe en toda la app

---

### `utils/` - Utilidades
**Propósito**: Funciones helper puras

**Características**:
- Funciones sin estado
- Reutilizables
- Sin efectos secundarios
- Fáciles de testear

---

## 🔄 Proceso de Refactorización

### Estado Inicial
- Sistema con navegación por tabs
- Lógica duplicada en múltiples componentes
- Modal de pedidos antiguo (~320 líneas)
- Componentes monolíticos (>1200 líneas)

### Refactorización Realizada

#### 1️⃣ Migración a React Router
- ✅ Instalación de `react-router-dom`
- ✅ Creación de estructura `pages/` con carpetas individuales
- ✅ Actualización de `App.tsx` (tab-based → routes)
- ✅ Actualización de `Header.tsx` (buttons → Link components)
- ✅ Navegación por URL en vez de estado local

#### 2️⃣ Separación de Componentes
- ✅ Dashboard: Extracción de 5 componentes a `components/Dashboard/`
  - `LogoIcon.tsx`, `ActionItem.tsx`, `PipelineStep.tsx`, `StatCard.tsx`, `CustomTooltip.tsx`
- ✅ Reducción de ~757 a ~670 líneas en `Dashboard.tsx`

#### 3️⃣ Nuevo Sistema de Pedidos
- ✅ Formulario multi-paso con `NewOrderModal.tsx` (4 pasos)
- ✅ Modal de selección de productos `ProductSelectorModal.tsx`
- ✅ Hook centralizado `useOrders` con toda la lógica
- ✅ Eliminación de código duplicado
- ✅ Reducción de ~1271 a ~960 líneas en `OrdersAgenda.tsx`

#### 4️⃣ Limpieza de Código
- ✅ Fix de 42 problemas de TypeScript
- ✅ Fix de warnings de Tailwind CSS (clases no canónicas)
- ✅ Instalación de `@types/react`
- ✅ Eliminación de props `md:size` en iconos Lucide
- ✅ Build y lint pasando sin errores

#### 5️⃣ Arquitectura en Capas
- ✅ Separación clara: Pages → Features → Hooks → Services
- ✅ Supabase queries solo en `services/`
- ✅ Lógica de negocio en `features/` y `hooks/`
- ✅ UI reutilizable en `components/`

---

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 18+
- Cuenta de Supabase
- API Key de Google Gemini (opcional, para el asistente IA)

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd andy-sublimados
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Ejecutar migraciones de Supabase
Ejecutar el script SQL de migración en tu proyecto de Supabase (ver `supabase-schema.sql` o archivos de seed).

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 📜 Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Ejecutar ESLint (type-check)
```

---

## 🗄️ Base de Datos (Supabase)

### Tablas Principales
- `customers` - Clientes
- `products` - Inventario de productos
- `orders` - Pedidos
- `order_products` - Relación N:N entre pedidos y productos
- `cash_movements` - Movimientos de caja
- `suppliers` - Proveedores
- `quotes` - Presupuestos/cotizaciones
- `quote_items` - Items de presupuestos

### Row Level Security (RLS)
Todas las tablas tienen políticas RLS habilitadas para seguridad.

---

## 🎨 Características de UI/UX

- **Responsive Design**: Mobile-first, optimizado para todos los dispositivos
- **Animaciones**: Transiciones fluidas con Framer Motion
- **Tema Moderno**: Gradientes, sombras y bordes redondeados
- **Feedback Visual**: Toasts, loading states, confirmaciones
- **Navegación Intuitiva**: Header con dropdowns, bottom nav mobile
- **Accesibilidad**: Contraste adecuado, texto legible

---

## 📈 Próximas Mejoras

- [ ] Tests unitarios (Vitest + React Testing Library)
- [ ] Tests E2E (Playwright)
- [ ] Exportación de reportes a PDF
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Optimización de imágenes con Cloudinary
- [ ] Sistema de roles y permisos

---

## 📄 Licencia

Este proyecto es privado y está protegido por derechos de autor.

---

## 👨‍💻 Desarrollado con

- ❤️ React + TypeScript
- ⚡ Vite
- 🎨 Tailwind CSS
- 🔥 Supabase
- 🤖 Google Gemini AI

---

**Andy Sublimados** - Sistema de gestión profesional para negocios de sublimación 🎨
