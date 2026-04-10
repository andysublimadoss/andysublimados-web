import React from 'react';
import { DebtorCustomers } from '@/features';
import { Order, TabType } from '@/types';
import { useNavigate } from 'react-router-dom';

interface DebtorsPageProps {
  orders: Order[];
}

const DebtorsPage: React.FC<DebtorsPageProps> = ({ orders }) => {
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

  return <DebtorCustomers orders={orders} onNavigate={handleNavigate} />;
};

export default DebtorsPage;
