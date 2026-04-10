import React from 'react';

import { useState } from 'react';
import { CashMovement, MovementType, PaymentMethod } from '@/types';
import { cashMovementsService } from '@/services/supabase';

export interface UseCashFlowProps {
  movements: CashMovement[];
  setMovements: React.Dispatch<React.SetStateAction<CashMovement[]>>;
  showToast?: (msg: string, type: 'success' | 'error') => void;
}

export function useCashFlow({ movements, setMovements, showToast }: UseCashFlowProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    type: MovementType.INGRESO,
    method: PaymentMethod.EFECTIVO,
    category: 'Varios'
  });

  const handleAdd = async () => {
    if (!formData.description || formData.amount <= 0) return;

    try {
      // Crear en Supabase
      const newMovement = await cashMovementsService.create({
        date: new Date().toISOString(),
        ...formData
      });
      // Actualizar estado local
      setMovements(prev => [newMovement, ...prev]);
      setFormData({
        description: '',
        amount: 0,
        type: MovementType.INGRESO,
        method: PaymentMethod.EFECTIVO,
        category: 'Varios'
      });
      showToast?.("Movimiento registrado", "success");
    } catch (error) {
      console.error('Error creating cash movement:', error);
      showToast?.("Error al registrar el movimiento", "error");
    }
  };

  const deleteMovement = async (id: string) => {
    try {
      // Eliminar en Supabase
      await cashMovementsService.delete(id);
      // Actualizar estado local
      setMovements(prev => prev.filter(m => m.id !== id));
      showToast?.("Registro eliminado", "success");
    } catch (error) {
      console.error('Error deleting cash movement:', error);
      showToast?.("Error al eliminar el registro", "error");
    }
  };

  return {
    formData,
    setFormData,
    handleAdd,
    deleteMovement
  };
}
