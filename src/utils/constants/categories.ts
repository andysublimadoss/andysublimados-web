import React from 'react';
import { Scissors, Truck, Building2, MoreHorizontal } from 'lucide-react';

export const CASH_CATEGORIES = ['Modista', 'Transporte', 'Empresa', 'Varios'] as const;

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Modista': React.createElement(Scissors, { size: 14 }),
  'Transporte': React.createElement(Truck, { size: 14 }),
  'Empresa': React.createElement(Building2, { size: 14 }),
  'Varios': React.createElement(MoreHorizontal, { size: 14 })
};

export const INCOME_CATEGORIES = CASH_CATEGORIES;
export const EXPENSE_CATEGORIES = CASH_CATEGORIES;
