
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, CheckCircle, Clock, Trash2, X, Search,
  Calendar as CalendarIcon, MessageCircle, Package,
  Minus, LayoutList, CalendarDays, ChevronLeft, ChevronRight,
  AlertCircle, Edit2, DollarSign, Wallet, Filter, Check,
  CalendarRange, CreditCard, Truck, ArrowRight, CheckCircle2, Sparkles,
  Columns, Instagram, Facebook, Phone, ArrowUpRight, Zap
} from 'lucide-react';
import { Order, PaymentMethod, CashMovement, MovementType, Customer, Product, OrderProduct, OrderStatus } from '@/types';
import { getStatusConfig } from '@/utils';
import { useOrders } from '@/hooks';
import { NewOrderModal } from './NewOrderModal';

interface OrdersAgendaProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setMovements: React.Dispatch<React.SetStateAction<CashMovement[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

type DateFilterType = 'todos' | 'hoy' | 'semana' | 'mes' | 'personalizado';

const OrdersAgenda: React.FC<OrdersAgendaProps> = ({ orders, setOrders, setMovements, customers, setCustomers, products, setProducts, showToast }) => {
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = lastDayOfMonth.getDate() - now.getDate();

  // Estados de UI local (mantener)
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('list');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | OrderStatus>('todos');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('mes');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  // Hook centralizado de gestión de pedidos
  const {
    isModalOpen,
    editingId,
    formData,
    setFormData,
    selectedProducts,
    setSelectedProducts,
    debtWarning,
    setDebtWarning,
    isSaving,
    updateAmounts,
    handleSave,
    openModal,
    closeModal,
    deleteOrder,
    updateOrderStatus,
    toggleOrderDelivery
  } = useOrders({
    orders,
    setOrders,
    setMovements,
    customers,
    setCustomers,
    products,
    setProducts,
    showToast
  });

  // Función local para abrir modal con fecha específica (para calendario)
  const openNewWithDate = (dateStr: string) => {
    openModal();
    // Actualizar la fecha después de abrir
    setTimeout(() => {
      setFormData(prev => ({ ...prev, deliveryDate: dateStr }));
    }, 0);
  };

  // Wrapper para handleSave que muestra modal de éxito
  const handleSaveWithSuccess = async () => {
    const wasNewOrder = !editingId;
    await handleSave();
    if (wasNewOrder) {
      setShowSuccessModal(true);
    }
  };

  const getStatusConfig = (status: OrderStatus, isDelivered?: boolean) => {
    if (isDelivered) {
      return { 
        color: 'bg-indigo-600 text-white', 
        label: 'Entregado', 
        dot: 'bg-indigo-600',
        icon: <Truck size={10} className="md:w-3 md:h-3" />,
        lightColor: 'bg-indigo-50 text-indigo-600 border-indigo-100'
      };
    }
    switch(status) {
      case 'pedido': return { 
        color: 'bg-rose-500 text-white', 
        label: 'Pendiente', 
        dot: 'bg-rose-50',
        icon: <Clock size={10} className="md:w-3 md:h-3" />,
        lightColor: 'bg-rose-50 text-rose-600 border-rose-100'
      };
      case 'proceso': return { 
        color: 'bg-amber-400 text-amber-900', 
        label: 'En Proceso', 
        dot: 'bg-amber-400',
        icon: <Sparkles size={10} className="md:w-3 md:h-3" />,
        lightColor: 'bg-amber-50 text-amber-700 border-amber-100'
      };
      case 'terminado': return { 
        color: 'bg-emerald-500 text-white', 
        label: 'Terminado', 
        dot: 'bg-emerald-500',
        icon: <CheckCircle2 size={10} className="md:w-3 md:h-3" />,
        lightColor: 'bg-emerald-50 text-emerald-600 border-emerald-100'
      };
      default: return { 
        color: 'bg-slate-400 text-white', 
        label: 'Desconocido', 
        dot: 'bg-slate-400',
        icon: <Package size={10} className="md:w-3 md:h-3" />,
        lightColor: 'bg-slate-50 text-slate-600 border-slate-100'
      };
    }
  };

  const handleQuickFilter = (type: DateFilterType) => {
    setDateFilter(type);
  };

  const filteredOrders = useMemo(() => {
    const now = new Date();
    // Normalizar hoy a las 00:00:00
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = today.toLocaleDateString('en-CA');

    // Próximos 7 días (desde hoy)
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    // Todo el mes actual (del día 1 al último día del mes)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const cleanFilter = filter.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return orders.filter(o => {
      const name = (o.customerName || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const desc = (o.description || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const whatsapp = (o.whatsapp || "").toLowerCase();

      const matchesSearch = name.includes(cleanFilter) || desc.includes(cleanFilter) || whatsapp.includes(cleanFilter);
      const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;

      let matchesDate = true;
      const orderDate = new Date(o.deliveryDate + 'T12:00:00');

      if (dateFilter === 'hoy') {
        matchesDate = o.deliveryDate === todayStr;
      } else if (dateFilter === 'semana') {
        matchesDate = orderDate >= today && orderDate <= endOfWeek;
      } else if (dateFilter === 'mes') {
        matchesDate = orderDate >= startOfMonth && orderDate <= endOfMonth;
      } else if (dateFilter === 'personalizado') {
        matchesDate = o.deliveryDate >= customRange.start && o.deliveryDate <= customRange.end;
      }

      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a,b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
  }, [orders, filter, statusFilter, dateFilter, customRange]);

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= lastDate; i++) days.push(i);

  const kanbanColumns = [
    { id: 'pedido', title: 'Pendiente', color: 'bg-rose-500', icon: <Clock size={16} /> },
    { id: 'proceso', title: 'En Proceso', color: 'bg-amber-400', icon: <Sparkles size={16} /> },
    { id: 'terminado', title: 'Terminado', color: 'bg-emerald-500', icon: <CheckCircle2 size={16} /> },
    { id: 'entregado', title: 'Entregado', color: 'bg-indigo-600', icon: <Truck size={16} /> }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center gap-4">
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-lg outline-none w-full bg-transparent text-xs font-medium focus:bg-indigo-50/30 transition-all placeholder:text-slate-400 min-w-[200px]"
            />
          </div>
        </div>

        {/* Filtros de vista */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
          <button onClick={() => setViewMode('list')} className={`px-4 py-2.5 rounded-lg transition-all relative ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}>
            <LayoutList size={16} />
          </button>
          <button onClick={() => setViewMode('kanban')} className={`px-4 py-2.5 rounded-lg transition-all relative ${viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}>
            <Columns size={16} />
          </button>
          <button onClick={() => setViewMode('calendar')} className={`px-4 py-2.5 rounded-lg transition-all relative ${viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}>
            <CalendarDays size={16} />
          </button>
        </div>

          {/* Filtros de fecha */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
            {(['hoy', 'semana', 'mes', 'personalizado'] as DateFilterType[]).map(df => (
              <button
                key={df}
                onClick={() => handleQuickFilter(df)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all relative ${dateFilter === df ? 'text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {dateFilter === df && <motion.div layoutId="date-filter" className="absolute inset-0 bg-indigo-50 rounded-lg -z-10 border border-indigo-100" />}
                {df === 'hoy' ? 'Día' : df === 'semana' ? 'Semana' : df === 'mes' ? 'Mes' : 'Rango'}
              </button>
            ))}
          </div>

          {/* Inputs de rango personalizado */}
          {dateFilter === 'personalizado' && (
            <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
              <span className="text-xs font-semibold text-slate-600">Desde:</span>
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-slate-400 text-xs font-bold">—</span>
              <span className="text-xs font-semibold text-slate-600">Hasta:</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Filtros de estado */}
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
            {['todos', 'pedido', 'proceso', 'terminado', 'entregado'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as any)}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all relative ${statusFilter === s ? 'text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {statusFilter === s && <motion.div layoutId="status-filter" className="absolute inset-0 bg-indigo-50 rounded-lg -z-10 border border-indigo-100" />}
                {s === 'todos' ? 'Todos' : s === 'pedido' ? 'Pendiente' : s === 'proceso' ? 'Proceso' : s === 'terminado' ? 'Terminado' : 'Entregado'}
              </button>
            ))}
          </div>

          {/* Botón Nuevo Trabajo */}
          <button
            onClick={() => openNewWithDate(new Date().toLocaleDateString('en-CA'))}
            className="relative h-[46px] px-6 overflow-hidden bg-zinc-900 transition-all duration-200 rounded-xl group ml-auto"
          >
            {/* Gradient background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-40 group-hover:opacity-80 blur transition-opacity duration-500" />

            {/* Content */}
            <div className="relative flex items-center justify-center gap-2">
              <Plus className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">Nuevo Trabajo</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/90" />
            </div>
          </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'calendar' ? (
            <div className="bg-white rounded-lg border-2 border-neutral-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-neutral-50 border-b-2 border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <h3 className="text-lg md:text-2xl font-bold text-neutral-900 capitalize">{currentCalendarDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</h3>
                <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between">
                  <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1)))} className="p-2.5 bg-white rounded-lg border border-neutral-300 hover:bg-violet-50 hover:border-violet-400 transition-colors"><ChevronLeft size={18}/></button>
                  <button onClick={() => setCurrentCalendarDate(new Date())} className="flex-1 md:flex-none px-4 py-2 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors">Hoy</button>
                  <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1)))} className="p-2.5 bg-white rounded-lg border border-neutral-300 hover:bg-violet-50 hover:border-violet-400 transition-colors"><ChevronRight size={18}/></button>
                </div>
              </div>
              <div className="grid grid-cols-7 border-b-2 border-neutral-200 bg-neutral-50">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d, i) => <div key={`${d}-${i}`} className="py-3 text-center text-xs font-semibold text-neutral-600 border-r border-neutral-200 last:border-r-0">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 min-h-[500px] md:min-h-[650px]">
                {days.map((day, idx) => {
                  const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                  const dayOrders = filteredOrders.filter(o => o.deliveryDate === dateStr);
                  const todayStr = new Date().toLocaleDateString('en-CA');
                  const isToday = dateStr === todayStr;
                  return (
                    <div
                      key={idx}
                      className={`border-r border-b border-neutral-200 p-2 md:p-3 min-h-[100px] md:min-h-[120px] transition-all flex flex-col gap-2 group ${day ? 'bg-white hover:bg-violet-50/30 cursor-pointer' : 'bg-neutral-50'}`}
                      onClick={() => day && openNewWithDate(dateStr)}
                    >
                      {day && (
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-sm md:text-lg font-semibold transition-all ${isToday ? 'bg-violet-600 text-white w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full' : 'text-neutral-700'}`}>{day}</span>
                        </div>
                      )}
                      <div className="flex-1 space-y-1 overflow-hidden">
                        {dayOrders.map(order => (
                          <motion.div
                            layoutId={`order-${order.id}`}
                            key={order.id}
                            onClick={(e) => { e.stopPropagation(); openModal(order); }}
                            className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md text-[8px] md:text-[10px] font-medium truncate transition-colors cursor-pointer ${getStatusConfig(order.status, order.isDelivered).color}`}
                          >
                            <span className="truncate">{order.customerName}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[600px]">
              {kanbanColumns.map(col => {
                const colOrders = filteredOrders.filter(o => {
                  if (col.id === 'entregado') return o.isDelivered;
                  return o.status === col.id && !o.isDelivered;
                });

                return (
                  <div key={col.id} className="flex flex-col gap-3 min-w-[300px]">
                    <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border-2 border-neutral-200 shadow-sm relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${col.color}`} />
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg text-white ${col.color}`}>
                          {col.icon}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">{col.title}</h4>
                          <span className="text-[10px] font-semibold text-neutral-500">
                            ${colOrders.reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-neutral-900">{colOrders.length}</span>
                        <span className="text-[9px] font-medium text-neutral-400 uppercase">Trabajos</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 bg-neutral-50 p-3 rounded-lg border border-neutral-200 min-h-[400px] overflow-y-auto custom-scrollbar pb-20">
                      {colOrders.map(order => (
                        <motion.div
                          layoutId={`order-${order.id}`}
                          key={order.id}
                          onClick={() => openModal(order)}
                          className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer group relative"
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${col.color}`} />

                          {/* Progress Bar */}
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-neutral-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: order.isDelivered ? '100%' :
                                       order.status === 'terminado' ? '75%' :
                                       order.status === 'proceso' ? '50%' : '25%'
                              }}
                              className={`h-full ${getStatusConfig(order.status, order.isDelivered).color}`}
                            />
                          </div>

                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-semibold text-neutral-900 text-sm leading-tight mb-1">{order.customerName}</h5>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-neutral-500">{new Date(order.deliveryDate).toLocaleDateString('es-AR')}</span>
                                {order.contactMethod && (
                                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-neutral-50 rounded border border-neutral-200">
                                    {order.contactMethod === 'WhatsApp' && <MessageCircle size={8} className="text-emerald-500" />}
                                    {order.contactMethod === 'Instagram' && <Instagram size={8} className="text-pink-500" />}
                                    {order.contactMethod === 'Facebook' && <Facebook size={8} className="text-blue-500" />}
                                    {order.contactMethod === 'Presencial' && <Package size={8} className="text-neutral-500" />}
                                    <span className="text-[8px] font-medium text-neutral-400">{order.contactMethod}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {deletingId === order.id ? (
                              <div className="flex items-center gap-1 animate-in zoom-in duration-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOrders(o => o.filter(x => x.id !== order.id));
                                    showToast("Pedido eliminado", "success");
                                    setDeletingId(null);
                                  }}
                                  className="px-2 py-1 bg-rose-600 text-white rounded text-[9px] font-semibold uppercase hover:bg-rose-700"
                                >
                                  Borrar
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                                  className="p-1 bg-neutral-100 text-neutral-400 rounded hover:text-neutral-600"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingId(order.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-300 hover:text-rose-500 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-neutral-600 font-normal line-clamp-2 mb-4 bg-neutral-50 px-3 py-2 rounded border border-neutral-100">
                            {order.description}
                          </p>

                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-100">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-neutral-400">
                                <CalendarIcon size={11} />
                                <span className="text-[10px] font-medium">
                                  {new Date(order.deliveryDate + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                              <a
                                href={`https://wa.me/${(order.whatsapp || "").replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${order.customerName}, te escribo por tu pedido de ${order.description}...`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-all border border-emerald-200"
                                title="Enviar WhatsApp"
                              >
                                <MessageCircle size={12} />
                              </a>
                            </div>
                            <div className="flex items-center gap-1">
                              {col.id !== 'pedido' && col.id !== 'entregado' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'pedido'); }}
                                  className="p-1.5 bg-neutral-100 text-neutral-400 rounded hover:bg-red-50 hover:text-red-500 transition-all border border-neutral-200"
                                  title="Mover a Pendiente"
                                >
                                  <ArrowRight size={11} className="rotate-180" />
                                </button>
                              )}
                              {col.id === 'pedido' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'proceso'); }}
                                  className="p-1.5 bg-neutral-100 text-neutral-400 rounded hover:bg-yellow-50 hover:text-yellow-600 transition-all border border-neutral-200"
                                  title="Mover a En Proceso"
                                >
                                  <ArrowRight size={11} />
                                </button>
                              )}
                              {col.id === 'proceso' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'terminado'); }}
                                  className="p-1.5 bg-neutral-100 text-neutral-400 rounded hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-neutral-200"
                                  title="Mover a Terminado"
                                >
                                  <ArrowRight size={11} />
                                </button>
                              )}
                              {col.id === 'terminado' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleOrderDelivery(order.id); }}
                                  className="p-1.5 bg-neutral-100 text-neutral-400 rounded hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-neutral-200"
                                  title="Marcar como Entregado"
                                >
                                  <Truck size={11} />
                                </button>
                              )}
                              {col.id === 'entregado' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleOrderDelivery(order.id); }}
                                  className="p-1.5 bg-neutral-100 text-neutral-400 rounded hover:bg-neutral-200 hover:text-neutral-600 transition-all border border-neutral-200"
                                  title="Desmarcar Entrega"
                                >
                                  <ArrowRight size={11} className="rotate-180" />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {colOrders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-neutral-300">
                          <Package size={20} className="mb-2 opacity-30" />
                          <p className="text-[10px] font-medium uppercase opacity-50">Vacío</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Funnel de Pedidos - Compacto */}
              <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
                    <LayoutList size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">Pipeline</h3>
                    <p className="text-[9px] font-medium text-neutral-500">
                      {filteredOrders.length} {filteredOrders.length === 1 ? 'trabajo' : 'trabajos'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {/* Pendientes */}
                  <div className="bg-amber-50 border border-amber-200 p-2 rounded hover:shadow transition-all cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-6 h-6 rounded bg-amber-500 text-white flex items-center justify-center">
                        <Clock size={11} />
                      </div>
                      <span className="text-[10px] font-semibold text-amber-900">Pendientes</span>
                    </div>
                    <div className="text-lg font-bold text-amber-600 mb-0.5">
                      {orders.filter(o => o.status === 'pedido' && !o.isDelivered).length}
                    </div>
                    <div className="h-1 bg-amber-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${orders.length > 0 ? (orders.filter(o => o.status === 'pedido' && !o.isDelivered).length / orders.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* En Proceso */}
                  <div className="bg-indigo-50 border border-indigo-200 p-2 rounded hover:shadow transition-all cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-6 h-6 rounded bg-indigo-500 text-white flex items-center justify-center">
                        <Zap size={11} />
                      </div>
                      <span className="text-[10px] font-semibold text-indigo-900">Proceso</span>
                    </div>
                    <div className="text-lg font-bold text-indigo-600 mb-0.5">
                      {orders.filter(o => o.status === 'proceso' && !o.isDelivered).length}
                    </div>
                    <div className="h-1 bg-indigo-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${orders.length > 0 ? (orders.filter(o => o.status === 'proceso' && !o.isDelivered).length / orders.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Terminados */}
                  <div className="bg-emerald-50 border border-emerald-200 p-2 rounded hover:shadow transition-all cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-6 h-6 rounded bg-emerald-500 text-white flex items-center justify-center">
                        <CheckCircle size={11} />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-900">Terminados</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-600 mb-0.5">
                      {orders.filter(o => o.status === 'terminado' && !o.isDelivered).length}
                    </div>
                    <div className="h-1 bg-emerald-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${orders.length > 0 ? (orders.filter(o => o.status === 'terminado' && !o.isDelivered).length / orders.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Entregados */}
                  <div className="bg-neutral-100 border border-neutral-300 p-2 rounded hover:shadow transition-all cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-6 h-6 rounded bg-neutral-500 text-white flex items-center justify-center">
                        <Package size={11} />
                      </div>
                      <span className="text-[10px] font-semibold text-neutral-900">Entregados</span>
                    </div>
                    <div className="text-lg font-bold text-neutral-600 mb-0.5">
                      {orders.filter(o => o.isDelivered).length}
                    </div>
                    <div className="h-1 bg-neutral-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-500 rounded-full transition-all duration-500"
                        style={{ width: `${orders.length > 0 ? (orders.filter(o => o.isDelivered).length / orders.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white shadow">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="border-b-2 border-neutral-300 bg-neutral-100">
                        <th className="border-r border-neutral-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-700">
                          Cliente
                        </th>
                        <th className="border-r border-neutral-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-700">
                          Descripción
                        </th>
                        <th className="border-r border-neutral-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-700">
                          Entrega
                        </th>
                        <th className="border-r border-neutral-200 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-neutral-700">
                          Estado
                        </th>
                        <th className="border-r border-neutral-200 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-neutral-700">
                          Total
                        </th>
                        <th className="border-r border-neutral-200 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-neutral-700">
                          Seña
                        </th>
                        <th className="border-r border-neutral-200 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-neutral-700">
                          Saldo
                        </th>
                        <th className="border-r border-neutral-200 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-neutral-700">
                          Contacto
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-neutral-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <Package className="h-12 w-12 text-neutral-300 mb-3" />
                              <p className="text-sm font-medium text-neutral-600">
                                No se encontraron trabajos
                              </p>
                              <p className="text-xs text-neutral-400 mt-1">
                                Ajusta los filtros de búsqueda
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="border-b border-neutral-200 transition-colors hover:bg-neutral-50"
                          >
                            {/* Cliente */}
                            <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-neutral-900">{order.customerName}</span>
                                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                                  <Phone className="h-3 w-3" />
                                  <span>{order.whatsapp}</span>
                                </div>
                              </div>
                            </td>

                            {/* Descripción */}
                            <td className="border-r border-neutral-200 px-4 py-3 max-w-[200px]">
                              <p className="text-sm text-neutral-700 truncate" title={order.description}>
                                {order.description}
                              </p>
                            </td>

                            {/* Entrega */}
                            <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3">
                              <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                                <CalendarIcon className="h-3.5 w-3.5 text-neutral-400" />
                                <span>{new Date(order.deliveryDate).toLocaleDateString('es-AR')}</span>
                              </div>
                            </td>

                            {/* Estado */}
                            <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => {
                                    if (order.isDelivered) {
                                      toggleOrderDelivery(order.id);
                                    } else if (order.status === 'pedido') {
                                      updateOrderStatus(order.id, 'proceso');
                                    } else if (order.status === 'proceso') {
                                      updateOrderStatus(order.id, 'terminado');
                                    } else if (order.status === 'terminado') {
                                      toggleOrderDelivery(order.id);
                                    }
                                  }}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${getStatusConfig(order.status, order.isDelivered).color} hover:opacity-80`}
                                  title="Click para avanzar estado"
                                >
                                  {getStatusConfig(order.status, order.isDelivered).icon}
                                  <span>{getStatusConfig(order.status, order.isDelivered).label}</span>
                                </button>
                              </div>
                            </td>

                            {/* Total */}
                            <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3 text-right">
                              <span className="font-semibold text-neutral-900">
                                ${order.totalAmount.toLocaleString()}
                              </span>
                            </td>

                            {/* Seña */}
                            <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3 text-right">
                              <span className="text-sm text-emerald-600 font-medium">
                                ${order.depositAmount.toLocaleString()}
                              </span>
                            </td>

                            {/* Saldo */}
                            <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3 text-right">
                              {order.remainingPaid ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Pagado
                                </span>
                              ) : (
                                <span className="text-sm text-amber-600 font-medium">
                                  ${order.remainingAmount.toLocaleString()}
                                </span>
                              )}
                            </td>

                            {/* Contacto */}
                            <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3 text-center">
                              {order.contactMethod && (
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                                  {order.contactMethod === 'WhatsApp' && <MessageCircle className="h-3 w-3 text-emerald-500" />}
                                  {order.contactMethod === 'Instagram' && <Instagram className="h-3 w-3 text-pink-500" />}
                                  {order.contactMethod === 'Facebook' && <Facebook className="h-3 w-3 text-blue-500" />}
                                  {order.contactMethod === 'Presencial' && <Package className="h-3 w-3 text-neutral-500" />}
                                  <span>{order.contactMethod}</span>
                                </div>
                              )}
                            </td>

                            {/* Acciones */}
                            <td className="whitespace-nowrap px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <a
                                  href={`https://wa.me/${(order.whatsapp || "").replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${order.customerName}, te escribo por tu pedido de ${order.description}...`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center rounded-lg p-1.5 text-emerald-500 transition-colors hover:bg-emerald-50 cursor-pointer"
                                  title="Enviar WhatsApp"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </a>
                                <button
                                  onClick={() => openModal(order)}
                                  className="inline-flex items-center rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-indigo-600"
                                  title="Editar"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                {deletingId === order.id ? (
                                  <div className="flex items-center gap-1 animate-in zoom-in duration-200">
                                    <button
                                      onClick={() => {
                                        deleteOrder(order.id);
                                        setDeletingId(null);
                                      }}
                                      className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                                    >
                                      Confirmar
                                    </button>
                                    <button
                                      onClick={() => setDeletingId(null)}
                                      className="inline-flex items-center rounded-lg p-1 text-neutral-400 hover:bg-neutral-100"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeletingId(order.id)}
                                    className="inline-flex items-center rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-red-600"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <NewOrderModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveWithSuccess}
        formData={formData}
        setFormData={setFormData}
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
        products={products}
        updateAmounts={updateAmounts}
        isSaving={isSaving}
        editingId={editingId}
      />
      {/* Debt Warning Modal */}
      <AnimatePresence>
        {debtWarning?.isOpen && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6 z-[300]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl p-10 text-center space-y-8 border border-rose-100"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-bounce">
                 <AlertCircle size={40} />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">¡Cliente con Deuda!</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                  Este pedido tiene un saldo pendiente de:
                </p>
                <div className="text-4xl font-black text-rose-600 tracking-tighter">
                  ${debtWarning.amount.toLocaleString()}
                </div>
                <p className="text-slate-400 text-xs font-medium pt-2">
                  ¿Estás seguro de que deseas marcarlo como entregado sin haber cobrado el saldo?
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={() => {
                    debtWarning.onConfirm();
                    setDebtWarning(null);
                  }} 
                  className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-rose-700 active:scale-95 transition-all"
                >
                  Confirmar Entrega
                </button>
                <button 
                  onClick={() => setDebtWarning(null)} 
                  className="w-full py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-2xl flex items-center justify-center p-6 z-[200]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-white rounded-[4rem] w-full max-w-md overflow-hidden shadow-2xl p-12 text-center space-y-10 relative"
            >
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                 <CheckCircle2 size={48} />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">¡Trabajo Agendado!</h3>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                  El pedido se ha registrado correctamente en tu agenda comercial.
                </p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setShowSuccessModal(false)} 
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-black active:scale-95 transition-all"
                >
                  Entendido
                </button>
              </div>

              {/* Decorative sparkles */}
              <div className="absolute top-10 left-10 text-emerald-200 animate-pulse"><Sparkles size={24}/></div>
              <div className="absolute bottom-10 right-10 text-indigo-200 animate-pulse"><Sparkles size={20}/></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersAgenda;
