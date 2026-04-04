
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, CheckCircle, Clock, Trash2, X, Search, 
  Calendar as CalendarIcon, MessageCircle, Package, 
  Minus, LayoutList, CalendarDays, ChevronLeft, ChevronRight,
  AlertCircle, Edit2, DollarSign, Wallet, Filter, Check,
  CalendarRange, CreditCard, Truck, ArrowRight, CheckCircle2, Sparkles,
  Columns, Instagram, Facebook
} from 'lucide-react';
import { Order, PaymentMethod, CashMovement, MovementType, Customer, Product, OrderProduct, OrderStatus } from '../types';

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

  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('kanban');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | OrderStatus>('todos');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('mes');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debtWarning, setDebtWarning] = useState<{ isOpen: boolean, amount: number, onConfirm: () => void } | null>(null);
  
  const [formData, setFormData] = useState({
    description: '',
    customerName: '',
    whatsapp: '',
    deliveryDate: new Date().toLocaleDateString('en-CA'), 
    totalAmount: 0,
    depositAmount: 0,
    depositMethod: PaymentMethod.EFECTIVO,
    remainingAmount: 0,
    remainingMethod: PaymentMethod.EFECTIVO,
    isDelivered: false,
    remainingPaid: false,
    status: 'pedido' as OrderStatus,
    contactMethod: undefined as 'WhatsApp' | 'Instagram' | 'Facebook' | 'Presencial' | undefined
  });

  const updateAmounts = (total: number, deposit: number) => {
    const remaining = Math.max(0, total - deposit);
    setFormData(prev => ({ 
      ...prev, 
      totalAmount: total, 
      depositAmount: deposit, 
      remainingAmount: remaining 
    }));
  };

  // Autosave effect for editing - only for non-financial fields to avoid side-effect issues
  useEffect(() => {
    if (isModalOpen && editingId && formData.customerName.trim() && formData.description.trim()) {
      const timer = setTimeout(() => {
        setOrders(prev => prev.map(o => o.id === editingId ? {
          ...o,
          description: formData.description,
          customerName: formData.customerName,
          whatsapp: formData.whatsapp,
          deliveryDate: formData.deliveryDate,
          linkedProducts: selectedProducts
        } : o));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.description, formData.customerName, formData.whatsapp, formData.deliveryDate, selectedProducts, editingId, isModalOpen, setOrders]);

  const handleSave = (bypassWarning = false) => {
    if (!formData.customerName.trim() || !formData.description.trim()) {
      showToast("Nombre y descripción son obligatorios", "error");
      return;
    }

    if (!bypassWarning && formData.isDelivered && formData.remainingAmount > 0 && !formData.remainingPaid) {
      setDebtWarning({ 
        isOpen: true, 
        amount: formData.remainingAmount, 
        onConfirm: () => handleSave(true) 
      });
      return;
    }

    try {
      // Stock Deduction Logic
      if (!editingId) {
        const updatedProducts = [...products];
        selectedProducts.forEach(sp => {
          const pIdx = updatedProducts.findIndex(p => p.id === sp.productId);
          if (pIdx !== -1) {
            updatedProducts[pIdx] = {
              ...updatedProducts[pIdx],
              stock: Math.max(0, updatedProducts[pIdx].stock - sp.quantity)
            };
          }
        });
        setProducts(updatedProducts);
      }

      if (formData.whatsapp || formData.customerName) {
        const existingIdx = customers.findIndex(c => 
          (formData.whatsapp && c.whatsapp === formData.whatsapp) || 
          (c.name.toLowerCase() === formData.customerName.toLowerCase())
        );
        
        if (existingIdx !== -1) {
          const updated = [...customers];
          updated[existingIdx] = { 
            ...updated[existingIdx], 
            totalOrders: updated[existingIdx].totalOrders + (editingId ? 0 : 1), 
            lastOrderDate: new Date().toISOString() 
          };
          setCustomers(updated);
        } else {
          const nextNumber = customers.length > 0 
            ? Math.max(...customers.map(c => c.customerNumber || 0)) + 1 
            : 1;
            
          setCustomers([...customers, { 
            id: Date.now().toString(), 
            customerNumber: nextNumber,
            name: formData.customerName, 
            whatsapp: formData.whatsapp, 
            totalOrders: 1, 
            lastOrderDate: new Date().toISOString() 
          }]);
        }
      }

      const orderData: Order = {
        id: editingId || Date.now().toString(),
        ...formData,
        linkedProducts: selectedProducts,
        createdAt: editingId ? (orders.find(o => o.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      };

      const newMovements: CashMovement[] = [];

      if (editingId) {
        const oldOrder = orders.find(o => o.id === editingId);
        if (formData.remainingPaid && !oldOrder?.remainingPaid && formData.remainingAmount > 0) {
          newMovements.push({ 
            id: `MOV-REM-${Date.now()}`, 
            date: new Date().toISOString(), 
            description: `Cobro Final: ${formData.customerName}`, 
            amount: formData.remainingAmount, 
            type: MovementType.INGRESO, 
            method: formData.remainingMethod,
            category: 'Modista'
          });
        }
        setOrders(prev => prev.map(o => o.id === editingId ? orderData : o));
      } else {
        if (formData.depositAmount > 0) {
          newMovements.push({ 
            id: `MOV-DEP-${Date.now()}`, 
            date: new Date().toISOString(), 
            description: `Seña: ${formData.customerName}`, 
            amount: formData.depositAmount, 
            type: MovementType.INGRESO, 
            method: formData.depositMethod,
            category: 'Varios'
          });
        }
        if (formData.remainingPaid && formData.remainingAmount > 0) {
          newMovements.push({ 
            id: `MOV-FULL-${Date.now() + 1}`, 
            date: new Date().toISOString(), 
            description: `Cobro Restante: ${formData.customerName}`, 
            amount: formData.remainingAmount, 
            type: MovementType.INGRESO, 
            method: formData.remainingMethod,
            category: 'Modista'
          });
        }
        setOrders(prev => [...prev, orderData]);
      }

      if (newMovements.length > 0) {
        setMovements(prev => [...newMovements, ...prev]);
      }

      showToast(editingId ? "Cambios guardados" : "Trabajo agendado", "success");
      if (!editingId) setShowSuccessModal(true);
      closeModal();
    } catch (err) {
      console.error("Error al guardar pedido:", err);
      showToast("Error al guardar el pedido", "error");
    }
  };

  const openEditModal = (order: Order) => {
    setEditingId(order.id);
    setFormData({ 
      ...order,
      contactMethod: order.contactMethod 
    });
    setSelectedProducts(order.linkedProducts || []);
    setIsModalOpen(true);
  };

  const openNewWithDate = (dateStr: string) => {
    setEditingId(null);
    setFormData({ 
      description: '', 
      customerName: '', 
      whatsapp: '', 
      deliveryDate: dateStr, 
      totalAmount: 0, 
      depositAmount: 0, 
      depositMethod: PaymentMethod.EFECTIVO, 
      remainingAmount: 0, 
      remainingMethod: PaymentMethod.EFECTIVO, 
      isDelivered: false, 
      remainingPaid: false, 
      status: 'pedido',
      contactMethod: undefined
    });
    setSelectedProducts([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
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
    if (type === 'mes') {
      setViewMode('calendar');
    } else {
      setViewMode('list');
    }
    if (type === 'personalizado') {
      const start = prompt("Fecha inicio (AAAA-MM-DD):", new Date().toLocaleDateString('en-CA'));
      const end = prompt("Fecha fin (AAAA-MM-DD):", new Date().toLocaleDateString('en-CA'));
      if (start && end) setCustomRange({ start, end });
      else setDateFilter('mes');
    }
  };

  const filteredOrders = useMemo(() => {
    const now = new Date();
    // Normalizar hoy a las 00:00:00
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = today.toLocaleDateString('en-CA');
    
    // Inicio de semana local (Domingo)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Fin de semana local (Sábado)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const cleanFilter = filter.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return orders.filter(o => {
      const name = (o.customerName || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const desc = (o.description || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const whatsapp = (o.whatsapp || "").toLowerCase();
      
      const matchesSearch = name.includes(cleanFilter) || desc.includes(cleanFilter) || whatsapp.includes(cleanFilter);
      const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'mes') {
        const orderDate = new Date(o.deliveryDate + 'T12:00:00'); 

        if (dateFilter === 'hoy') {
          matchesDate = o.deliveryDate === todayStr;
        } else if (dateFilter === 'semana') {
          matchesDate = orderDate >= startOfWeek && orderDate <= endOfWeek;
        } else if (dateFilter === 'personalizado') {
          matchesDate = o.deliveryDate >= customRange.start && o.deliveryDate <= customRange.end;
        }
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

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Estado actualizado a ${getStatusConfig(newStatus).label}`, "success");
  };

  const toggleOrderDelivery = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const willBeDelivered = !order.isDelivered;

    if (willBeDelivered && order.remainingAmount > 0 && !order.remainingPaid) {
      setDebtWarning({
        isOpen: true,
        amount: order.remainingAmount,
        onConfirm: () => {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isDelivered: true } : o));
          showToast("Marcado como entregado", "success");
          setDebtWarning(null);
        }
      });
      return;
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isDelivered: willBeDelivered } : o));
    showToast(willBeDelivered ? "Marcado como entregado" : "Marcado como pendiente de entrega", "success");
  };

  const kanbanColumns = [
    { id: 'pedido', title: 'Pendiente', color: 'bg-rose-500', icon: <Clock size={16} /> },
    { id: 'proceso', title: 'En Proceso', color: 'bg-amber-400', icon: <Sparkles size={16} /> },
    { id: 'terminado', title: 'Terminado', color: 'bg-emerald-500', icon: <CheckCircle2 size={16} /> },
    { id: 'entregado', title: 'Entregado', color: 'bg-indigo-600', icon: <Truck size={16} /> }
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-4">
          <div className="p-3 md:p-4 bg-indigo-50 text-indigo-600 rounded-2xl md:rounded-3xl shadow-inner">
            <CalendarIcon size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Agenda</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mt-1">Gestión de Producción</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-50 p-1 rounded-2xl border border-slate-200 flex shadow-sm overflow-x-auto custom-scrollbar max-w-full flex-1 md:flex-none">
            {(['todos', 'pedido', 'proceso', 'terminado'] as const).map(s => {
              const count = s === 'todos' ? orders.length : orders.filter(o => o.status === s).length;
              const isActive = statusFilter === s;
              const config = s !== 'todos' ? getStatusConfig(s as OrderStatus) : null;
              
              return (
                <button 
                  key={s} 
                  onClick={() => setStatusFilter(s)} 
                  className={`px-3 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 relative whitespace-nowrap ${isActive ? (config?.color || 'bg-slate-900 text-white shadow-lg') : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {s === 'todos' ? 'Todos' : config?.label}
                  <span className={`inline-flex items-center justify-center min-w-[16px] md:min-w-[18px] h-[16px] md:h-[18px] px-1 rounded-md text-[7px] md:text-[8px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-white p-1 rounded-2xl border border-slate-200 flex shadow-sm">
            <button onClick={() => setViewMode('calendar')} className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all relative ${viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}>
              <CalendarDays size={16} />
            </button>
            <button onClick={() => setViewMode('kanban')} className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all relative ${viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}>
              <Columns size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all relative ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}>
              <LayoutList size={16} />
            </button>
          </div>
          
          <button onClick={() => openNewWithDate(new Date().toLocaleDateString('en-CA'))} className="w-full md:w-auto flex items-center justify-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl hover:bg-black font-bold shadow-xl transition-all active:scale-95 group">
            <Plus size={20} className="md:w-6 md:h-6" />
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em]">Nuevo Trabajo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Buscar cliente o descripción..." 
            value={filter} 
            onChange={e => setFilter(e.target.value)} 
            className="pl-12 pr-6 py-4 md:py-5 border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] outline-none w-full bg-white text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300" 
          />
        </div>

        <div className="lg:col-span-7 flex flex-wrap items-center gap-4">
          <div className="bg-white p-1.5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 flex shadow-sm w-full lg:w-auto overflow-x-auto custom-scrollbar">
            {(['hoy', 'semana', 'mes', 'personalizado'] as DateFilterType[]).map(df => (
              <button 
                key={df} 
                onClick={() => handleQuickFilter(df)} 
                className={`flex-1 min-w-[80px] md:min-w-[100px] px-2 md:px-3 py-2.5 md:py-3 rounded-[1.2rem] md:rounded-[1.5rem] text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all relative ${dateFilter === df ? 'text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {dateFilter === df && <motion.div layoutId="date-filter" className="absolute inset-0 bg-indigo-50 rounded-[1.2rem] md:rounded-[1.5rem] -z-10 border border-indigo-100" />}
                {df === 'hoy' ? 'Día' : df === 'semana' ? 'Semana' : df === 'mes' ? 'Agenda' : 'Rango'}
              </button>
            ))}
          </div>
          
          <div className="bg-white p-1.5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 flex shadow-sm w-full lg:w-auto overflow-x-auto custom-scrollbar">
            {['todos', 'pedido', 'proceso', 'terminado', 'entregado'].map(s => (
              <button 
                key={s} 
                onClick={() => setStatusFilter(s as any)} 
                className={`flex-1 min-w-[80px] px-2 md:px-3 py-2.5 md:py-3 rounded-[1.2rem] md:rounded-[1.5rem] text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all relative ${statusFilter === s ? 'text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {statusFilter === s && <motion.div layoutId="status-filter" className="absolute inset-0 bg-indigo-50 rounded-[1.2rem] md:rounded-[1.5rem] -z-10 border border-indigo-100" />}
                {s === 'todos' ? 'Todos' : s === 'pedido' ? 'Pendiente' : s === 'proceso' ? 'Proceso' : s === 'terminado' ? 'Terminado' : 'Entregado'}
              </button>
            ))}
          </div>
          <div className="mt-3 px-4 md:px-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {daysRemaining} {daysRemaining === 1 ? 'día restante' : 'días restantes'}
            </span>
          </div>
        </div>
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
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
              <div className="p-6 md:p-10 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <h3 className="text-xl md:text-3xl font-black text-slate-900 capitalize tracking-tight">{currentCalendarDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</h3>
                <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between">
                  <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1)))} className="p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border border-slate-200 hover:bg-indigo-50 shadow-sm transition-colors"><ChevronLeft size={18} className="md:w-5 md:h-5"/></button>
                  <button onClick={() => setCurrentCalendarDate(new Date())} className="flex-1 md:flex-none px-4 md:px-6 py-2.5 md:py-3 bg-white rounded-xl md:rounded-2xl border border-slate-200 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 shadow-sm transition-colors">Hoy</button>
                  <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1)))} className="p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border border-slate-200 hover:bg-indigo-50 shadow-sm transition-colors"><ChevronRight size={18} className="md:w-5 md:h-5"/></button>
                </div>
              </div>
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/20">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => <div key={`${d}-${i}`} className="py-3 md:py-5 text-center text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 min-h-[400px] md:min-h-[600px] overflow-x-auto">
                {days.map((day, idx) => {
                  const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                  const dayOrders = filteredOrders.filter(o => o.deliveryDate === dateStr);
                  const todayStr = new Date().toLocaleDateString('en-CA');
                  const isToday = dateStr === todayStr;
                  return (
                    <div 
                      key={idx} 
                      className={`border-r border-b border-slate-50 p-2 md:p-4 min-h-[80px] md:min-h-[140px] transition-all flex flex-col gap-1.5 md:gap-3 group ${day ? 'bg-white hover:bg-indigo-50/30 cursor-pointer' : 'bg-slate-50/30'}`} 
                      onClick={() => day && openNewWithDate(dateStr)}
                    >
                      {day && (
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] md:text-xs font-black w-6 h-6 md:w-9 md:h-9 flex items-center justify-center rounded-lg md:rounded-2xl transition-all ${isToday ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'text-slate-300 group-hover:text-indigo-400'}`}>{day}</span>
                          {dayOrders.length > 0 && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-400 animate-pulse" />}
                        </div>
                      )}
                      <div className="flex-1 space-y-1 md:space-y-1.5 overflow-hidden">
                        {dayOrders.map(order => (
                          <motion.div 
                            layoutId={`order-${order.id}`}
                            key={order.id} 
                            onClick={(e) => { e.stopPropagation(); openEditModal(order); }} 
                            className={`px-1.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[7px] md:text-[9px] font-black truncate border shadow-sm transition-transform hover:scale-[1.02] active:scale-95 flex items-center gap-1 ${getStatusConfig(order.status, order.isDelivered).color}`}
                          >
                            {getStatusConfig(order.status, order.isDelivered).icon}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
              {kanbanColumns.map(col => {
                const colOrders = filteredOrders.filter(o => {
                  if (col.id === 'entregado') return o.isDelivered;
                  return o.status === col.id && !o.isDelivered;
                });

                return (
                  <div key={col.id} className="flex flex-col gap-6 min-w-[320px] max-w-[400px]">
                    <div className="flex items-center justify-between px-6 py-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${col.color}`} />
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl text-white shadow-lg ${col.color}`}>
                          {col.icon}
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{col.title}</h4>
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                            ${colOrders.reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-black text-slate-900">{colOrders.length}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Trabajos</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 bg-slate-50/30 p-4 rounded-[2.5rem] border border-dashed border-slate-200 min-h-[400px] overflow-y-auto custom-scrollbar pb-20">
                      {colOrders.map(order => (
                        <motion.div
                          layoutId={`order-${order.id}`}
                          key={order.id}
                          onClick={() => openEditModal(order)}
                          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${col.color}`} />
                          
                          {/* Progress Bar */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-50">
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

                          <div className="flex justify-between items-start mb-4 mt-2">
                            <div>
                              <h5 className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1">{order.customerName}</h5>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{order.deliveryTime || 'Sin hora'}</span>
                                {order.contactMethod && (
                                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 rounded-md border border-slate-100">
                                    {order.contactMethod === 'WhatsApp' && <MessageCircle size={8} className="text-emerald-500" />}
                                    {order.contactMethod === 'Instagram' && <Instagram size={8} className="text-pink-500" />}
                                    {order.contactMethod === 'Facebook' && <Facebook size={8} className="text-blue-500" />}
                                    {order.contactMethod === 'Presencial' && <Package size={8} className="text-slate-500" />}
                                    <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">{order.contactMethod}</span>
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
                                  className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-rose-700 shadow-sm"
                                >
                                  Borrar
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                                  className="p-1 bg-slate-100 text-slate-400 rounded-lg hover:text-slate-600 shadow-sm"
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
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-600 font-medium line-clamp-2 mb-6 bg-slate-50/50 p-3 rounded-xl border border-slate-100 italic">
                            "{order.description}"
                          </p>

                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-slate-400">
                                <CalendarIcon size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  {new Date(order.deliveryDate + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                              <a 
                                href={`https://wa.me/${(order.whatsapp || "").replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${order.customerName}, te escribo por tu pedido de ${order.description}...`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all shadow-sm"
                                title="Enviar WhatsApp"
                              >
                                <MessageCircle size={14} />
                              </a>
                            </div>
                            <div className="flex items-center gap-1">
                              {col.id !== 'pedido' && col.id !== 'entregado' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'pedido'); }}
                                  className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                                  title="Mover a Pendiente"
                                >
                                  <ArrowRight size={12} className="rotate-180" />
                                </button>
                              )}
                              {col.id === 'pedido' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'proceso'); }}
                                  className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-yellow-50 hover:text-yellow-600 transition-all"
                                  title="Mover a En Proceso"
                                >
                                  <ArrowRight size={12} />
                                </button>
                              )}
                              {col.id === 'proceso' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'terminado'); }}
                                  className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                                  title="Mover a Terminado"
                                >
                                  <ArrowRight size={12} />
                                </button>
                              )}
                              {col.id === 'terminado' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleOrderDelivery(order.id); }}
                                  className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                  title="Marcar como Entregado"
                                >
                                  <Truck size={12} />
                                </button>
                              )}
                              {col.id === 'entregado' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleOrderDelivery(order.id); }}
                                  className="p-1.5 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 hover:text-slate-600 transition-all"
                                  title="Desmarcar Entrega"
                                >
                                  <ArrowRight size={12} className="rotate-180" />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {colOrders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                          <Package size={24} className="mb-2 opacity-20" />
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Vacío</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <LayoutList size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {dateFilter === 'hoy' ? 'Trabajos de Hoy' : 
                       dateFilter === 'semana' ? 'Trabajos de la Semana' : 
                       dateFilter === 'mes' ? 'Agenda Completa' : 'Rango Personalizado'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {filteredOrders.length} {filteredOrders.length === 1 ? 'Trabajo encontrado' : 'Trabajos encontrados'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {filteredOrders.map(order => (
                <motion.div 
                  layoutId={`order-${order.id}`}
                  key={order.id} 
                  className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl transition-all"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-2 md:w-3 ${getStatusConfig(order.status, order.isDelivered).dot}`}></div>
                  
                  {/* Progress Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
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

                  <div className="flex justify-between items-start mb-4 md:mb-6 mt-2">
                    <div>
                      <h3 className="font-black text-slate-900 text-xl md:text-2xl tracking-tight leading-none mb-1 md:mb-2">{order.customerName}</h3>
                      <div className="flex flex-wrap items-center gap-3">
                         <div className="flex items-center gap-1.5">
                            <MessageCircle size={12} className="text-emerald-500" />
                            <span className="text-[9px] md:text-[10px] font-bold text-slate-400">{order.whatsapp}</span>
                         </div>
                         {order.contactMethod && (
                           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-lg border border-slate-100">
                              {order.contactMethod === 'WhatsApp' && <MessageCircle size={10} className="text-emerald-500" />}
                              {order.contactMethod === 'Instagram' && <Instagram size={10} className="text-pink-500" />}
                              {order.contactMethod === 'Facebook' && <Facebook size={10} className="text-blue-500" />}
                              {order.contactMethod === 'Presencial' && <Package size={10} className="text-slate-500" />}
                              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500">{order.contactMethod}</span>
                           </div>
                         )}
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest px-3 md:px-4 py-1 md:py-1.5 rounded-full border shadow-sm ${getStatusConfig(order.status, order.isDelivered).color}`}>
                      {getStatusConfig(order.status, order.isDelivered).icon}
                      {getStatusConfig(order.status, order.isDelivered).label}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium text-xs md:text-sm line-clamp-2 mb-6 md:mb-8 bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 italic">"{order.description}"</p>
                  <div className="flex justify-between items-end">
                    <div className="flex gap-4 md:gap-6">
                      <div className="flex flex-col">
                        <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Entrega</span>
                        <div className="flex items-center gap-1.5 md:gap-2 text-slate-700">
                           <CalendarIcon size={12} className="text-indigo-400 md:w-3.5 md:h-3.5" />
                           <span className="text-[10px] md:text-xs font-black">{new Date(order.deliveryDate + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Pago</span>
                        <div className="flex items-center gap-1.5 md:gap-2">
                           {order.remainingPaid ? <CheckCircle size={12} className="text-emerald-500 md:w-3.5 md:h-3.5" /> : <Clock size={12} className="text-rose-400 md:w-3.5 md:h-3.5" />}
                           <span className={`text-[10px] md:text-xs font-black ${order.remainingPaid ? 'text-emerald-600' : 'text-rose-500'}`}>
                             {order.remainingPaid ? 'Saldado' : `$${order.remainingAmount.toLocaleString()}`}
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 md:gap-2">
                      <button onClick={() => openEditModal(order)} className="p-3 md:p-4 bg-slate-100 text-slate-500 rounded-xl md:rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Edit2 size={16} className="md:w-5 md:h-5" /></button>
                      {deletingId === order.id ? (
                        <div className="flex items-center gap-1.5 md:gap-2 animate-in zoom-in duration-200">
                          <button 
                            onClick={() => {
                              setOrders(o => o.filter(x => x.id !== order.id));
                              showToast("Pedido eliminado", "success");
                              setDeletingId(null);
                            }}
                            className="px-3 md:px-4 py-2 md:py-3 bg-rose-600 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 shadow-lg"
                          >
                            Borrar
                          </button>
                          <button 
                            onClick={() => setDeletingId(null)}
                            className="p-3 md:p-4 bg-white text-slate-400 rounded-xl md:rounded-2xl border border-slate-100 hover:text-slate-600 shadow-sm"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingId(order.id)} className="p-3 md:p-4 bg-rose-50 text-rose-300 rounded-xl md:rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={16} className="md:w-5 md:h-5" /></button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-0 md:p-4 z-[100] overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white rounded-none md:rounded-[4rem] w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] md:my-8 shadow-2xl flex flex-col md:flex-row overflow-hidden"
            >
              {/* Mobile Header - Sticky */}
              <div className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{editingId ? 'Editar Pedido' : 'Nuevo Trabajo'}</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] mt-0.5">Gestión de Producción</p>
                </div>
                <button onClick={closeModal} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto md:overflow-y-hidden custom-scrollbar flex flex-col md:flex-row">
                <div className="flex-1 p-6 md:p-16 md:overflow-y-auto custom-scrollbar">
                  {/* Desktop Header - Hidden on Mobile */}
                  <div className="hidden md:flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{editingId ? 'Editar Pedido' : 'Nuevo Trabajo'}</h3>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Gestión Financiera & Producción</p>
                    </div>
                    <button onClick={closeModal} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                      <X size={24} />
                    </button>
                  </div>
                    <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5 relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</label>
                      <input 
                        type="text" 
                        value={formData.customerName} 
                        onChange={e => {
                          const val = e.target.value;
                          setFormData({...formData, customerName: val});
                          setCustomerSearch(val);
                          setShowSuggestions(val.length > 0);
                        }} 
                        onFocus={() => formData.customerName.length > 0 && setShowSuggestions(true)}
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                        placeholder="Nombre..." 
                      />
                      
                      <AnimatePresence>
                        {showSuggestions && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-60 overflow-y-auto custom-scrollbar"
                          >
                            {customers
                              .filter(c => {
                                const name = (c.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                const whatsapp = (c.whatsapp || "").toLowerCase();
                                const number = (c.customerNumber || "").toString();
                                const search = customerSearch.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                return name.includes(search) || whatsapp.includes(search) || number.includes(search);
                              })
                              .map(c => (
                                <button
                                  key={c.id}
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      customerName: c.name,
                                      whatsapp: c.whatsapp
                                    });
                                    setShowSuggestions(false);
                                  }}
                                  className="w-full text-left px-6 py-4 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-none group"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name}</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">#{c.customerNumber || 'S/N'} • {c.whatsapp}</span>
                                  </div>
                                  <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-all" />
                                </button>
                              ))}
                            {customers.filter(c => {
                              const name = (c.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                              const whatsapp = (c.whatsapp || "").toLowerCase();
                              const number = (c.customerNumber || "").toString();
                              const search = customerSearch.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                              return name.includes(search) || whatsapp.includes(search) || number.includes(search);
                            }).length === 0 && (
                              <div className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                Cliente nuevo (se asignará número)
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</label>
                      <input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="549..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medio de Contacto</label>
                      <div className="flex flex-wrap gap-2">
                        {['WhatsApp', 'Instagram', 'Facebook', 'Presencial'].map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setFormData({ ...formData, contactMethod: method as any })}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                              formData.contactMethod === method
                                ? 'bg-indigo-600 text-white border-transparent shadow-lg'
                                : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalles del Trabajo</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none min-h-[100px] focus:ring-2 focus:ring-indigo-500" placeholder="..." />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Entrega</label>
                      <input type="date" value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio Total ($)</label>
                      <input type="number" value={formData.totalAmount} onChange={e => updateAmounts(parseInt(e.target.value) || 0, formData.depositAmount)} className="w-full px-5 py-4 bg-slate-900 text-white rounded-2xl font-black outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 space-y-4 md:space-y-6 shadow-inner">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seña ($)</label>
                          <input type="number" value={formData.depositAmount} onChange={e => updateAmounts(formData.totalAmount, parseInt(e.target.value) || 0)} className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 font-bold" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Medio de Seña</label>
                          <select value={formData.depositMethod} onChange={e => setFormData({...formData, depositMethod: e.target.value as PaymentMethod})} className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 font-bold outline-none">
                             {[PaymentMethod.EFECTIVO, PaymentMethod.DIGITAL].map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                       </div>
                    </div>

                    <div className="flex justify-center pt-1 md:pt-2">
                       <div className="w-full flex justify-between items-center bg-white px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm">
                          <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Saldo Pendiente:</span>
                          <span className={`text-xl md:text-2xl font-black ${formData.remainingPaid ? 'text-emerald-600' : (formData.remainingAmount > 0 ? 'text-red-500' : 'text-emerald-600')}`}>
                            ${formData.remainingPaid ? '0' : formData.remainingAmount.toLocaleString()}
                          </span>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                       <div className="space-y-3">
                          <button onClick={() => setFormData({...formData, remainingPaid: !formData.remainingPaid})} className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${formData.remainingPaid ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:border-emerald-200'}`}>
                             {formData.remainingPaid ? <CheckCircle size={20}/> : <Wallet size={20}/>}
                             {formData.remainingPaid ? 'Saldo Cobrado' : 'Marcar Cobrado'}
                          </button>
                          {formData.remainingPaid && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-emerald-100 animate-in slide-in-from-top-2 duration-300">
                               <CreditCard size={14} className="text-emerald-500" />
                               <select 
                                 value={formData.remainingMethod} 
                                 onChange={e => setFormData({...formData, remainingMethod: e.target.value as PaymentMethod})}
                                 className="flex-1 bg-transparent text-[10px] font-black uppercase tracking-widest outline-none text-emerald-700"
                               >
                                 {[PaymentMethod.EFECTIVO, PaymentMethod.DIGITAL].map(m => <option key={m} value={m}>{m}</option>)}
                               </select>
                            </div>
                          )}
                       </div>
                       <button onClick={() => setFormData({...formData, isDelivered: !formData.isDelivered})} className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all h-[52px] ${formData.isDelivered ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-200'}`}>
                          <Truck size={20}/>
                          {formData.isDelivered ? 'Entregado' : 'Marcar Entrega'}
                       </button>
                    </div>
                  </div>
               </div>
            </div>
            
                <div className="w-full md:w-80 bg-slate-900 p-6 md:p-10 flex flex-col text-white md:overflow-y-auto custom-scrollbar">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 md:mb-8">Estado de Taller</h4>
                  <div className="space-y-6 md:flex-1 pr-2">
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Prioridad / Estado</label>
                    <div className="grid grid-cols-1 gap-2">
                        {(['pedido', 'proceso', 'terminado'] as OrderStatus[]).map(s => (
                          <button 
                            key={s} 
                            onClick={() => setFormData({...formData, status: s})} 
                            className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-center border flex items-center justify-center gap-2 ${formData.status === s ? getStatusConfig(s).color + ' border-transparent' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                          >
                             {getStatusConfig(s).icon}
                             {getStatusConfig(s).label}
                          </button>
                       ))}
                    </div>
                 </div>

                  <div className="space-y-4 pt-6 border-t border-slate-800">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Materiales vinculados</label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                      {selectedProducts.map((sp, idx) => {
                        const product = products.find(p => p.id === sp.productId);
                        const availableStock = product ? product.stock : 0;
                        
                        return (
                          <div key={idx} className="bg-slate-800 p-3 rounded-xl space-y-2 border border-slate-700">
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold truncate pr-2">{sp.name}</span>
                                <button onClick={() => setSelectedProducts(p => p.filter(x => x.productId !== sp.productId))} className="text-red-400 hover:text-red-300 transition-colors">
                                  <Trash2 size={14}/>
                                </button>
                             </div>
                             <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-[8px] text-slate-500 uppercase font-black">Cantidad</span>
                                  <span className="text-[7px] text-indigo-400 font-bold uppercase tracking-tighter">Stock: {availableStock}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => setSelectedProducts(prev => prev.map((p, i) => i === idx ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p))}
                                    className="w-6 h-6 flex items-center justify-center bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                                  >
                                    <Minus size={10} />
                                  </button>
                                  <input 
                                    type="number" 
                                    value={sp.quantity} 
                                    onChange={(e) => {
                                      let val = parseInt(e.target.value) || 1;
                                      if (val > availableStock) val = availableStock;
                                      if (val < 1) val = 1;
                                      setSelectedProducts(prev => prev.map((p, i) => i === idx ? { ...p, quantity: val } : p));
                                    }}
                                    className="w-10 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-center font-bold py-1 outline-none focus:border-indigo-500"
                                  />
                                  <button 
                                    onClick={() => {
                                      if (sp.quantity < availableStock) {
                                        setSelectedProducts(prev => prev.map((p, i) => i === idx ? { ...p, quantity: p.quantity + 1 } : p));
                                      } else {
                                        showToast("Stock máximo alcanzado", "error");
                                      }
                                    }}
                                    disabled={sp.quantity >= availableStock}
                                    className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${sp.quantity >= availableStock ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                                  >
                                    <Plus size={10} />
                                  </button>
                                </div>
                             </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4">
                       <p className="text-[8px] font-black text-slate-500 uppercase mb-2">Agregar Insumos</p>
                       <div className="grid grid-cols-1 gap-1.5 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                          {products.map(p => {
                             const isSelected = selectedProducts.some(sp => sp.productId === p.id);
                             const outOfStock = p.stock <= 0;
                             
                             return (
                               <button 
                                 key={p.id} 
                                 disabled={isSelected || outOfStock}
                                 onClick={() => {
                                   if (p.stock > 0) {
                                     setSelectedProducts([...selectedProducts, { productId: p.id, name: p.name, quantity: 1 }]);
                                   } else {
                                     showToast("Sin stock disponible", "error");
                                   }
                                 }} 
                                 className={`w-full text-left p-2.5 rounded-lg text-[9px] transition-all border flex items-center justify-between ${isSelected || outOfStock ? 'bg-slate-800/50 border-slate-700 text-slate-600 cursor-not-allowed' : 'bg-slate-800 border-transparent hover:border-slate-600 text-slate-300 hover:bg-slate-700'}`}
                               >
                                  <div className="flex flex-col truncate">
                                    <span className="truncate">{p.name}</span>
                                    <span className={`text-[7px] font-black uppercase ${outOfStock ? 'text-red-500' : 'text-slate-500'}`}>
                                      Stock: {p.stock}
                                    </span>
                                  </div>
                                  {isSelected ? <Check size={12} /> : outOfStock ? <AlertCircle size={12} className="text-red-500" /> : <Plus size={12} />}
                               </button>
                             );
                          })}
                       </div>
                    </div>
                 </div>
              </div>
              
                  <div className="space-y-3 pt-6 md:pt-10 mt-6 md:mt-auto border-t border-slate-800 hidden md:block">
                    <button onClick={() => handleSave()} className="w-full py-4 md:py-5 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:bg-indigo-400 transition-all active:scale-95">Guardar Todo</button>
                    <button onClick={closeModal} className="w-full py-3 md:py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Cerrar</button>
                  </div>
                </div>
              </div>

              {/* Mobile Footer - Sticky */}
              <div className="md:hidden sticky bottom-0 z-50 bg-white px-6 py-4 border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <button onClick={() => handleSave()} className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 transition-all active:scale-95">
                  Guardar Trabajo
                </button>
              </div>
            </motion.div>
        </div>
      )}
      </AnimatePresence>
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
