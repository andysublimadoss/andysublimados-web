import React from 'react';
import { OrderStatus } from '@/types';
import { Clock, CheckCircle, Zap, Truck } from 'lucide-react';

export interface StatusConfig {
  color: string;
  label: string;
  dot: string;
  icon: React.ReactNode;
  lightColor: string;
}

export const getStatusConfig = (status: OrderStatus, isDelivered?: boolean): StatusConfig => {
  if (isDelivered) {
    return {
      color: 'bg-indigo-600 text-white',
      label: 'Entregado',
      dot: 'bg-indigo-600',
      icon: React.createElement(Truck, { size: 10, className: 'md:w-3 md:h-3' }),
      lightColor: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    };
  }
  switch(status) {
    case 'pedido':
      return {
        color: 'bg-amber-500 text-white',
        label: 'Pedido',
        dot: 'bg-amber-500',
        icon: React.createElement(Clock, { size: 10, className: 'md:w-3 md:h-3' }),
        lightColor: 'bg-amber-50 text-amber-600 border-amber-100'
      };
    case 'proceso':
      return {
        color: 'bg-blue-500 text-white',
        label: 'En Proceso',
        dot: 'bg-blue-500',
        icon: React.createElement(Zap, { size: 10, className: 'md:w-3 md:h-3' }),
        lightColor: 'bg-blue-50 text-blue-600 border-blue-100'
      };
    case 'terminado':
      return {
        color: 'bg-emerald-500 text-white',
        label: 'Terminado',
        dot: 'bg-emerald-500',
        icon: React.createElement(CheckCircle, { size: 10, className: 'md:w-3 md:h-3' }),
        lightColor: 'bg-emerald-50 text-emerald-600 border-emerald-100'
      };
  }
};
