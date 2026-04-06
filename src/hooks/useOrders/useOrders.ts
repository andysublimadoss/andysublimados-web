import React from 'react';

import { useState } from 'react';
import { Order, OrderStatus, OrderProduct, Customer, Product, CashMovement, MovementType, PaymentMethod } from '@/types';
import { useDebounce } from '../useDebounce';
import { ordersService, productsService, customersService, cashMovementsService } from '@/services/supabase';

export interface UseOrdersProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setMovements: React.Dispatch<React.SetStateAction<CashMovement[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export function useOrders({
  orders,
  setOrders,
  setMovements,
  customers,
  setCustomers,
  products,
  setProducts,
  showToast
}: UseOrdersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([]);
  const [debtWarning, setDebtWarning] = useState<{ isOpen: boolean, amount: number, onConfirm: () => void } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    customerName: '',
    whatsapp: '',
    customerEmail: '',
    customerNotes: '',
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

  // Autosave for non-financial fields
  useDebounce(() => {
    if (isModalOpen && editingId && formData.customerName.trim() && formData.description.trim()) {
      // Actualizar en Supabase
      ordersService.update(editingId, {
        description: formData.description,
        customerName: formData.customerName,
        whatsapp: formData.whatsapp,
        deliveryDate: formData.deliveryDate,
        linkedProducts: selectedProducts
      }).catch(err => {
        console.error('Error updating order:', err);
      });
      // Actualizar estado local
      setOrders(prev => prev.map(o => o.id === editingId ? {
        ...o,
        description: formData.description,
        customerName: formData.customerName,
        whatsapp: formData.whatsapp,
        deliveryDate: formData.deliveryDate,
        linkedProducts: selectedProducts
      } : o));
    }
  }, [formData.description, formData.customerName, formData.whatsapp, formData.deliveryDate, selectedProducts, editingId, isModalOpen], 500);

  const updateAmounts = (total: number, deposit: number) => {
    const remaining = Math.max(0, total - deposit);
    setFormData(prev => ({
      ...prev,
      totalAmount: total,
      depositAmount: deposit,
      remainingAmount: remaining
    }));
  };

  const deductStock = async (linkedProducts: OrderProduct[]) => {
    const updatedProducts = [...products];
    for (const sp of linkedProducts) {
      const pIdx = updatedProducts.findIndex(p => p.id === sp.productId);
      if (pIdx !== -1) {
        const newStock = Math.max(0, updatedProducts[pIdx].stock - sp.quantity);
        // Actualizar en Supabase
        await productsService.updateStock(sp.productId, newStock);
        // Actualizar estado local
        updatedProducts[pIdx] = {
          ...updatedProducts[pIdx],
          stock: newStock
        };
      }
    }
    setProducts(updatedProducts);
  };

  const autoCreateOrUpdateCustomer = async (customerName: string, whatsapp: string, email: string, notes: string, isNewOrder: boolean): Promise<string> => {
    const existingIdx = customers.findIndex(c =>
      (whatsapp && c.whatsapp === whatsapp) ||
      (c.name.toLowerCase() === customerName.toLowerCase())
    );

    if (existingIdx !== -1) {
      const existing = customers[existingIdx];
      const updatedCustomer = {
        ...existing,
        name: customerName,
        whatsapp: whatsapp,
        email: email || existing.email,
        notes: notes || existing.notes,
        totalOrders: existing.totalOrders + (isNewOrder ? 1 : 0),
        lastOrderDate: new Date().toISOString()
      };
      // Actualizar en Supabase
      await customersService.update(existing.id, updatedCustomer);
      // Actualizar estado local
      const updated = [...customers];
      updated[existingIdx] = updatedCustomer;
      setCustomers(updated);
      return existing.id;
    } else {
      const nextNumber = customers.length > 0
        ? Math.max(...customers.map(c => c.customerNumber || 0)) + 1
        : 1;

      const newCustomer = {
        customerNumber: nextNumber,
        name: customerName,
        whatsapp: whatsapp,
        email: email,
        notes: notes,
        totalOrders: 1,
        lastOrderDate: new Date().toISOString()
      };
      // Crear en Supabase
      const created = await customersService.create(newCustomer);
      // Actualizar estado local
      setCustomers([...customers, created]);
      return created.id;
    }
  };

  const createCashMovements = async (orderData: Order, oldOrder?: Order) => {
    const newMovements: CashMovement[] = [];

    if (editingId && oldOrder) {
      // Editing existing order
      if (formData.remainingPaid && !oldOrder.remainingPaid && formData.remainingAmount > 0) {
        const movementData = {
          date: new Date().toISOString(),
          description: `Cobro Final: ${formData.customerName}`,
          amount: formData.remainingAmount,
          type: MovementType.INGRESO,
          method: formData.remainingMethod,
          category: 'Modista'
        };
        // Crear en Supabase
        const created = await cashMovementsService.create(movementData);
        newMovements.push(created);
      }
    } else {
      // New order
      if (formData.depositAmount > 0) {
        const depositMovement = {
          date: new Date().toISOString(),
          description: `Seña: ${formData.customerName}`,
          amount: formData.depositAmount,
          type: MovementType.INGRESO,
          method: formData.depositMethod,
          category: 'Varios'
        };
        // Crear en Supabase
        const created = await cashMovementsService.create(depositMovement);
        newMovements.push(created);
      }
      if (formData.remainingPaid && formData.remainingAmount > 0) {
        // Pequeño delay para evitar duplicados
        await new Promise(resolve => setTimeout(resolve, 10));
        const fullMovement = {
          date: new Date().toISOString(),
          description: `Cobro Restante: ${formData.customerName}`,
          amount: formData.remainingAmount,
          type: MovementType.INGRESO,
          method: formData.remainingMethod,
          category: 'Modista'
        };
        // Crear en Supabase
        const created = await cashMovementsService.create(fullMovement);
        newMovements.push(created);
      }
    }

    if (newMovements.length > 0) {
      setMovements(prev => [...newMovements, ...prev]);
    }
  };

  const handleSave = async (bypassWarning = false) => {
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

    setIsSaving(true);
    try {
      console.log('🔵 Guardando pedido...', { editingId, formData, selectedProducts });

      // Get old order if editing
      const oldOrder = editingId ? orders.find(o => o.id === editingId) : undefined;

      // Stock management
      if (editingId && oldOrder) {
        console.log('🔄 EDITANDO - Gestionando stock...');
        const updatedProducts = [...products];

        // 1. Return old products to stock
        if (oldOrder.linkedProducts && oldOrder.linkedProducts.length > 0) {
          console.log('📦 PASO 1: Devolviendo productos viejos al stock:', oldOrder.linkedProducts);
          for (const oldProduct of oldOrder.linkedProducts) {
            const pIdx = updatedProducts.findIndex(p => p.id === oldProduct.productId);
            if (pIdx !== -1) {
              const newStock = updatedProducts[pIdx].stock + oldProduct.quantity;
              console.log(`  ↑ ${oldProduct.name}: ${updatedProducts[pIdx].stock} + ${oldProduct.quantity} = ${newStock}`);
              await productsService.updateStock(oldProduct.productId, newStock);
              updatedProducts[pIdx] = {
                ...updatedProducts[pIdx],
                stock: newStock
              };
            }
          }
        }

        // 2. Deduct new products from stock (using already updated array)
        if (selectedProducts.length > 0) {
          console.log('📦 PASO 2: Descontando productos nuevos del stock:', selectedProducts);
          for (const newProduct of selectedProducts) {
            const pIdx = updatedProducts.findIndex(p => p.id === newProduct.productId);
            if (pIdx !== -1) {
              const newStock = Math.max(0, updatedProducts[pIdx].stock - newProduct.quantity);
              console.log(`  ↓ ${newProduct.name}: ${updatedProducts[pIdx].stock} - ${newProduct.quantity} = ${newStock}`);
              await productsService.updateStock(newProduct.productId, newStock);
              updatedProducts[pIdx] = {
                ...updatedProducts[pIdx],
                stock: newStock
              };
            }
          }
        }

        // Update state once with all changes
        setProducts(updatedProducts);
        console.log('✅ Stock actualizado completamente');
      } else if (!editingId && selectedProducts.length > 0) {
        // Stock deduction for new orders
        console.log('📦 Deduciendo stock para nuevo pedido...', selectedProducts);
        await deductStock(selectedProducts);
      }

      // SIEMPRE crear o actualizar cliente primero
      console.log('👤 Creando/actualizando cliente...', formData.customerName);
      const customerId = await autoCreateOrUpdateCustomer(
        formData.customerName,
        formData.whatsapp,
        formData.customerEmail,
        formData.customerNotes,
        !editingId
      );
      console.log('✅ Cliente ID obtenido:', customerId);

      const orderDataWithoutId = {
        ...formData,
        customerId: customerId,
        linkedProducts: selectedProducts
      };

      console.log('📝 Datos a guardar en Supabase:', orderDataWithoutId);

      // Create or update order in Supabase
      let savedOrder: Order;
      if (editingId) {
        console.log('✏️ Actualizando pedido existente:', editingId);
        savedOrder = await ordersService.update(editingId, orderDataWithoutId);
        setOrders(prev => prev.map(o => o.id === editingId ? savedOrder : o));
        showToast("Cambios guardados", "success");
      } else {
        console.log('➕ Creando nuevo pedido en Supabase...');
        savedOrder = await ordersService.create(orderDataWithoutId);
        console.log('✅ Pedido creado exitosamente:', savedOrder);
        setOrders(prev => [...prev, savedOrder]);
        showToast("Trabajo agendado", "success");
      }

      // Create cash movements
      console.log('💰 Creando movimientos de caja...');
      await createCashMovements(savedOrder, oldOrder);

      console.log('✅ Pedido guardado completamente');
      closeModal();
      setDebtWarning(null);
    } catch (err: any) {
      console.error("❌ Error al guardar pedido:", err);
      console.error("❌ Error completo:", {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code
      });
      showToast(`Error: ${err?.message || 'Error al guardar el pedido'}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const openModal = (order?: Order) => {
    if (order) {
      setEditingId(order.id);
      setFormData({
        description: order.description,
        customerName: order.customerName,
        whatsapp: order.whatsapp,
        customerEmail: order.customerEmail || '',
        customerNotes: order.customerNotes || '',
        deliveryDate: order.deliveryDate,
        totalAmount: order.totalAmount,
        depositAmount: order.depositAmount,
        depositMethod: order.depositMethod,
        remainingAmount: order.remainingAmount,
        remainingMethod: order.remainingMethod,
        isDelivered: order.isDelivered,
        remainingPaid: order.remainingPaid,
        status: order.status,
        contactMethod: order.contactMethod
      });
      setSelectedProducts(order.linkedProducts || []);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      description: '',
      customerName: '',
      whatsapp: '',
      customerEmail: '',
      customerNotes: '',
      deliveryDate: new Date().toLocaleDateString('en-CA'),
      totalAmount: 0,
      depositAmount: 0,
      depositMethod: PaymentMethod.EFECTIVO,
      remainingAmount: 0,
      remainingMethod: PaymentMethod.EFECTIVO,
      isDelivered: false,
      remainingPaid: false,
      status: 'pedido' as OrderStatus,
      contactMethod: undefined
    });
    setSelectedProducts([]);
  };

  const deleteOrder = async (id: string) => {
    try {
      // Eliminar en Supabase
      await ordersService.delete(id);
      // Actualizar estado local
      setOrders(prev => prev.filter(o => o.id !== id));
      showToast("Pedido eliminado", "success");
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast("Error al eliminar el pedido", "error");
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Actualizar en Supabase
      await ordersService.updateStatus(orderId, newStatus);
      // Actualizar estado local
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast("Estado actualizado", "success");
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast("Error al actualizar el estado", "error");
    }
  };

  const toggleOrderDelivery = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const willBeDelivered = !order.isDelivered;

    if (willBeDelivered && order.remainingAmount > 0 && !order.remainingPaid) {
      setDebtWarning({
        isOpen: true,
        amount: order.remainingAmount,
        onConfirm: async () => {
          try {
            // Actualizar en Supabase
            await ordersService.updateDeliveryStatus(orderId, willBeDelivered);
            // Actualizar estado local
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isDelivered: willBeDelivered } : o));
            showToast(willBeDelivered ? "Pedido marcado como entregado" : "Entrega revertida", "success");
            setDebtWarning(null);
          } catch (error) {
            console.error('Error updating delivery status:', error);
            showToast("Error al actualizar el estado de entrega", "error");
          }
        }
      });
      return;
    }

    try {
      // Actualizar en Supabase
      await ordersService.updateDeliveryStatus(orderId, willBeDelivered);
      // Actualizar estado local
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isDelivered: willBeDelivered } : o));
      showToast(willBeDelivered ? "Pedido marcado como entregado" : "Entrega revertida", "success");
    } catch (error) {
      console.error('Error updating delivery status:', error);
      showToast("Error al actualizar el estado de entrega", "error");
    }
  };

  return {
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
  };
}
