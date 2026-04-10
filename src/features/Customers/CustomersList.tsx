import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MessageCircle,
  Trash2,
  User,
  Phone,
  X,
  Save,
  Edit2,
  Users,
  AlertCircle,
  Eye,
  Calendar,
  ShoppingBag,
  FileText,
  Mail,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Customer, Order } from '@/types';
import { customersService } from '@/services/supabase';

interface CustomersListProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  orders: Order[];
  showToast?: (msg: string, type: 'success' | 'error') => void;
  onNavigate?: (tab: any) => void;
}

type SortKey = keyof Customer | 'totalSpent';
type SortDirection = 'asc' | 'desc';

const CustomersList: React.FC<CustomersListProps> = ({
  customers,
  setCustomers,
  orders,
  showToast,
  onNavigate
}) => {
  const [filter, setFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    customerNumber: 0,
    notes: ''
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedCustomers = React.useMemo(() => {
    let result = customers.filter(c => {
      const name = (c.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const whatsapp = (c.whatsapp || "");
      const cleanFilter = filter.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      return name.includes(cleanFilter) || whatsapp.includes(filter.trim());
    });

    if (sortKey) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortKey === 'totalSpent') {
          aValue = orders.filter(o => o.customerName === a.name).reduce((sum, o) => sum + o.totalAmount, 0);
          bValue = orders.filter(o => o.customerName === b.name).reduce((sum, o) => sum + o.totalAmount, 0);
        } else {
          aValue = a[sortKey as keyof Customer];
          bValue = b[sortKey as keyof Customer];
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [customers, filter, sortKey, sortDirection, orders]);

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5 inline ml-1" /> : <ChevronDown className="h-3.5 w-3.5 inline ml-1" />;
  };

  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (customerToDelete) {
      try {
        // Eliminar en Supabase
        await customersService.delete(customerToDelete.id);
        // Actualizar estado local
        setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
        showToast?.("Cliente eliminado", "success");
        setIsDeleteModalOpen(false);
        setCustomerToDelete(null);
      } catch (error) {
        console.error('Error deleting customer:', error);
        showToast?.("Error al eliminar el cliente", "error");
      }
    }
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      whatsapp: customer.whatsapp,
      email: customer.email || '',
      customerNumber: customer.customerNumber || 0,
      notes: customer.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSaveEdit = async () => {
    if (!formData.name.trim()) {
      showToast?.("El nombre es obligatorio", "error");
      return;
    }

    if (editingCustomer) {
      try {
        // Actualizar en Supabase
        const updated = await customersService.update(editingCustomer.id, {
          name: formData.name,
          whatsapp: formData.whatsapp,
          email: formData.email,
          customerNumber: formData.customerNumber,
          notes: formData.notes
        });
        // Actualizar estado local
        setCustomers(prev => prev.map(c =>
          c.id === editingCustomer.id ? updated : c
        ));
        showToast?.("Datos actualizados correctamente", "success");
        closeEditModal();
      } catch (error) {
        console.error('Error saving customer:', error);
        showToast?.("Error al guardar el cliente", "error");
      }
    }
  };

  const openWhatsApp = (phone: string, message?: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const url = message
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/${cleanPhone}`;
    window.open(url, '_blank');
  };

  const getCustomerOrders = (customerName: string) => {
    return orders.filter(o => o.customerName === customerName);
  };

  const getCustomerTotalSpent = (customerName: string) => {
    return getCustomerOrders(customerName).reduce((sum, o) => sum + o.totalAmount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Clientes</h2>
            <p className="text-sm text-neutral-500 mt-0.5">
              {filteredAndSortedCustomers.length} {filteredAndSortedCustomers.length === 1 ? 'cliente' : 'clientes'}
            </p>
          </div>
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b-2 border-neutral-300 bg-neutral-100">
                <th
                  onClick={() => handleSort('customerNumber')}
                  className="border-r border-neutral-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-700 cursor-pointer hover:bg-neutral-150 transition-colors"
                >
                  N° {getSortIcon('customerNumber')}
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="border-r border-neutral-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-700 cursor-pointer hover:bg-neutral-150 transition-colors"
                >
                  Cliente {getSortIcon('name')}
                </th>
                <th className="border-r border-neutral-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-700">
                  Contacto
                </th>
                <th
                  onClick={() => handleSort('totalOrders')}
                  className="border-r border-neutral-200 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-neutral-700 cursor-pointer hover:bg-neutral-150 transition-colors"
                >
                  Pedidos {getSortIcon('totalOrders')}
                </th>
                <th
                  onClick={() => handleSort('totalSpent')}
                  className="border-r border-neutral-200 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-neutral-700 cursor-pointer hover:bg-neutral-150 transition-colors"
                >
                  Total Gastado {getSortIcon('totalSpent')}
                </th>
                <th
                  onClick={() => handleSort('lastOrderDate')}
                  className="border-r border-neutral-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-700 cursor-pointer hover:bg-neutral-150 transition-colors"
                >
                  Última Compra {getSortIcon('lastOrderDate')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-neutral-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredAndSortedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="h-12 w-12 text-neutral-300 mb-3" />
                      <p className="text-sm font-medium text-neutral-600">
                        No se encontraron clientes
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Ajusta los filtros de búsqueda
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-neutral-200 transition-colors hover:bg-neutral-50"
                  >
                    <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3">
                      <span className="inline-flex items-center rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600">
                        #{customer.customerNumber || '---'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <User size={16} />
                        </div>
                        <span className="font-medium text-neutral-900">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {customer.whatsapp && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openWhatsApp(customer.whatsapp);
                            }}
                            className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>{customer.whatsapp}</span>
                          </button>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="max-w-[180px] truncate">{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                        <ShoppingBag className="h-3 w-3" />
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3 text-right">
                      <span className="font-semibold text-neutral-900">
                        ${getCustomerTotalSpent(customer.name).toLocaleString()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap border-r border-neutral-200 px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(customer.lastOrderDate).toLocaleDateString('es-AR')}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsHistoryModalOpen(true);
                          }}
                          className="inline-flex items-center rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-indigo-600"
                          title="Ver historial"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(customer)}
                          className="inline-flex items-center rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-indigo-600"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(customer)}
                          className="inline-flex items-center rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Historial */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">{selectedCustomer.name}</h3>
                    <p className="text-sm text-neutral-500">Cliente #{selectedCustomer.customerNumber || '---'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Total Pedidos</p>
                    <p className="text-2xl font-bold text-neutral-900">{selectedCustomer.totalOrders}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4">
                    <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">Total Invertido</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      ${getCustomerTotalSpent(selectedCustomer.name).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Ticket Promedio</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      ${selectedCustomer.totalOrders > 0
                        ? Math.round(getCustomerTotalSpent(selectedCustomer.name) / selectedCustomer.totalOrders).toLocaleString()
                        : 0}
                    </p>
                  </div>
                </div>

                {/* Notas */}
                {selectedCustomer.notes && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <FileText size={16} className="text-neutral-500" />
                      Notas
                    </h4>
                    <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
                      <p className="text-sm text-neutral-700">{selectedCustomer.notes}</p>
                    </div>
                  </div>
                )}

                {/* Historial */}
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-neutral-500" />
                    Historial de Pedidos ({getCustomerOrders(selectedCustomer.name).length})
                  </h4>
                  <div className="space-y-3">
                    {getCustomerOrders(selectedCustomer.name).length > 0 ? (
                      getCustomerOrders(selectedCustomer.name)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((order) => (
                          <div
                            key={order.id}
                            className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-neutral-900">{order.description}</h5>
                              <span className="text-lg font-bold text-neutral-900">
                                ${order.totalAmount.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex gap-4 text-xs text-neutral-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(order.createdAt).toLocaleDateString('es-AR')}
                              </span>
                              <span>Estado: {order.status}</span>
                              <span>{order.remainingPaid ? 'Saldado' : 'Pendiente'}</span>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                        <ShoppingBag className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                        <p className="text-sm text-neutral-500">Sin historial de pedidos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-neutral-200 flex justify-end bg-neutral-50">
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Edición */}
      <AnimatePresence>
        {isEditModalOpen && editingCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Edit2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">Editar Cliente</h3>
                    <p className="text-xs text-neutral-500">Actualizar información</p>
                  </div>
                </div>
                <button
                  onClick={closeEditModal}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                    N° de Cliente
                  </label>
                  <input
                    type="number"
                    value={formData.customerNumber}
                    onChange={e => setFormData({...formData, customerNumber: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="Número..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="1123456789"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="cliente@email.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 uppercase tracking-wide mb-2">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    placeholder="Notas y preferencias..."
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-200 flex gap-3 bg-neutral-50">
                <button
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2.5 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmación de Eliminación */}
      <AnimatePresence>
        {isDeleteModalOpen && customerToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <AlertCircle size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">Eliminar Cliente</h3>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-neutral-600 mb-4">
                  ¿Estás seguro de que deseas eliminar a <strong>{customerToDelete.name}</strong>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-xs text-red-800">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-neutral-200 flex gap-3 bg-neutral-50">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Eliminar
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
