import React from 'react';
import { OrdersAgenda } from '@/features';
import { Order, CashMovement, Customer, Product } from '@/types';

interface OrdersPageProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setMovements: React.Dispatch<React.SetStateAction<CashMovement[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const OrdersPage: React.FC<OrdersPageProps> = (props) => {
  return <OrdersAgenda {...props} />;
};

export default OrdersPage;
