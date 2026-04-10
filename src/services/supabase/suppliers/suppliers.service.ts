import { supabase } from '@/lib/supabase';
import type { Supplier } from '@/types';

export interface DBSupplier {
  supplier_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function toAppSupplier(dbSupplier: DBSupplier): Supplier {
  return {
    id: dbSupplier.supplier_id,
    name: dbSupplier.name,
    phone: dbSupplier.phone || '',
    email: dbSupplier.email || '',
    category: dbSupplier.category || '',
    notes: dbSupplier.notes || ''
  };
}

function toDBSupplier(supplier: Partial<Supplier>): Partial<DBSupplier> {
  const dbSupplier: Partial<DBSupplier> = {
    name: supplier.name,
    phone: supplier.phone,
    email: supplier.email,
    category: supplier.category,
    notes: supplier.notes
  };

  if (supplier.id) {
    dbSupplier.supplier_id = supplier.id;
  }

  return dbSupplier;
}

export const suppliersService = {
  async getAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(toAppSupplier);
  },

  async getById(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('supplier_id', id)
      .single();

    if (error) throw error;
    return data ? toAppSupplier(data) : null;
  },

  async create(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
    const dbSupplier = toDBSupplier(supplier);
    delete dbSupplier.supplier_id;

    const { data, error } = await supabase
      .from('suppliers')
      .insert(dbSupplier)
      .select()
      .single();

    if (error) throw error;
    return toAppSupplier(data);
  },

  async update(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const dbSupplier = toDBSupplier(supplier);
    delete dbSupplier.supplier_id;

    const { data, error } = await supabase
      .from('suppliers')
      .update({ ...dbSupplier, updated_at: new Date().toISOString() })
      .eq('supplier_id', id)
      .select()
      .single();

    if (error) throw error;
    return toAppSupplier(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('supplier_id', id);

    if (error) throw error;
  }
};
