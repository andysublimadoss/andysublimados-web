
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MessageCircle, Trash2, User, Phone, X, Save, Edit2, Users, AlertCircle, ArrowRight, Eye, Calendar, ShoppingBag, CheckCircle2, Clock, Package, Sparkles, Truck, CreditCard, Plus, FileText } from 'lucide-react';
import { Customer, Order } from '../types';

interface CustomersListProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  orders: Order[];
  showToast?: (msg: string, type: 'success' | 'error') => void;
  onNavigate?: (tab: any) => void;
}

const CustomersList: React.FC<CustomersListProps> = ({ customers, setCustomers, orders, showToast, onNavigate }) => {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Customer | 'totalSpent'; direction: 'asc' | 'desc' } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '', whatsapp: '', customerNumber: 0, notes: '' });

  const handleSort = (key: keyof Customer | 'totalSpent') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredCustomers = React.useMemo(() => {
    let result = customers.filter(c => {
      const name = (c.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const whatsapp = (c.whatsapp || "");
      const cleanFilter = filter.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      return name.includes(cleanFilter) || whatsapp.includes(filter.trim());
    });

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'totalSpent') {
          aValue = orders.filter(o => o.customerName === a.name).reduce((sum, o) => sum + o.totalAmount, 0);
          bValue = orders.filter(o => o.customerName === b.name).reduce((sum, o) => sum + o.totalAmount, 0);
        } else {
          aValue = a[sortConfig.key as keyof Customer];
          bValue = b[sortConfig.key as keyof Customer];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [customers, filter, sortConfig, orders]);

  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (customerToDelete) {
      setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
      showToast?.("Cliente eliminado", "success");
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ 
      name: customer.name, 
      whatsapp: customer.whatsapp, 
      customerNumber: customer.customerNumber || 0,
      notes: customer.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCustomer(null);
  };

  // Autosave effect for editing
  React.useEffect(() => {
    if (isEditModalOpen && editingCustomer && formData.name.trim()) {
      const timer = setTimeout(() => {
        setCustomers(prev => prev.map(c => 
          c.id === editingCustomer.id 
            ? { ...c, name: formData.name, whatsapp: formData.whatsapp, customerNumber: formData.customerNumber, notes: formData.notes } 
            : c
        ));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData, editingCustomer, isEditModalOpen, setCustomers]);

  const handleSaveEdit = () => {
    if (!formData.name.trim()) {
      showToast?.("El nombre es obligatorio", "error");
      return;
    }

    if (editingCustomer) {
      setCustomers(prev => prev.map(c => 
        c.id === editingCustomer.id 
          ? { ...c, name: formData.name, whatsapp: formData.whatsapp, customerNumber: formData.customerNumber, notes: formData.notes } 
          : c
      ));
      showToast?.("Datos actualizados correctamente", "success");
      closeEditModal();
    }
  };

  const openWhatsApp = (phone: string, message?: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const url = message 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/${cleanPhone}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="p-3 md:p-4 bg-indigo-50 text-indigo-600 rounded-2xl md:rounded-3xl shadow-inner">
            <Users size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Clientes</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mt-1">Directorio histórico</p>
          </div>
        </div>
        <div className="relative w-full lg:w-[450px]">
          <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} md:size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o celular..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] outline-none shadow-inner focus:ring-4 focus:ring-indigo-500/5 font-bold text-sm transition-all placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[4rem] shadow-2xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-slate-50/50 text-left text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-6 md:px-12 py-5 md:py-8 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('customerNumber')}>
                  <div className="flex items-center gap-2">
                    N° {sortConfig?.key === 'customerNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="px-6 md:px-12 py-5 md:py-8 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Cliente {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="px-6 md:px-12 py-5 md:py-8">WhatsApp</th>
                <th className="px-6 md:px-12 py-5 md:py-8 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('totalOrders')}>
                  <div className="flex items-center gap-2">
                    Pedidos {sortConfig?.key === 'totalOrders' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="px-6 md:px-12 py-5 md:py-8 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('lastOrderDate')}>
                  <div className="flex items-center gap-2">
                    Última Compra {sortConfig?.key === 'lastOrderDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="px-6 md:px-12 py-5 md:py-8 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredCustomers.map((customer, idx) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    key={customer.id} 
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-6 md:px-12 py-5 md:py-8">
                      <span className="text-[10px] md:text-xs font-black text-slate-400 bg-slate-100 px-2 md:px-3 py-1 md:py-1.5 rounded-lg">
                        #{customer.customerNumber || '---'}
                      </span>
                    </td>
                    <td className="px-6 md:px-12 py-5 md:py-8">
                      <div className="flex items-center space-x-3 md:space-x-5">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-white text-indigo-600 rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-lg md:shadow-xl shadow-indigo-100/50 border border-indigo-50">
                          <User size={20} md:size={28} />
                        </div>
                        <span className="font-black text-slate-800 text-sm md:text-lg tracking-tight whitespace-nowrap">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-12 py-5 md:py-8">
                      <button 
                        onClick={() => openWhatsApp(customer.whatsapp)}
                        className="flex items-center space-x-2 md:space-x-3 text-emerald-600 font-black text-[9px] md:text-[11px] uppercase tracking-widest bg-emerald-50/50 px-3 md:px-5 py-2 md:py-2.5 rounded-xl md:rounded-2xl border border-transparent hover:border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm whitespace-nowrap"
                      >
                        <MessageCircle size={14} md:size={18} />
                        <span>{customer.whatsapp}</span>
                      </button>
                    </td>
                    <td className="px-6 md:px-12 py-5 md:py-8">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 rounded-lg md:rounded-xl flex items-center justify-center shadow-inner">
                           <Users size={14} md:size={18} className="text-slate-400" />
                        </div>
                        <span className="text-xs md:text-sm font-black text-slate-600 whitespace-nowrap">
                          {customer.totalOrders} {customer.totalOrders === 1 ? 'Pedido' : 'Pedidos'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 md:px-12 py-5 md:py-8">
                      <div className="flex flex-col">
                        <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5 md:mb-1">Fecha</span>
                        <span className="text-sm md:text-base font-black text-slate-500 whitespace-nowrap">
                          {new Date(customer.lastOrderDate).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 md:px-12 py-5 md:py-8 text-right">
                      <div className="flex justify-end space-x-2 md:space-x-3">
                        <button 
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsHistoryModalOpen(true);
                          }}
                          className="p-2.5 md:p-4 bg-white text-emerald-500 border border-slate-100 rounded-xl md:rounded-2xl shadow-lg hover:bg-emerald-600 hover:text-white transition-all transform hover:-translate-y-1 active:scale-90"
                          title="Ver historial"
                        >
                          <Eye size={16} md:size={20} />
                        </button>
                        <button 
                          onClick={() => openEditModal(customer)}
                          className="p-2.5 md:p-4 bg-white text-indigo-500 border border-slate-100 rounded-xl md:rounded-2xl shadow-lg hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1 active:scale-90"
                          title="Editar datos"
                        >
                          <Edit2 size={16} md:size={20} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(customer)}
                          className="p-2.5 md:p-4 bg-white text-rose-300 border border-slate-100 rounded-xl md:rounded-2xl shadow-lg hover:bg-rose-500 hover:text-white transition-all transform hover:-translate-y-1 active:scale-90"
                          title="Eliminar de la lista"
                        >
                          <Trash2 size={16} md:size={20} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 md:px-12 py-20 md:py-32 text-center">
                    <div className="flex flex-col items-center max-w-sm mx-auto">
                      <div className="p-6 md:p-10 bg-slate-50 rounded-full mb-6 md:mb-8 text-slate-200 animate-pulse">
                        <Users size={48} md:size={80} />
                      </div>
                      <h4 className="font-black text-slate-900 text-xl md:text-2xl tracking-tight mb-2 md:mb-3">Sin coincidencias</h4>
                      <p className="font-bold text-slate-400 uppercase tracking-widest text-[9px] md:text-[11px] leading-relaxed">
                        No encontramos clientes con ese nombre o teléfono.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Perfil Detallado de Cliente */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedCustomer && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-0 md:p-4 z-[110] overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-none md:rounded-[4rem] w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header del Perfil */}
              <div className="relative h-32 md:h-48 bg-indigo-600 shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-indigo-600 to-indigo-800 opacity-90" />
                <div className="absolute -bottom-12 md:-bottom-16 left-6 md:left-12 flex items-end gap-4 md:gap-8">
                  <div className="w-24 h-24 md:w-40 md:h-40 bg-white rounded-[2rem] md:rounded-[3rem] p-1.5 md:p-2 shadow-2xl border-4 border-white">
                    <div className="w-full h-full bg-indigo-50 text-indigo-600 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center">
                      <User size={40} className="md:w-20 md:h-20" />
                    </div>
                  </div>
                  <div className="mb-4 md:mb-6">
                    <h3 className="text-2xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">{selectedCustomer.name}</h3>
                    <div className="flex items-center gap-3 mt-1 md:mt-2">
                      <span className="px-2 md:px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                        #{selectedCustomer.customerNumber || '---'}
                      </span>
                      <span className="flex items-center gap-1.5 text-indigo-100 text-[9px] md:text-[11px] font-bold">
                        <Phone size={12} />
                        {selectedCustomer.whatsapp}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsHistoryModalOpen(false)} 
                  className="absolute top-6 right-6 md:top-10 md:right-10 p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl text-white hover:bg-white/20 transition-all border border-white/10"
                >
                  <X size={20} md:size={24}/>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pt-16 md:pt-24 px-6 md:px-12 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                  {/* Columna Izquierda: Estadísticas y Preferencias */}
                  <div className="lg:col-span-4 space-y-8 md:space-y-10">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-5 md:p-6 rounded-3xl border border-slate-100">
                        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pedidos</p>
                        <p className="text-xl md:text-3xl font-black text-slate-900">{selectedCustomer.totalOrders}</p>
                      </div>
                      <div className="bg-indigo-50 p-5 md:p-6 rounded-3xl border border-indigo-100">
                        <p className="text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Invertido</p>
                        <p className="text-xl md:text-3xl font-black text-indigo-600">
                          ${orders
                            .filter(o => o.customerName === selectedCustomer.name)
                            .reduce((sum, o) => sum + o.totalAmount, 0)
                            .toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-5 md:p-6 rounded-3xl border border-slate-100">
                        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Promedio</p>
                        <p className="text-lg md:text-2xl font-black text-slate-900">
                          ${selectedCustomer.totalOrders > 0 
                            ? Math.round(orders
                                .filter(o => o.customerName === selectedCustomer.name)
                                .reduce((sum, o) => sum + o.totalAmount, 0) / selectedCustomer.totalOrders).toLocaleString()
                            : 0}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-5 md:p-6 rounded-3xl border border-slate-100">
                        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Última Visita</p>
                        <p className="text-xs md:text-sm font-black text-slate-900">
                          {new Date(selectedCustomer.lastOrderDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Notas del Cliente */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                          <FileText size={18} />
                        </div>
                        <h4 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">Notas y Preferencias</h4>
                      </div>
                      {selectedCustomer.notes ? (
                        <p className="text-xs md:text-sm font-bold text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          {selectedCustomer.notes}
                        </p>
                      ) : (
                        <p className="text-center text-[10px] font-bold text-slate-400 py-4 italic">Sin notas registradas</p>
                      )}
                      <button 
                        onClick={() => {
                          setIsHistoryModalOpen(false);
                          openEditModal(selectedCustomer);
                        }}
                        className="w-full mt-4 py-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        Editar Notas
                      </button>
                    </div>

                    {/* Acciones Rápidas WhatsApp */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                          <MessageCircle size={18} />
                        </div>
                        <h4 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">Mensajes Rápidos</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <button 
                          onClick={() => {
                            setIsHistoryModalOpen(false);
                            onNavigate?.('agenda');
                          }}
                          className="flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100 rounded-2xl border border-indigo-100 transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <Plus size={14} className="text-indigo-600" />
                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Nuevo Pedido</span>
                          </div>
                          <ArrowRight size={14} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                        {[
                          { label: "Pedido Listo", msg: `¡Hola ${selectedCustomer.name}! Tu pedido en Andy Sublimados ya está listo para retirar. 😊` },
                          { label: "En Proceso", msg: `¡Hola ${selectedCustomer.name}! Te contamos que ya estamos trabajando en tu pedido. 🎨` },
                          { label: "Bienvenida", msg: `¡Hola ${selectedCustomer.name}! Gracias por contactarte con Andy Sublimados. ¿En qué podemos ayudarte hoy?` }
                        ].map(action => (
                          <button 
                            key={action.label}
                            onClick={() => openWhatsApp(selectedCustomer.whatsapp, action.msg)}
                            className="flex items-center justify-between p-3 bg-emerald-50/50 hover:bg-emerald-100/50 rounded-2xl border border-emerald-100/50 transition-all group"
                          >
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{action.label}</span>
                            <ArrowRight size={14} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Productos Preferidos */}
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                          <Sparkles size={18} />
                        </div>
                        <h4 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">Productos Preferidos</h4>
                      </div>
                      <div className="space-y-3">
                        {(() => {
                          const productCounts: Record<string, number> = {};
                          orders
                            .filter(o => o.customerName === selectedCustomer.name)
                            .forEach(o => {
                              o.linkedProducts?.forEach(p => {
                                productCounts[p.name] = (productCounts[p.name] || 0) + p.quantity;
                              });
                            });
                          
                          const sortedProducts = Object.entries(productCounts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5);

                          return sortedProducts.length > 0 ? sortedProducts.map(([name, count], idx) => (
                            <div key={name} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 flex items-center justify-center bg-white rounded-lg text-[10px] font-black text-slate-400 border border-slate-100">{idx + 1}</span>
                                <span className="text-[10px] md:text-xs font-bold text-slate-700 truncate max-w-[120px]">{name}</span>
                              </div>
                              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{count} u.</span>
                            </div>
                          )) : (
                            <p className="text-center text-[10px] font-bold text-slate-400 py-4 italic">Sin datos de productos</p>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Historial de Pedidos */}
                  <div className="lg:col-span-8 space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                          <ShoppingBag size={18} />
                        </div>
                        <h4 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">Historial de Pedidos</h4>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{orders.filter(o => o.customerName === selectedCustomer.name).length} registros</span>
                    </div>

                    <div className="space-y-4">
                      {orders.filter(o => o.customerName === selectedCustomer.name).length > 0 ? (
                        orders
                          .filter(o => o.customerName === selectedCustomer.name)
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((order) => (
                            <div key={order.id} className="group bg-white hover:bg-slate-50 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                              <div className="flex items-start gap-4 md:gap-6">
                                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl shadow-inner ${
                                  order.status === 'terminado' ? 'bg-emerald-50 text-emerald-600' : 
                                  order.status === 'proceso' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                                }`}>
                                  <Package size={20} md:size={24} />
                                </div>
                                <div>
                                  <h4 className="text-lg md:text-xl font-black text-slate-800 mb-1 md:mb-2 group-hover:text-indigo-600 transition-colors">{order.description}</h4>
                                  <div className="flex flex-wrap gap-3 md:gap-6">
                                    <div className="flex items-center gap-1.5 md:gap-2 text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                                      <Calendar size={10} md:size={12} className="text-indigo-400" />
                                      {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 md:gap-2 text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                                      <Truck size={10} md:size={12} className="text-amber-400" />
                                      Entrega: {new Date(order.deliveryDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 md:gap-2 text-slate-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                                      <CreditCard size={10} md:size={12} className="text-emerald-400" />
                                      {order.remainingPaid ? 'Saldado' : 'Pendiente'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2 md:gap-3 w-full md:w-auto">
                                <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 ${
                                  order.status === 'terminado' ? 'bg-emerald-500 text-white' : 
                                  order.status === 'proceso' ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'
                                }`}>
                                  {order.status === 'terminado' ? <CheckCircle2 size={10} md:size={12} /> : <Clock size={10} md:size={12} />}
                                  {order.status}
                                </div>
                                <span className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter">${order.totalAmount.toLocaleString()}</span>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-12 md:py-24 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                          <div className="p-6 md:p-10 bg-white rounded-full mb-6 md:mb-8 text-slate-200 inline-block shadow-xl">
                            <ShoppingBag size={40} md:size={60} />
                          </div>
                          <h4 className="font-black text-slate-900 text-lg md:text-xl tracking-tight mb-1 md:mb-2">Sin historial</h4>
                          <p className="font-bold text-slate-400 uppercase tracking-widest text-[8px] md:text-[10px]">Este cliente aún no tiene pedidos registrados.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-12 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 flex justify-end shrink-0">
                <button 
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="w-full md:w-auto px-12 md:px-16 py-4 md:py-6 bg-slate-900 text-white rounded-2xl md:rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] md:text-sm hover:bg-black transition-all active:scale-95 shadow-2xl"
                >
                  Cerrar Perfil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Edición */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110] overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 md:p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Edit2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Editar Cliente</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mt-1">Actualizar información de contacto</p>
                  </div>
                </div>
                <button onClick={closeEditModal} className="p-4 bg-white rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-all border border-slate-100"><X size={24}/></button>
              </div>
              
              <div className="p-8 md:p-12 space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">N° de Cliente</label>
                  <div className="relative">
                    <Package className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="number" 
                      value={formData.customerNumber} 
                      onChange={e => setFormData({...formData, customerNumber: parseInt(e.target.value) || 0})} 
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 text-slate-700 text-sm transition-all" 
                      placeholder="Número de legajo..." 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 text-slate-700 text-sm transition-all" 
                      placeholder="Ej: Juan Pérez" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                    <input 
                      type="text" 
                      value={formData.whatsapp} 
                      onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 text-slate-700 text-sm transition-all" 
                      placeholder="Ej: 54911..." 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Notas y Preferencias</label>
                  <div className="relative">
                    <FileText className="absolute left-6 top-6 text-slate-400" size={18} />
                    <textarea 
                      value={formData.notes} 
                      onChange={e => setFormData({...formData, notes: e.target.value})} 
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 text-slate-700 text-sm transition-all min-h-[120px]" 
                      placeholder="Ej: Prefiere remeras de algodón, siempre paga en efectivo..." 
                    />
                  </div>
                </div>

                <div className="p-6 md:p-8 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-4 md:gap-6">
                   <div className="bg-white p-3 rounded-xl shadow-sm text-amber-500 h-fit">
                      <AlertCircle size={20}/>
                   </div>
                   <p className="text-[9px] font-black text-amber-700 leading-relaxed uppercase tracking-widest">
                      Nota: Los cambios solo afectan la base de datos de clientes. Los pedidos existentes mantendrán el nombre original por integridad histórica.
                   </p>
                </div>
              </div>

              <div className="p-8 md:p-12 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                <button 
                  onClick={closeEditModal}
                  className="flex-1 py-5 bg-white text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all border border-slate-200"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación de Eliminación */}
      <AnimatePresence>
        {isDeleteModalOpen && customerToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[120]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl p-8 md:p-12 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4">¿Eliminar Cliente?</h3>
              <p className="text-slate-500 font-bold text-sm md:text-base leading-relaxed mb-10">
                Estás por eliminar a <span className="text-slate-900 font-black">{customerToDelete.name}</span> de la base de datos. 
                <br /><br />
                <span className="text-[10px] text-rose-400 uppercase tracking-widest font-black">Esta acción no se puede deshacer.</span>
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDelete}
                  className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 active:scale-95"
                >
                  Sí, Eliminar Cliente
                </button>
                <button 
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setCustomerToDelete(null);
                  }}
                  className="w-full py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomersList;
