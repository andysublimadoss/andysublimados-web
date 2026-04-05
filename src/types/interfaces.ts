import { PaymentMethod, MovementType, OrderStatus } from './enums';

export interface Product {
  id: string;
  code?: string;
  name: string;
  imageUrl: string;
  stock: number;
  minStock: number;
  price: number;
  category?: string;
  size?: string;
}

export interface Customer {
  id: string;
  customerNumber?: number;
  name: string;
  whatsapp: string;
  email?: string;
  totalOrders: number;
  lastOrderDate: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  notes?: string;
}

export interface OrderProduct {
  productId: string;
  quantity: number;
  name: string;
}

export interface Order {
  id: string;
  customerId?: string;
  description: string;
  customerName: string;
  whatsapp: string;
  customerEmail?: string;
  customerNotes?: string;
  deliveryDate: string;
  depositAmount: number;
  depositMethod: PaymentMethod;
  remainingAmount: number;
  remainingMethod: PaymentMethod;
  totalAmount: number;
  isDelivered: boolean;
  remainingPaid: boolean;
  createdAt: string;
  status: OrderStatus;
  linkedProducts?: OrderProduct[];
  contactMethod?: 'WhatsApp' | 'Instagram' | 'Facebook' | 'Presencial';
}

export interface CashMovement {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: MovementType;
  method: PaymentMethod | string;
  category?: string;
}

export interface QuoteItem {
  id: string;
  quantity: number;
  description: string;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  customerName: string;
  customerPhone?: string;
  date: string;
  items: QuoteItem[];
  totalAmount: number;
  notes?: string;
}
