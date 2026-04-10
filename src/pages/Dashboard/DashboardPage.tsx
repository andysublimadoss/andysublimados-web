import React from 'react';
import { Dashboard } from '@/features';
import { Order, CashMovement, Product, Supplier, TabType } from '@/types';
import { useNavigate } from 'react-router-dom';

interface DashboardPageProps {
  orders: Order[];
  movements: CashMovement[];
  products: Product[];
  suppliers: Supplier[];
  onManageStock: (productName?: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ orders, movements, products, suppliers, onManageStock }) => {
  const navigate = useNavigate();

  const handleNavigate = (tab: TabType) => {
    const routes: Record<TabType, string> = {
      dashboard: '/',
      agenda: '/orders',
      productos: '/inventory',
      clientes: '/customers',
      proveedores: '/suppliers',
      caja: '/cash-flow',
      graficos: '/charts',
      calculadora: '/calculator',
      deudores: '/debtors',
      presupuesto: '/quotes',
      resumen: '/summary',
      asistente: '/assistant'
    };
    navigate(routes[tab]);
  };

  return (
    <Dashboard
      orders={orders}
      movements={movements}
      products={products}
      suppliers={suppliers}
      onManageStock={onManageStock}
      onNavigate={handleNavigate}
    />
  );
};

export default DashboardPage;
