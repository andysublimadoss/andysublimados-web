
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Users, DollarSign, AlertCircle, Phone, Calendar, ArrowRight, MessageCircle } from 'lucide-react';
import { Order } from '../types';

interface DebtorCustomersProps {
  orders: Order[];
  onNavigate?: (tab: string) => void;
}

const DebtorCustomers: React.FC<DebtorCustomersProps> = ({ orders, onNavigate }) => {
  const debtorData = useMemo(() => {
    const debtorsMap = new Map<string, { name: string, whatsapp: string, totalDebt: number, ordersCount: number, lastOrderDate: string, oldestOrderDate: string }>();
    
    orders.forEach(order => {
      if (!order.remainingPaid && order.remainingAmount > 0) {
        const key = order.whatsapp || order.customerName;
        const current = debtorsMap.get(key) || { 
          name: order.customerName, 
          whatsapp: order.whatsapp, 
          totalDebt: 0, 
          ordersCount: 0, 
          lastOrderDate: order.deliveryDate,
          oldestOrderDate: order.createdAt || order.deliveryDate
        };
        
        current.totalDebt += order.remainingAmount;
        current.ordersCount += 1;
        
        if (new Date(order.deliveryDate) > new Date(current.lastOrderDate)) {
          current.lastOrderDate = order.deliveryDate;
        }
        
        const orderCreationDate = order.createdAt || order.deliveryDate;
        if (new Date(orderCreationDate) < new Date(current.oldestOrderDate)) {
          current.oldestOrderDate = orderCreationDate;
        }
        
        debtorsMap.set(key, current);
      }
    });
    
    const list = Array.from(debtorsMap.values()).sort((a, b) => b.totalDebt - a.totalDebt);
    const totalAmount = list.reduce((sum, d) => sum + d.totalDebt, 0);
    const totalCustomers = list.length;
    
    return { list, totalAmount, totalCustomers };
  }, [orders]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="p-3 md:p-4 bg-rose-50 text-rose-600 rounded-2xl md:rounded-3xl shadow-inner">
            <DollarSign size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Clientes Deudores</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mt-1">Control de saldos pendientes de cobro</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6"
        >
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clientes con Deuda</p>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900">{debtorData.totalCustomers}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6"
        >
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total por Cobrar</p>
            <h3 className="text-3xl md:text-4xl font-black text-rose-600 tracking-tighter">
              ${debtorData.totalAmount.toLocaleString()}
            </h3>
          </div>
        </motion.div>
      </div>

      {/* Debtors List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="p-8 md:p-10 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Detalle de Deudores</h3>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
            <AlertCircle size={16} className="text-rose-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saldos Pendientes</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedidos Pendientes</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deuda desde</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Último Pedido</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Monto Adeudado</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {debtorData.list.length > 0 ? (
                debtorData.list.map((debtor, idx) => (
                  <motion.tr 
                    key={debtor.whatsapp || debtor.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm">
                          {debtor.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{debtor.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {debtor.whatsapp ? (
                        <a 
                          href={`https://wa.me/${debtor.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${debtor.name}, te escribo de Andy Sublimados por tu saldo pendiente de $${debtor.totalDebt.toLocaleString()}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline"
                        >
                          <MessageCircle size={14} />
                          {debtor.whatsapp}
                        </a>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                          <Phone size={14} />
                          Sin contacto
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black">
                        {debtor.ordersCount} {debtor.ordersCount === 1 ? 'pedido' : 'pedidos'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                          <Calendar size={14} />
                          {new Date(debtor.oldestOrderDate).toLocaleDateString()}
                        </div>
                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">
                          Hace {Math.floor((new Date().getTime() - new Date(debtor.oldestOrderDate).getTime()) / (1000 * 60 * 60 * 24))} días
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                        <Calendar size={14} />
                        {new Date(debtor.lastOrderDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-lg font-black text-rose-600 tracking-tight">
                        ${debtor.totalDebt.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => onNavigate?.('agenda')}
                        className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 bg-emerald-50 text-emerald-500 rounded-full">
                        <DollarSign size={48} />
                      </div>
                      <h4 className="text-xl font-black text-slate-900">¡Sin deudas pendientes!</h4>
                      <p className="text-slate-400 font-medium max-w-xs mx-auto">Todos tus clientes están al día con sus pagos.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DebtorCustomers;
