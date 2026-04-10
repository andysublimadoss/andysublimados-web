
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, CashMovement, Product, MovementType, Supplier, PaymentMethod, TabType } from '@/types';
import {
  AlertTriangle, Package, Wallet, Star, ArrowRight, DollarSign, HandCoins, Zap, ArrowUpRight, ShoppingCart, Users, Clock, CreditCard, Plus, TrendingUp, TrendingDown, Calendar, ArrowDownRight, CheckCircle, Filter, ChevronDown
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ComposedChart, Bar } from 'recharts';
import { ActionItem, PipelineStep, CustomTooltip } from '@/components/Dashboard';

interface DashboardProps {
  orders: Order[];
  movements: CashMovement[];
  products: Product[];
  suppliers: Supplier[];
  onManageStock: (productName?: string) => void;
  onNavigate: (tab: TabType) => void;
}


const Dashboard: React.FC<DashboardProps> = ({ orders, movements, products, suppliers, onManageStock, onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDaysRemaining = () => {
    const now = currentTime;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return lastDay - now.getDate();
  };

  // Filter date range logic
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    if (filterPeriod === 'week') {
      // Últimos 7 días hasta hoy
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (filterPeriod === 'month') {
      // Últimos 30 días hasta hoy
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    } else if (filterPeriod === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
    } else {
      // Default to last 30 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Filter movements by date range
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const movementDate = new Date(m.date);
      return movementDate >= startDate && movementDate <= endDate;
    });
  }, [movements, startDate, endDate]);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }, [orders, startDate, endDate]);

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  // Cálculo de saldos separados (usando datos filtrados)
  const cashBalance = filteredMovements
    .filter(m => m.method === PaymentMethod.EFECTIVO)
    .reduce((acc, m) => m.type === MovementType.INGRESO ? acc + m.amount : acc - m.amount, 0);

  const digitalBalance = filteredMovements
    .filter(m => m.method !== PaymentMethod.EFECTIVO)
    .reduce((acc, m) => m.type === MovementType.INGRESO ? acc + m.amount : acc - m.amount, 0);

  // Total de ingresos y egresos según filtro
  const totalIncome = filteredMovements
    .filter(m => m.type === MovementType.INGRESO)
    .reduce((acc, m) => acc + m.amount, 0);

  const totalExpenses = filteredMovements
    .filter(m => m.type === MovementType.EGRESO)
    .reduce((acc, m) => acc + m.amount, 0);

  // Balance neto (ganancia neta)
  const netBalance = totalIncome - totalExpenses;

  const pendingOrdersCount = orders.filter(o => o.status !== 'terminado').length;

  const totalPendingBalance = filteredOrders
    .filter(o => !o.remainingPaid)
    .reduce((acc, o) => acc + (o.remainingAmount || 0), 0);
  
  const lowStockProducts = products.filter(p => p.stock <= (p.minStock || 3));
  
  const lowStockProductsWithImpact = lowStockProducts.map(p => {
    const affectedOrders = orders.filter(o => 
      (o.status === 'pedido' || o.status === 'proceso') && 
      o.linkedProducts?.some(lp => lp.name === p.name)
    ).length;
    return { ...p, affectedOrders };
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const deliveriesTodayCount = orders.filter(o => o.deliveryDate === todayStr && !o.isDelivered).length;
  const completedOrdersFiltered = filteredOrders.filter(o => o.status === 'terminado').length;
  const totalOrdersFiltered = filteredOrders.length;

  const efficiency = totalOrdersFiltered > 0 ? Math.round((completedOrdersFiltered / totalOrdersFiltered) * 100) : 0;

  // Pipeline Data
  const pipelineData = {
    pedido: orders.filter(o => o.status === 'pedido' && !o.isDelivered).length,
    proceso: orders.filter(o => o.status === 'proceso' && !o.isDelivered).length,
    terminado: orders.filter(o => o.status === 'terminado' && !o.isDelivered).length,
    entregado: orders.filter(o => o.isDelivered).length
  };

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const chartData = useMemo(() => {
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Si hay más de 30 días, agrupar por mes
    if (daysDiff > 30) {
      // Generar todos los meses en el rango
      const months: string[] = [];
      const currentDate = new Date(startDate);
      const end = new Date(endDate);

      while (currentDate <= end) {
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        if (!months.includes(monthKey)) {
          months.push(monthKey);
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Inicializar todos los meses con 0
      const monthlyData: { [key: string]: number } = {};
      months.forEach(m => monthlyData[m] = 0);

      // Sumar los ingresos
      filteredMovements.forEach(m => {
        const monthKey = m.date.substring(0, 7); // YYYY-MM
        if (monthlyData[monthKey] !== undefined) {
          const income = m.type === MovementType.INGRESO ? m.amount : 0;
          monthlyData[monthKey] += income;
        }
      });

      return months.map(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-AR', { month: 'short' });
        return {
          name: monthName,
          total: monthlyData[monthKey]
        };
      });
    } else {
      // Mostrar por día (30 días o menos)
      const dates: string[] = [];
      const totalDays = daysDiff + 1;

      for (let i = 0; i < totalDays; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }

      return dates.map(date => {
        const dayMovements = filteredMovements.filter(m => m.date.split('T')[0] === date);
        const income = dayMovements.filter(m => m.type === MovementType.INGRESO).reduce((acc, m) => acc + m.amount, 0);
        const dayStr = new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
        return { name: dayStr, total: income };
      });
    }
  }, [filteredMovements, startDate, endDate]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buen día!';
    if (hour < 20) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  // Calculate trend for cash flow
  const getTrend = () => {
    if (chartData.length < 2) return { percentage: 0, isUp: true };
    const mid = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, mid).reduce((s, d) => s + d.total, 0);
    const secondHalf = chartData.slice(mid).reduce((s, d) => s + d.total, 0);
    if (firstHalf === 0) return { percentage: secondHalf > 0 ? 100 : 0, isUp: true };
    const change = ((secondHalf - firstHalf) / firstHalf) * 100;
    return { percentage: Math.abs(Math.round(change)), isUp: change >= 0 };
  };

  const trend = getTrend();

  // Custom tooltip component

  const nextDelivery = orders
    .filter(o => o.deliveryDate === todayStr && !o.isDelivered)
    .sort((a, b) => a.customerName.localeCompare(b.customerName))[0];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-10 max-w-400 mx-auto">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        
        {/* Main Financial Overview (Large) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="md:col-span-12 lg:col-span-12 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-125"
        >
          {/* Header with Amount and Filters */}
          <div className="mb-8 flex flex-col items-center justify-center text-center relative">
            {/* Welcome text positioned top left */}
            <div className="absolute top-0 left-0">
              <h3 className="text-2xl font-normal text-black tracking-tight">
                Bienvenida <span className="font-semibold">Andy</span>
              </h3>
            </div>

            {/* Filters and Time/Date positioned top right */}
            <div className="absolute top-0 right-0 flex flex-col items-end gap-3">
              {/* Time/Date */}
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <div className="flex flex-col items-end px-3 border-r border-slate-200">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Tiempo Real</span>
                  <span className="text-sm font-medium text-slate-700 tabular-nums">
                    {currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="flex flex-col items-start px-3">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Fecha Actual</span>
                  <span className="text-sm font-medium text-slate-700 uppercase">
                    {currentTime.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-slate-200">
                <button
                  onClick={() => setFilterPeriod('week')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    filterPeriod === 'week'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setFilterPeriod('month')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    filterPeriod === 'month'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Mes
                </button>
                <button
                  onClick={() => setFilterPeriod('custom')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    filterPeriod === 'custom'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Personalizado
                </button>
              </div>

              {filterPeriod === 'custom' && (
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2 border border-slate-200">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-white border border-slate-200 rounded-md px-3 py-1 text-xs text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-slate-400 text-xs font-bold">—</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-white border border-slate-200 rounded-md px-3 py-1 text-xs text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              </div>
            </div>

            {/* Main Amount Display */}
            <div className="mt-16">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-6xl md:text-7xl lg:text-8xl font-light text-slate-900 tracking-tight tabular-nums">
                  ${totalIncome.toLocaleString()}
                </span>
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
                    trend.isUp
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {trend.isUp ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  <span className="text-xs font-medium tabular-nums">{trend.percentage}%</span>
                </div>
              </div>
              <p className="text-sm font-normal text-slate-500 tracking-wide">
                Ingresos Totales - {filterPeriod === 'week' ? 'Últimos 7 días' : filterPeriod === 'month' ? 'Últimos 30 días' : 'Período personalizado'}
              </p>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 ? (
            <div className="h-64 md:h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 400, fontFamily: 'ui-sans-serif, system-ui, -apple-system' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 400, fontFamily: 'ui-sans-serif, system-ui, -apple-system' }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                  />
                  <Bar
                    dataKey="total"
                    fill="#94a3b8"
                    fillOpacity={0.1}
                    radius={[4, 4, 0, 0]}
                    animationDuration={1800}
                    animationEasing="ease-in-out"
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Ingresos"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                    filter="url(#glow)"
                    animationDuration={1800}
                    animationEasing="ease-in-out"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500 mb-6">
              No hay datos para este periodo
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-6 border-t border-slate-200">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Efectivo</span>
              <span className="text-xl font-bold text-slate-900">${cashBalance.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Digital</span>
              <span className="text-xl font-bold text-slate-900">${digitalBalance.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Egresos</span>
              <span className="text-xl font-bold text-slate-900">${totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Pendiente</span>
              <span className="text-xl font-bold text-slate-900">${totalPendingBalance.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Eficiencia</span>
              <span className="text-xl font-bold text-slate-900">{efficiency}%</span>
            </div>
          </div>
        </motion.div>

        {/* Próxima Entrega Card - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          onClick={() => onNavigate('agenda')}
          className="md:col-span-12 lg:col-span-4 bg-zinc-900 p-6 rounded-lg text-white shadow-sm border-2 border-neutral-700 relative overflow-hidden group cursor-pointer flex flex-col"
        >
          {/* Gradient background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-40 group-hover:opacity-80 blur transition-opacity duration-500" />

          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-md">
              <Clock size={20} />
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wide bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">Próxima Entrega</span>
          </div>

          {nextDelivery ? (
            <div className="relative z-10 flex-1 flex flex-col">
              <h4 className="text-xl font-bold mb-3">{nextDelivery.customerName}</h4>
              <div className="flex flex-col gap-2 text-white/90 text-sm mb-4 flex-1">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span className="font-medium">{new Date(nextDelivery.deliveryDate).toLocaleDateString('es-AR')}</span>
                </div>
                <p className="text-white/80 leading-relaxed">{nextDelivery.description}</p>
              </div>
              <div className="flex justify-end">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide bg-white text-indigo-600 px-5 py-2.5 rounded-lg group-hover:translate-x-1 transition-transform shadow-md">
                  Ver Detalles <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex-1 flex flex-col">
              <h4 className="text-lg font-bold mb-1">Sin entregas hoy</h4>
              <p className="text-white/70 text-xs flex-1">¡Excelente trabajo!</p>
              <div className="flex justify-end">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide bg-white text-indigo-600 px-5 py-2.5 rounded-lg shadow-md opacity-50">
                  Ver Agenda <ArrowRight size={14} />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Actividad Reciente - Next to Próxima Entrega */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="md:col-span-12 lg:col-span-8 bg-white p-6 rounded-lg border-2 border-neutral-200 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-neutral-900">Actividad Reciente</h3>
              <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide mt-1">Últimos 5 movimientos del sistema</p>
            </div>
            <button onClick={() => onNavigate('agenda')} className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide hover:underline">Ver Todo</button>
          </div>

          <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-neutral-300 bg-neutral-100">
                    <th className="border-r border-neutral-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-700">
                      Cliente
                    </th>
                    <th className="border-r border-neutral-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-700">
                      Descripción
                    </th>
                    <th className="border-r border-neutral-200 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-neutral-700">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-neutral-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => onNavigate('agenda')}
                      className="border-b border-neutral-200 transition-colors hover:bg-neutral-50 cursor-pointer"
                    >
                      <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3">
                        <span className="font-medium text-neutral-900">{order.customerName}</span>
                      </td>
                      <td className="border-r border-neutral-200 px-4 py-3 max-w-[200px]">
                        <p className="text-sm text-neutral-700 truncate" title={order.description}>
                          {order.description}
                        </p>
                      </td>
                      <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                          order.status === 'terminado' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'proceso' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'pedido' ? 'bg-amber-100 text-amber-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {order.status === 'terminado' ? 'Terminado' :
                           order.status === 'proceso' ? 'En Proceso' :
                           order.status === 'pedido' ? 'Pendiente' :
                           'Entregado'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span className="font-semibold text-neutral-900">
                          ${order.totalAmount.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Pedidos Activos con Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="md:col-span-6 lg:col-span-6 bg-white p-6 rounded-lg border-2 border-neutral-200 shadow-sm flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <ShoppingCart size={18} />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">Pedidos Activos</h4>
                <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">Pipeline de producción</p>
              </div>
            </div>
            <span className="text-xl font-bold text-neutral-900">{pendingOrdersCount}</span>
          </div>

          {/* Pipeline Funnel - Compact */}
          <div className="flex flex-col gap-2">
            {/* Pendientes */}
            <div className="flex items-center gap-2 cursor-pointer hover:bg-amber-50 p-2 rounded-lg transition-colors" onClick={() => onNavigate('agenda')}>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Clock size={14} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-neutral-700">Pendientes</span>
                  <span className="text-xs font-bold text-amber-600">{pipelineData.pedido}</span>
                </div>
                <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pipelineData.pedido > 0 ? (pipelineData.pedido / orders.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* En Proceso */}
            <div className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 p-2 rounded-lg transition-colors" onClick={() => onNavigate('agenda')}>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Zap size={14} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-neutral-700">En Proceso</span>
                  <span className="text-xs font-bold text-indigo-600">{pipelineData.proceso}</span>
                </div>
                <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pipelineData.proceso > 0 ? (pipelineData.proceso / orders.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Terminados */}
            <div className="flex items-center gap-2 cursor-pointer hover:bg-emerald-50 p-2 rounded-lg transition-colors" onClick={() => onNavigate('agenda')}>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle size={14} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-neutral-700">Terminados</span>
                  <span className="text-xs font-bold text-emerald-600">{pipelineData.terminado}</span>
                </div>
                <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pipelineData.terminado > 0 ? (pipelineData.terminado / orders.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {/* Entregados */}
            <div className="flex items-center gap-2 cursor-pointer hover:bg-neutral-100 p-2 rounded-lg transition-colors" onClick={() => onNavigate('agenda')}>
              <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-600 flex items-center justify-center">
                <Package size={14} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-neutral-700">Entregados</span>
                  <span className="text-xs font-bold text-neutral-600">{pipelineData.entregado}</span>
                </div>
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-500 rounded-full" style={{ width: `${pipelineData.entregado > 0 ? (pipelineData.entregado / orders.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alertas Críticas de Stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="md:col-span-6 lg:col-span-6 bg-rose-50 border-2 border-rose-200 p-6 rounded-lg flex flex-col gap-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full -mr-16 -mt-16 blur-3xl" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-rose-500 text-white p-3 rounded-lg shadow-sm animate-pulse">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-rose-950 font-bold text-lg">Alertas Críticas</h4>
              <p className="text-rose-700/70 font-semibold text-[10px] uppercase tracking-wide">Stock bajo</p>
            </div>
          </div>

          {lowStockProductsWithImpact.length > 0 ? (
            <div className="flex flex-col gap-2 relative z-10 max-h-40 overflow-y-auto">
              {lowStockProductsWithImpact.slice(0, 3).map(p => (
                <div key={p.id} className="bg-white px-3 py-2 rounded-lg border border-rose-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="font-semibold text-neutral-800 text-xs">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    Faltan {(p.minStock || 3) - p.stock}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 relative z-10">
              <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-neutral-600">Stock en orden</p>
              <p className="text-xs text-neutral-400">Sin alertas críticas</p>
            </div>
          )}

          <button
            onClick={() => onManageStock()}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wide shadow-sm hover:bg-rose-700 transition-all relative z-10"
          >
            Gestionar Stock
          </button>
        </motion.div>


      </div>
    </div>
  );
};




export default Dashboard;
