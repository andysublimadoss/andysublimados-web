import { supabase } from '@/lib/supabase';
import type { Order, OrderProduct, OrderStatus } from '@/types';
import { PaymentMethod } from '@/types';

export interface DBOrder {
  order_id: string;
  customer_name: string;
  whatsapp: string | null;
  description: string;
  delivery_date: string;
  total_amount: number;
  deposit_amount: number;
  deposit_method: PaymentMethod | null;
  remaining_amount: number;
  remaining_method: PaymentMethod | null;
  is_delivered: boolean;
  remaining_paid: boolean;
  status: OrderStatus;
  contact_method: string | null;
  created_at: string;
  updated_at: string;
  customer_id: string | null;
}

export interface DBOrderProduct {
  order_product_id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  created_at: string;
}

function toAppOrder(dbOrder: DBOrder, orderProducts: DBOrderProduct[] = []): Order {
  return {
    id: dbOrder.order_id,
    customerId: dbOrder.customer_id || undefined,
    customerName: dbOrder.customer_name,
    whatsapp: dbOrder.whatsapp || '',
    description: dbOrder.description,
    deliveryDate: dbOrder.delivery_date,
    totalAmount: dbOrder.total_amount,
    depositAmount: dbOrder.deposit_amount,
    depositMethod: dbOrder.deposit_method || PaymentMethod.EFECTIVO,
    remainingAmount: dbOrder.remaining_amount,
    remainingMethod: dbOrder.remaining_method || PaymentMethod.EFECTIVO,
    isDelivered: dbOrder.is_delivered,
    remainingPaid: dbOrder.remaining_paid,
    status: dbOrder.status,
    contactMethod: dbOrder.contact_method as any,
    createdAt: dbOrder.created_at,
    linkedProducts: orderProducts.map(op => ({
      productId: op.product_id || '',
      name: op.product_name,
      quantity: op.quantity
    }))
  };
}

function toDBOrder(order: Partial<Order>): Partial<DBOrder> {
  const dbOrder: Partial<DBOrder> = {
    customer_id: order.customerId || null,
    customer_name: order.customerName,
    whatsapp: order.whatsapp,
    description: order.description,
    delivery_date: order.deliveryDate,
    total_amount: order.totalAmount,
    deposit_amount: order.depositAmount,
    deposit_method: order.depositMethod,
    remaining_amount: order.remainingAmount,
    remaining_method: order.remainingMethod,
    is_delivered: order.isDelivered,
    remaining_paid: order.remainingPaid,
    status: order.status,
    contact_method: order.contactMethod
  };

  if (order.id) {
    dbOrder.order_id = order.id;
  }

  return dbOrder;
}

export const ordersService = {
  /**
   * Obtener todos los pedidos con sus productos
   */
  async getAll(): Promise<Order[]> {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    // Obtener productos de cada orden
    const ordersWithProducts = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: products } = await supabase
          .from('order_products')
          .select('*')
          .eq('order_id', order.order_id);

        return toAppOrder(order, products || []);
      })
    );

    return ordersWithProducts;
  },

  /**
   * Obtener un pedido por ID
   */
  async getById(id: string): Promise<Order | null> {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', id)
      .single();

    if (orderError) throw orderError;
    if (!order) return null;

    const { data: products } = await supabase
      .from('order_products')
      .select('*')
      .eq('order_id', id);

    return toAppOrder(order, products || []);
  },

  /**
   * Crear un nuevo pedido con productos
   */
  async create(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const dbOrder = toDBOrder(order);
    delete dbOrder.order_id;

    // Crear orden
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(dbOrder)
      .select()
      .single();

    if (orderError) throw orderError;

    // Crear productos vinculados
    if (order.linkedProducts && order.linkedProducts.length > 0) {
      const orderProducts = order.linkedProducts.map(op => ({
        order_id: newOrder.order_id,
        product_id: op.productId || null,
        product_name: op.name,
        quantity: op.quantity
      }));

      const { error: productsError } = await supabase
        .from('order_products')
        .insert(orderProducts);

      if (productsError) throw productsError;
    }

    return this.getById(newOrder.order_id) as Promise<Order>;
  },

  /**
   * Actualizar un pedido existente
   */
  async update(id: string, order: Partial<Order>): Promise<Order> {
    const dbOrder = toDBOrder(order);
    delete dbOrder.order_id;

    const { error: orderError } = await supabase
      .from('orders')
      .update({ ...dbOrder, updated_at: new Date().toISOString() })
      .eq('order_id', id);

    if (orderError) throw orderError;

    // Si hay productos, actualizar
    if (order.linkedProducts) {
      // Eliminar productos existentes
      await supabase
        .from('order_products')
        .delete()
        .eq('order_id', id);

      // Insertar nuevos productos
      if (order.linkedProducts.length > 0) {
        const orderProducts = order.linkedProducts.map(op => ({
          order_id: id,
          product_id: op.productId || null,
          product_name: op.name,
          quantity: op.quantity
        }));

        const { error: productsError } = await supabase
          .from('order_products')
          .insert(orderProducts);

        if (productsError) throw productsError;
      }
    }

    return this.getById(id) as Promise<Order>;
  },

  /**
   * Eliminar un pedido
   */
  async delete(id: string): Promise<void> {
    // Los productos se eliminan automáticamente por CASCADE
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('order_id', id);

    if (error) throw error;
  },

  /**
   * Actualizar estado de entrega
   */
  async updateDeliveryStatus(id: string, isDelivered: boolean): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({
        is_delivered: isDelivered,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', id);

    if (error) throw error;
  },

  /**
   * Actualizar estado del pedido
   */
  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', id);

    if (error) throw error;
  }
};
