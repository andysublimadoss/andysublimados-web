import React from 'react';

import { useState } from 'react';
import { Quote, QuoteItem } from '@/types';
import { useDebounce } from '../useDebounce';
import { quotesService } from '@/services/supabase';

export interface UseQuotesProps {
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export function useQuotes({ quotes, setQuotes, showToast }: UseQuotesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  // Autosave for editing
  useDebounce(() => {
    if (isModalOpen && editingId && customerName.trim() && items.length > 0) {
      // Actualizar en Supabase
      quotesService.update(editingId, {
        customerName,
        customerPhone,
        items,
        totalAmount,
        notes,
        date: new Date().toISOString()
      }).catch(err => {
        console.error('Error updating quote:', err);
      });
      // Actualizar estado local
      setQuotes(prev => prev.map(q => q.id === editingId ? {
        ...q,
        customerName,
        customerPhone,
        items,
        totalAmount,
        notes
      } : q));
    }
  }, [customerName, customerPhone, items, totalAmount, notes, editingId, isModalOpen], 500);

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      quantity: 1,
      description: '',
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const q = parseFloat(String(updatedItem.quantity)) || 0;
          const p = parseFloat(String(updatedItem.unitPrice)) || 0;
          updatedItem.quantity = q;
          updatedItem.unitPrice = p;
          updatedItem.total = q * p;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    const trimmedName = customerName?.trim();
    if (!trimmedName) {
      showToast("El nombre del cliente es obligatorio", "error");
      return;
    }
    if (items.length === 0) {
      showToast("Agrega al menos un item al presupuesto", "error");
      return;
    }

    const quoteData = {
      customerName: trimmedName,
      customerPhone,
      date: new Date().toISOString(),
      items,
      totalAmount,
      notes
    };

    try {
      if (editingId) {
        // Actualizar en Supabase
        const updated = await quotesService.update(editingId, quoteData);
        // Actualizar estado local
        setQuotes(prev => prev.map(q => q.id === editingId ? updated : q));
        showToast("Presupuesto actualizado", "success");
      } else {
        // Crear en Supabase
        const newQuote = await quotesService.create(quoteData);
        // Actualizar estado local
        setQuotes(prev => [newQuote, ...prev]);
        showToast("Presupuesto guardado", "success");
      }
      closeModal();
    } catch (error) {
      console.error('Error saving quote:', error);
      showToast("Error al guardar el presupuesto", "error");
    }
  };

  const openModal = (quote?: Quote) => {
    if (quote) {
      setEditingId(quote.id);
      setCustomerName(quote.customerName);
      setCustomerPhone(quote.customerPhone || '');
      setItems(quote.items);
      setNotes(quote.notes || '');
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
    setCustomerName('');
    setCustomerPhone('');
    setItems([]);
    setNotes('');
  };

  const deleteQuote = async (id: string) => {
    try {
      // Eliminar en Supabase
      await quotesService.delete(id);
      // Actualizar estado local
      setQuotes(prev => prev.filter(q => q.id !== id));
      showToast("Presupuesto eliminado", "success");
    } catch (error) {
      console.error('Error deleting quote:', error);
      showToast("Error al eliminar el presupuesto", "error");
    }
  };

  return {
    isModalOpen,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    items,
    notes,
    setNotes,
    editingId,
    totalAmount,
    addItem,
    updateItem,
    removeItem,
    handleSave,
    openModal,
    closeModal,
    deleteQuote
  };
}
