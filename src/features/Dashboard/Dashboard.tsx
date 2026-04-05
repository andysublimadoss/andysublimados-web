
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

        {/* Quick Actions (Medium) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="md:col-span-4 lg:col-span-3 bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Acciones Rápidas</h4>
            <Zap size={16} className="text-amber-500" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <ActionItem icon={<Plus size={18}/>} label="Nuevo Pedido" color="bg-indigo-600 text-white" onClick={() => onNavigate('agenda')} />
            <ActionItem icon={<Users size={18}/>} label="Clientes" color="bg-slate-50 text-slate-700" onClick={() => onNavigate('clientes')} />
            <ActionItem icon={<HandCoins size={18}/>} label="Registrar Pago" color="bg-slate-50 text-slate-700" onClick={() => onNavigate('caja')} />
            <ActionItem icon={<Star size={18}/>} label="Andy IA" color="bg-amber-50 text-amber-700" onClick={() => onNavigate('asistente')} />
          </div>
        </motion.div>

        {/* Operational Status - Moved Below */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="md:col-span-8 lg:col-span-9 flex flex-col gap-4 md:gap-6"
        >
          {/* Next Delivery Card */}
          <div
            onClick={() => onNavigate('agenda')}
            className="bg-linear-to-br from-indigo-600 to-violet-700 p-8 rounded-4xl text-white shadow-xl shadow-indigo-200/20 relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
            <div className="relative z-10 flex justify-between items-start mb-8">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <Clock size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">Próxima Entrega</span>
            </div>
            {nextDelivery ? (
              <div className="relative z-10">
                <h4 className="text-3xl font-black tracking-tight mb-2">{nextDelivery.customerName}</h4>
                <div className="flex items-center gap-2 text-indigo-100 font-bold text-sm mb-6">
                  <Calendar size={14} />
                  <span>{new Date(nextDelivery.deliveryDate).toLocaleDateString('es-AR')}</span>
                  <span className="opacity-30">|</span>
                  <span>{nextDelivery.description}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-indigo-600 w-fit px-5 py-2.5 rounded-xl shadow-lg group-hover:translate-x-2 transition-transform">
                  Ver Detalles <ArrowRight size={14} />
                </div>
              </div>
            ) : (
              <div className="relative z-10 py-4">
                <h4 className="text-2xl font-black tracking-tight mb-2">Sin entregas hoy</h4>
                <p className="text-indigo-100/60 font-bold text-xs uppercase tracking-widest">¡Excelente trabajo!</p>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-35 group hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => onNavigate('agenda')}>
              <div className="flex justify-between items-start">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <ShoppingCart size={20} />
                </div>
                <span className="text-2xl font-black text-slate-900">{pendingOrdersCount}</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedidos Activos</span>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-35 group hover:border-rose-200 transition-colors cursor-pointer" onClick={() => onManageStock()}>
              <div className="flex justify-between items-start">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Package size={20} />
                </div>
                <span className="text-2xl font-black text-slate-900">{lowStockProducts.length}</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bajo Stock</span>
            </div>
          </div>
        </motion.div>

        {/* Production Pipeline Visual (New) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="md:col-span-12 lg:col-span-12 bg-white p-8 rounded-4xl border border-slate-100 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">ESTADO DE LOS PEDIDOS</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Estado actual de todos los trabajos activos</p>
            </div>
            <button onClick={() => onNavigate('agenda')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Gestionar Pedidos</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PipelineStep 
              label="Pendientes" 
              count={pipelineData.pedido} 
              color="bg-amber-500" 
              bgColor="bg-amber-50" 
              textColor="text-amber-700" 
              icon={<Clock size={16} />}
              percentage={pipelineData.pedido > 0 ? (pipelineData.pedido / orders.length) * 100 : 0}
            />
            <PipelineStep 
              label="En Proceso" 
              count={pipelineData.proceso} 
              color="bg-indigo-500" 
              bgColor="bg-indigo-50" 
              textColor="text-indigo-700" 
              icon={<Zap size={16} />}
              percentage={pipelineData.proceso > 0 ? (pipelineData.proceso / orders.length) * 100 : 0}
            />
            <PipelineStep 
              label="Terminados" 
              count={pipelineData.terminado} 
              color="bg-emerald-500" 
              bgColor="bg-emerald-50" 
              textColor="text-emerald-700" 
              icon={<CheckCircle size={16} />}
              percentage={pipelineData.terminado > 0 ? (pipelineData.terminado / orders.length) * 100 : 0}
            />
            <PipelineStep 
              label="Entregados" 
              count={pipelineData.entregado} 
              color="bg-slate-500" 
              bgColor="bg-slate-50" 
              textColor="text-slate-700" 
              icon={<Package size={16} />}
              percentage={pipelineData.entregado > 0 ? (pipelineData.entregado / orders.length) * 100 : 0}
            />
          </div>
        </motion.div>

        {/* Recent Activity (Large) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          className="md:col-span-8 lg:col-span-9 bg-white p-8 rounded-4xl border border-slate-100 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Actividad Reciente</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Últimos 5 movimientos del sistema</p>
            </div>
            <button onClick={() => onNavigate('agenda')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Ver Todo</button>
          </div>
          
          <div className="space-y-3">
            {recentOrders.map((order, idx) => (
              <div 
                key={order.id}
                onClick={() => onNavigate('agenda')}
                className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    order.status === 'terminado' ? 'bg-emerald-100 text-emerald-600' : 
                    order.status === 'proceso' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">{order.customerName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900 text-base">${order.totalAmount.toLocaleString()}</p>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    order.status === 'terminado' ? 'bg-emerald-50 text-emerald-600' : 
                    order.status === 'proceso' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stock Alerts (Full Width if needed) */}
        {lowStockProductsWithImpact.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
            className="md:col-span-12 bg-rose-50 border border-rose-100 p-8 rounded-4xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/20 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="bg-rose-500 text-white p-5 rounded-3xl shadow-lg shadow-rose-200 animate-pulse relative z-10">
              <AlertTriangle size={32} />
            </div>
            <div className="flex-1 text-center md:text-left relative z-10">
              <h4 className="text-rose-950 font-black text-2xl tracking-tight mb-2">Alertas Críticas de Stock</h4>
              <p className="text-rose-700/70 font-bold uppercase tracking-widest text-[10px] mb-6">Insumos necesarios para completar pedidos activos:</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {lowStockProductsWithImpact.slice(0, 4).map(p => (
                  <div key={p.id} className="bg-white px-4 py-3 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="font-black text-slate-800 text-xs">{p.name}</span>
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Faltan {(p.minStock || 3) - p.stock}</span>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={() => onManageStock()}
              className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all hover:-translate-y-1 relative z-10"
            >
              Gestionar Stock
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};




export default Dashboard;
