import React from 'react';

import { useState } from 'react';
import { Supplier } from '@/types';
import { suppliersService } from '@/services/supabase';

export interface UseSuppliersProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  showToast?: (msg: string, type: 'success' | 'error') => void;
}

export function useSuppliers({ suppliers, setSuppliers, showToast }: UseSuppliersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({
    name: '',
    phone: '',
    email: '',
    category: '',
    notes: ''
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast?.("El nombre es obligatorio", "error");
      return;
    }

    const finalData = {
      ...formData,
      category: formData.category.trim() || 'General'
    };

    try {
      if (editingId) {
        // Actualizar en Supabase
        const updated = await suppliersService.update(editingId, finalData);
        // Actualizar estado local
        setSuppliers(prev => prev.map(s => s.id === editingId ? updated : s));
        showToast?.("Proveedor actualizado con éxito", "success");
      } else {
        // Crear en Supabase
        const newSupplier = await suppliersService.create(finalData);
        // Actualizar estado local
        setSuppliers(prev => [...prev, newSupplier]);
        showToast?.("Proveedor registrado con éxito", "success");
      }
      closeModal();
    } catch (error) {
      console.error('Error saving supplier:', error);
      showToast?.("Error al guardar el proveedor", "error");
    }
  };

  const openModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingId(supplier.id);
      setFormData({
        name: supplier.name,
        phone: supplier.phone,
        email: supplier.email,
        category: supplier.category,
        notes: supplier.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        category: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const deleteSupplier = async (id: string) => {
    try {
      // Eliminar en Supabase
      await suppliersService.delete(id);
      // Actualizar estado local
      setSuppliers(prev => prev.filter(s => s.id !== id));
      showToast?.("Proveedor eliminado", "success");
    } catch (error) {
      console.error('Error deleting supplier:', error);
      showToast?.("Error al eliminar el proveedor", "error");
    }
  };

  return {
    isModalOpen,
    editingId,
    formData,
    setFormData,
    handleSave,
    openModal,
    closeModal,
    deleteSupplier
  };
}
