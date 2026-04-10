import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

export interface DBProduct {
  product_id: string;
  code: string | null;
  name: string;
  image_url: string | null;
  stock: number;
  min_stock: number;
  price: number;
  category: string | null;
  size: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Convierte un producto de la DB al formato de la app
 */
function toAppProduct(dbProduct: DBProduct): Product {
  return {
    id: dbProduct.product_id,
    code: dbProduct.code || '',
    name: dbProduct.name,
    imageUrl: dbProduct.image_url || '',
    stock: dbProduct.stock,
    minStock: dbProduct.min_stock,
    price: dbProduct.price,
    category: dbProduct.category || '',
    size: dbProduct.size || ''
  };
}

/**
 * Convierte un producto de la app al formato de la DB
 */
function toDBProduct(product: Partial<Product>): Partial<DBProduct> {
  const dbProduct: Partial<DBProduct> = {
    name: product.name,
    code: product.code,
    image_url: product.imageUrl,
    stock: product.stock,
    min_stock: product.minStock,
    price: product.price,
    category: product.category,
    size: product.size
  };

  if (product.id) {
    dbProduct.product_id = product.id;
  }

  return dbProduct;
}

export const productsService = {
  /**
   * Obtener todos los productos
   */
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(toAppProduct);
  },

  /**
   * Obtener un producto por ID
   */
  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', id)
      .single();

    if (error) throw error;
    return data ? toAppProduct(data) : null;
  },

  /**
   * Crear un nuevo producto
   */
  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const dbProduct = toDBProduct(product);
    delete dbProduct.product_id; // No incluir ID en creación

    const { data, error } = await supabase
      .from('products')
      .insert(dbProduct)
      .select()
      .single();

    if (error) throw error;
    return toAppProduct(data);
  },

  /**
   * Actualizar un producto existente
   */
  async update(id: string, product: Partial<Product>): Promise<Product> {
    const dbProduct = toDBProduct(product);
    delete dbProduct.product_id; // No actualizar el ID

    const { data, error } = await supabase
      .from('products')
      .update({ ...dbProduct, updated_at: new Date().toISOString() })
      .eq('product_id', id)
      .select()
      .single();

    if (error) throw error;
    return toAppProduct(data);
  },

  /**
   * Eliminar un producto
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', id);

    if (error) throw error;
  },

  /**
   * Actualizar solo el stock de un producto
   */
  async updateStock(id: string, newStock: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('product_id', id);

    if (error) throw error;
  },

  /**
   * Obtener productos con stock bajo
   */
  async getLowStock(): Promise<Product[]> {
    // Fetch all products and filter in JS since Supabase can't compare two columns directly
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;

    // Filter products where stock < min_stock
    const lowStockProducts = (data || []).filter(p => p.stock < p.min_stock);
    return lowStockProducts.map(toAppProduct);
  }
};
