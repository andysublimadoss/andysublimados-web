import React from 'react';

import { useState } from 'react';
import { Product } from '@/types';
import { useDebounce } from '../useDebounce';
import { productsService } from '@/services/supabase';

export interface UseInventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  showToast?: (msg: string, type: 'success' | 'error') => void;
}

export function useInventory({ products, setProducts, showToast }: UseInventoryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    stock: 0,
    minStock: 3,
    price: 0,
    imageUrl: '',
    category: '',
    size: ''
  });

  // Autosave for editing
  useDebounce(() => {
    if (isModalOpen && editingId && formData.name) {
      // Actualizar en Supabase
      productsService.update(editingId, formData).catch(err => {
        console.error('Error updating product:', err);
      });
      // Actualizar estado local
      setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p));
    }
  }, [formData, editingId, isModalOpen], 500);

  const generateCode = (): string => {
    const nextNum = products.length + 1;
    return `INS-${nextNum.toString().padStart(3, '0')}`;
  };

  const handleSave = async () => {
    if (!formData.name) return;

    let finalCode = formData.code;
    if (!finalCode && !editingId) {
      finalCode = generateCode();
    }

    try {
      if (editingId) {
        // Actualizar en Supabase
        const updated = await productsService.update(editingId, { ...formData, code: finalCode });
        // Actualizar estado local
        setProducts(prev => prev.map(p => p.id === editingId ? updated : p));
        showToast?.("Insumo actualizado", "success");
      } else {
        // Crear en Supabase
        const newProduct = await productsService.create({ ...formData, code: finalCode });
        // Actualizar estado local
        setProducts(prev => [...prev, newProduct]);
        showToast?.("Insumo registrado", "success");
      }
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
      showToast?.("Error al guardar el insumo", "error");
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        code: product.code || '',
        name: product.name,
        stock: product.stock,
        minStock: product.minStock || 3,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category || '',
        size: product.size || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        code: '',
        name: '',
        stock: 0,
        minStock: 3,
        price: 0,
        imageUrl: `https://picsum.photos/seed/${Date.now()}/400/400`,
        category: '',
        size: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const deleteProduct = async (id: string) => {
    try {
      // Eliminar en Supabase
      await productsService.delete(id);
      // Actualizar estado local
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast?.("Insumo eliminado", "success");
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast?.("Error al eliminar el insumo", "error");
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
    deleteProduct
  };
}
