import {
  Package, Calendar, Wallet, FileText, LayoutDashboard,
  Users, Truck, BarChart3, Calculator, AlertCircle, Sparkles, ChevronDown
} from 'lucide-react';
import { TabType } from '@/types';

export interface NavItem {
  id: TabType | 'calculadora-menu';
  label: string;
  icon: any;
  badge?: number;
  badgeColor?: string;
  children?: Array<{
    id: TabType;
    label: string;
  }>;
}

export const createNavItems = (
  todayOrdersCount: number,
  criticalStockCount: number,
  debtorsCount: number
): NavItem[] => [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'agenda', label: 'Agenda', icon: Calendar, badge: todayOrdersCount, badgeColor: 'bg-rose-500' },
  {
    id: 'calculadora-menu',
    label: 'Calculadora',
    icon: Calculator,
    children: [
      { id: 'calculadora', label: 'Calcular Costo' },
      { id: 'presupuesto', label: 'Presupuesto' }
    ]
  },
  { id: 'productos', label: 'Insumos', icon: Package, badge: criticalStockCount, badgeColor: 'bg-amber-500' },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'proveedores', label: 'Proveedores', icon: Truck },
  { id: 'caja', label: 'Caja', icon: Wallet },
  { id: 'graficos', label: 'Gráficos', icon: BarChart3 },
  { id: 'deudores', label: 'Deudores', icon: AlertCircle, badge: debtorsCount, badgeColor: 'bg-rose-600' },
];
