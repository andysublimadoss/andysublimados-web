
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, CashMovement, Product, MovementType, Supplier, PaymentMethod, TabType } from '../types';
import { 
  AlertTriangle, Package, Wallet, Star, ArrowRight, DollarSign, HandCoins, Zap, ArrowUpRight, ShoppingCart, Users, Clock, CreditCard, Plus, TrendingUp, Calendar, ArrowDownRight, CheckCircle
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardProps {
  orders: Order[];
  movements: CashMovement[];
  products: Product[];
  suppliers: Supplier[];
  onManageStock: (productName?: string) => void;
  onNavigate: (tab: TabType) => void;
}

const LogoIcon = () => (
  <div className="w-16 h-16 relative flex items-center justify-center overflow-hidden">
    <img 
      src="/logo.png" 
      alt="Logo" 
      className="w-full h-full object-contain"
      onError={(e) => {
        // If .png fails, try .jpg
        if (e.currentTarget.src.endsWith('.png')) {
          e.currentTarget.src = '/logo.jpg';
        } else {
          // Fallback to SVG if both fail
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }
      }}
    />
    <svg viewBox="0 0 100 100" className="w-full h-full hidden">
      <path d="M20 80 L50 20 L80 80" fill="none" stroke="#E6007E" strokeWidth="15" />
      <path d="M10 40 L35 20 L45 50 Z" fill="#FFED00" />
      <path d="M30 75 L50 95 L20 95 Z" fill="#009EE3" />
      <path d="M45 30 L55 30 L50 50 Z" fill="#000000" />
    </svg>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ orders, movements, products, suppliers, onManageStock, onNavigate }) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDaysRemaining = () => {
    const now = currentTime;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return lastDay - now.getDate();
  };

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  // Cálculo de saldos separados
  const cashBalance = movements
    .filter(m => m.method === PaymentMethod.EFECTIVO)
    .reduce((acc, m) => m.type === MovementType.INGRESO ? acc + m.amount : acc - m.amount, 0);

  const digitalBalance = movements
    .filter(m => m.method !== PaymentMethod.EFECTIVO)
    .reduce((acc, m) => m.type === MovementType.INGRESO ? acc + m.amount : acc - m.amount, 0);

  const pendingOrdersCount = orders.filter(o => o.status !== 'terminado').length;
  
  const totalPendingBalance = orders
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
  const completedOrdersMonth = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.getMonth() === currentTime.getMonth() && 
           orderDate.getFullYear() === currentTime.getFullYear() &&
           o.status === 'terminado';
  }).length;

  const totalOrdersMonth = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.getMonth() === currentTime.getMonth() && 
           orderDate.getFullYear() === currentTime.getFullYear();
  }).length;

  const efficiency = totalOrdersMonth > 0 ? Math.round((completedOrdersMonth / totalOrdersMonth) * 100) : 0;

  // Pipeline Data
  const pipelineData = {
    pedido: orders.filter(o => o.status === 'pedido' && !o.isDelivered).length,
    proceso: orders.filter(o => o.status === 'proceso' && !o.isDelivered).length,
    terminado: orders.filter(o => o.status === 'terminado' && !o.isDelivered).length,
    entregado: orders.filter(o => o.isDelivered).length
  };

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const chartData = last7Days.map(date => {
    const dayMovements = movements.filter(m => m.date === date);
    const income = dayMovements.filter(m => m.type === MovementType.INGRESO).reduce((acc, m) => acc + m.amount, 0);
    const dayStr = new Date(date).toLocaleDateString('es-AR', { weekday: 'short' });
    return { name: dayStr, total: income };
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buen día!';
    if (hour < 20) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  const nextDelivery = orders
    .filter(o => o.deliveryDate === todayStr && !o.isDelivered)
    .sort((a, b) => (a.deliveryTime || '').localeCompare(b.deliveryTime || ''))[0];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-10 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px]">Sistema Activo</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none"
          >
            Control de <span className="text-indigo-600 italic">Mando.</span>
          </motion.h2>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex flex-col items-end px-4 border-r border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo Real</span>
            <span className="text-lg font-black text-slate-700 tabular-nums">
              {currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <div className="flex flex-col items-start px-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Actual</span>
            <span className="text-lg font-black text-slate-700 uppercase">
              {currentTime.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        
        {/* Main Financial Overview (Large) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-8 lg:col-span-8 bg-slate-900 p-6 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 flex flex-col relative overflow-hidden group min-h-[400px]"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-indigo-500/15 transition-all duration-1000" />
          
          <div className="relative z-10 flex justify-between items-start mb-8">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2 block">Flujo de Caja Total</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white/20">$</span>
                <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                  {(cashBalance + digitalBalance).toLocaleString()}
                </h3>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="p-4 bg-white/5 rounded-2xl text-white border border-white/10 backdrop-blur-xl">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          <div className="relative z-10 flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#818cf8" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Efectivo</span>
              <span className="text-xl font-black text-white">${cashBalance.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Digital</span>
              <span className="text-xl font-black text-indigo-400">${digitalBalance.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Pendiente</span>
              <span className="text-xl font-black text-amber-400">${totalPendingBalance.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Eficiencia</span>
              <span className="text-xl font-black text-emerald-400">{efficiency}%</span>
            </div>
          </div>
        </motion.div>

        {/* Operational Status (Medium) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-4 lg:col-span-4 flex flex-col gap-4 md:gap-6"
        >
          {/* Next Delivery Card */}
          <div 
            onClick={() => onNavigate('agenda')}
            className="flex-1 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200/20 relative overflow-hidden group cursor-pointer"
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
                  <span>{nextDelivery.deliveryTime || 'Sin hora'}</span>
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
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[140px] group hover:border-indigo-200 transition-colors cursor-pointer" onClick={() => onNavigate('agenda')}>
              <div className="flex justify-between items-start">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <ShoppingCart size={20} />
                </div>
                <span className="text-2xl font-black text-slate-900">{pendingOrdersCount}</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedidos Activos</span>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[140px] group hover:border-rose-200 transition-colors cursor-pointer" onClick={() => onManageStock()}>
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

        {/* Quick Actions (Medium) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="md:col-span-4 lg:col-span-3 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4"
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

        {/* Production Pipeline Visual (New) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="md:col-span-12 lg:col-span-12 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
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
          transition={{ delay: 0.6 }}
          className="md:col-span-8 lg:col-span-9 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
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
            transition={{ delay: 0.7 }}
            className="md:col-span-12 bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
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

const ActionItem = ({ icon, label, color, onClick }: { icon: React.ReactNode, label: string, color: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`${color} w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 group`}
  >
    <div className="shrink-0 group-hover:rotate-12 transition-transform">{icon}</div>
    <span className="font-black text-[11px] uppercase tracking-widest">{label}</span>
  </button>
);

const PipelineStep = ({ label, count, color, bgColor, textColor, icon, percentage }: { label: string, count: number, color: string, bgColor: string, textColor: string, icon: React.ReactNode, percentage: number }) => (
  <div className={`${bgColor} p-6 rounded-[2rem] border border-slate-100 flex flex-col gap-4 relative overflow-hidden group`}>
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-indigo-200/20`}>
        {icon}
      </div>
      <span className="text-3xl font-black text-slate-900">{count}</span>
    </div>
    <div className="relative z-10">
      <p className={`text-[10px] font-black uppercase tracking-widest ${textColor} mb-2`}>{label}</p>
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, color, icon, delay = 0, onClick }: { title: string, value: any, color: string, icon: React.ReactNode, delay?: number, onClick?: () => void }) => {
  const isLight = color.includes('white') || color.includes('-50') || color.includes('-100');
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`${color} p-2 md:p-3 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/20 flex flex-col justify-between min-h-[70px] md:min-h-[100px] transition-all ${onClick ? 'cursor-pointer' : 'cursor-default'} overflow-hidden`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'opacity-60'} truncate`}>{title}</span>
        <div className={`p-1 md:p-1.5 rounded-lg md:rounded-xl ${isLight ? 'bg-slate-50 shadow-inner' : 'bg-white/10'} shrink-0`}>{icon}</div>
      </div>
      <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-black mt-2 md:mt-4 tracking-tighter whitespace-nowrap">{value}</span>
    </motion.div>
  );
};

export default Dashboard;
