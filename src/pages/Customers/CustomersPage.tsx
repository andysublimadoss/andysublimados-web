import React from 'react';
import { CustomersList } from '@/features';
import { Customer, Order, TabType } from '@/types';
import { useNavigate } from 'react-router-dom';

interface CustomersPageProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  orders: Order[];
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const CustomersPage: React.FC<CustomersPageProps> = ({ customers, setCustomers, orders, showToast }) => {
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
    <CustomersList
      customers={customers}
      setCustomers={setCustomers}
      orders={orders}
      showToast={showToast}
      onNavigate={handleNavigate}
    />
  );
};

export default CustomersPage;
