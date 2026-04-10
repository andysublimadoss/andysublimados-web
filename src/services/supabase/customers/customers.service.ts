import { supabase } from '@/lib/supabase';
import type { Customer } from '@/types';

export interface DBCustomer {
  customer_id: string;
  customer_number: number | null;
  name: string;
  whatsapp: string | null;
  email: string | null;
  notes: string | null;
  total_orders: number;
  last_order_date: string | null;
  created_at: string;
  updated_at: string;
}

function toAppCustomer(dbCustomer: DBCustomer): Customer {
  return {
    id: dbCustomer.customer_id,
    customerNumber: dbCustomer.customer_number || undefined,
    name: dbCustomer.name,
    whatsapp: dbCustomer.whatsapp || '',
    email: dbCustomer.email || undefined,
    totalOrders: dbCustomer.total_orders,
    lastOrderDate: dbCustomer.last_order_date || undefined,
    notes: dbCustomer.notes || undefined
  };
}

function toDBCustomer(customer: Partial<Customer>): Partial<DBCustomer> {
  const dbCustomer: Partial<DBCustomer> = {
    name: customer.name,
    customer_number: customer.customerNumber,
    whatsapp: customer.whatsapp,
    email: customer.email,
    total_orders: customer.totalOrders,
    last_order_date: customer.lastOrderDate,
    notes: customer.notes
  };

  if (customer.id) {
    dbCustomer.customer_id = customer.id;
  }

  return dbCustomer;
}

export const customersService = {
  /**
   * Obtener todos los clientes
   */
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(toAppCustomer);
  },

  /**
   * Obtener un cliente por ID
   */
  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('customer_id', id)
      .single();

    if (error) throw error;
    return data ? toAppCustomer(data) : null;
  },

  /**
   * Buscar cliente por WhatsApp o nombre
   */
  async findByWhatsAppOrName(whatsapp?: string, name?: string): Promise<Customer | null> {
    let query = supabase.from('customers').select('*');

    if (whatsapp) {
      query = query.eq('whatsapp', whatsapp);
    } else if (name) {
      query = query.ilike('name', name);
    } else {
      return null;
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;
    return data ? toAppCustomer(data) : null;
  },

  /**
   * Crear un nuevo cliente
   */
  async create(customer: Omit<Customer, 'id'>): Promise<Customer> {
    const dbCustomer = toDBCustomer(customer);
    delete dbCustomer.customer_id;

    const { data, error } = await supabase
      .from('customers')
      .insert(dbCustomer)
      .select()
      .single();

    if (error) throw error;
    return toAppCustomer(data);
  },

  /**
   * Actualizar un cliente existente
   */
  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    const dbCustomer = toDBCustomer(customer);
    delete dbCustomer.customer_id;

    const { data, error } = await supabase
      .from('customers')
      .update({ ...dbCustomer, updated_at: new Date().toISOString() })
      .eq('customer_id', id)
      .select()
      .single();

    if (error) throw error;
    return toAppCustomer(data);
  },

  /**
   * Eliminar un cliente
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('customer_id', id);

    if (error) throw error;
  },

  /**
   * Incrementar contador de órdenes
   */
  async incrementOrderCount(id: string): Promise<void> {
    // Obtener el cliente actual
    const customer = await this.getById(id);
    if (!customer) throw new Error('Customer not found');

    // Incrementar y actualizar
    const { error } = await supabase
      .from('customers')
      .update({
        total_orders: customer.totalOrders + 1,
        last_order_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('customer_id', id);

    if (error) throw error;
  }
};
