import React from 'react';

import { useState } from 'react';
import { Customer } from '@/types';
import { useDebounce } from '../useDebounce';
import { customersService } from '@/services/supabase';

export interface UseCustomersProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  showToast?: (msg: string, type: 'success' | 'error') => void;
}

export function useCustomers({ customers, setCustomers, showToast }: UseCustomersProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    customerNumber: 0,
    notes: ''
  });

  // Autosave for editing
  useDebounce(() => {
    if (isEditModalOpen && editingCustomer && formData.name.trim()) {
      // Actualizar en Supabase
      customersService.update(editingCustomer.id, {
        name: formData.name,
        whatsapp: formData.whatsapp,
        customerNumber: formData.customerNumber,
        notes: formData.notes
      }).catch(err => {
        console.error('Error updating customer:', err);
      });
      // Actualizar estado local
      setCustomers(prev => prev.map(c =>
        c.id === editingCustomer.id
          ? { ...c, name: formData.name, whatsapp: formData.whatsapp, customerNumber: formData.customerNumber, notes: formData.notes }
          : c
      ));
    }
  }, [formData, editingCustomer, isEditModalOpen], 500);

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

  const deleteCustomer = async (id: string) => {
    try {
      // Eliminar en Supabase
      await customersService.delete(id);
      // Actualizar estado local
      setCustomers(prev => prev.filter(c => c.id !== id));
      showToast?.("Cliente eliminado", "success");
    } catch (error) {
      console.error('Error deleting customer:', error);
      showToast?.("Error al eliminar el cliente", "error");
    }
  };

  return {
    isEditModalOpen,
    editingCustomer,
    formData,
    setFormData,
    openEditModal,
    closeEditModal,
    handleSaveEdit,
    deleteCustomer
  };
}
