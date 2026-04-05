import { Product, Order, CashMovement, Customer, Supplier, Quote } from '@/types';
import {
  productsService,
  customersService,
  ordersService,
  suppliersService,
  quotesService,
  cashMovementsService
} from '@/services/supabase';

export interface AppData {
  products: Product[];
  orders: Order[];
  movements: CashMovement[];
  customers: Customer[];
  suppliers: Supplier[];
  quotes: Quote[];
}

/**
 * Obtener todos los datos desde Supabase
 */
export const fetchData = async (): Promise<AppData> => {
  try {
    const [products, orders, movements, customers, suppliers, quotes] = await Promise.all([
      productsService.getAll(),
      ordersService.getAll(),
      cashMovementsService.getAll(),
      customersService.getAll(),
      suppliersService.getAll(),
      quotesService.getAll()
    ]);

    return {
      products,
      orders,
      movements,
      customers,
      suppliers,
      quotes
    };
  } catch (error) {
    console.error("Error fetching data from Supabase:", error);
    throw error;
  }
};

/**
 * DEPRECADO: Supabase sincroniza automáticamente.
 * Los hooks individuales ya guardan directamente en Supabase.
 * Esta función se mantiene por compatibilidad pero no hace nada.
 */
export const saveData = async (data: AppData): Promise<void> => {
  // No hace nada - la sincronización es automática vía los servicios
  console.log("saveData llamado - ignorado (Supabase sincroniza automáticamente)");
};
