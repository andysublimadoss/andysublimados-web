import { supabase } from '@/lib/supabase';
import type { CashMovement } from '@/types';
import { PaymentMethod, MovementType } from '@/types';

export interface DBCashMovement {
  movement_id: string;
  movement_date: string;
  description: string;
  amount: number;
  type: MovementType;
  method: PaymentMethod;
  category: string | null;
  created_at: string;
}

function toAppMovement(dbMovement: DBCashMovement): CashMovement {
  return {
    id: dbMovement.movement_id,
    date: dbMovement.movement_date,
    description: dbMovement.description,
    amount: dbMovement.amount,
    type: dbMovement.type,
    method: dbMovement.method,
    category: dbMovement.category || ''
  };
}

function toDBMovement(movement: Partial<CashMovement>): Partial<DBCashMovement> {
  const dbMovement: any = {};

  if (movement.date) dbMovement.movement_date = movement.date;
  if (movement.description) dbMovement.description = movement.description;
  if (movement.amount !== undefined) dbMovement.amount = movement.amount;
  if (movement.type) dbMovement.type = movement.type;
  if (movement.method) dbMovement.method = movement.method;
  if (movement.category) dbMovement.category = movement.category;
  if (movement.id) dbMovement.movement_id = movement.id;

  return dbMovement as Partial<DBCashMovement>;
}

export const cashMovementsService = {
  async getAll(): Promise<CashMovement[]> {
    const { data, error } = await supabase
      .from('cash_movements')
      .select('*')
      .order('movement_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(toAppMovement);
  },

  async getById(id: string): Promise<CashMovement | null> {
    const { data, error } = await supabase
      .from('cash_movements')
      .select('*')
      .eq('movement_id', id)
      .single();

    if (error) throw error;
    return data ? toAppMovement(data) : null;
  },

  async create(movement: Omit<CashMovement, 'id'>): Promise<CashMovement> {
    const dbMovement = toDBMovement(movement);
    delete dbMovement.movement_id;

    const { data, error } = await supabase
      .from('cash_movements')
      .insert(dbMovement)
      .select()
      .single();

    if (error) throw error;
    return toAppMovement(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('cash_movements')
      .delete()
      .eq('movement_id', id);

    if (error) throw error;
  },

  async getByDateRange(startDate: string, endDate: string): Promise<CashMovement[]> {
    const { data, error } = await supabase
      .from('cash_movements')
      .select('*')
      .gte('movement_date', startDate)
      .lte('movement_date', endDate)
      .order('movement_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(toAppMovement);
  },

  async getByType(type: MovementType): Promise<CashMovement[]> {
    const { data, error } = await supabase
      .from('cash_movements')
      .select('*')
      .eq('type', type)
      .order('movement_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(toAppMovement);
  }
};
