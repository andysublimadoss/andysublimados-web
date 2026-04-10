
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, ChevronLeft, ChevronRight, FileText, Download, 
  TrendingUp, TrendingDown, Wallet, PieChart, ArrowUpRight, ArrowDownRight,
  CalendarDays
} from 'lucide-react';
import { CashMovement, MovementType } from '@/types';

interface MonthlySummaryProps {
  movements: CashMovement[];
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ movements }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const changeMonth = (delta: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentDate(d);
  };

  const monthName = currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  const monthlyMovements = movements.filter(m => {
    const d = new Date(m.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const income = monthlyMovements.filter(m => m.type === MovementType.INGRESO).reduce((s, m) => s + m.amount, 0);
  const expense = monthlyMovements.filter(m => m.type === MovementType.EGRESO).reduce((s, m) => s + m.amount, 0);
  const net = income - expense;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header & Month Selector */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl shadow-inner">
            <CalendarDays size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Resumen Mensual</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Balance de rentabilidad por periodo</p>
          </div>
        </div>
        
        <div className="flex items-center bg-slate-50 rounded-3xl p-2 border border-slate-100 shadow-inner">
          <button onClick={() => changeMonth(-1)} className="p-4 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400 hover:text-indigo-600"><ChevronLeft size={24} /></button>
          <span className="px-8 font-black text-slate-700 capitalize min-w-50 text-center text-lg tracking-tight">{monthName}</span>
          <button onClick={() => changeMonth(1)} className="p-4 hover:bg-white hover:shadow-md rounded-2xl transition-all text-slate-400 hover:text-indigo-600"><ChevronRight size={24} /></button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3.5rem] shadow-xl shadow-slate-200/20 border border-slate-100 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-100 transition-colors"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ingresos</h4>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={20}/></div>
          </div>
          <p className="text-5xl font-black text-slate-900 tracking-tighter relative z-10">${income.toLocaleString()}</p>
          <div className="mt-6 flex items-center gap-2 text-emerald-500 font-bold text-xs relative z-10">
             <ArrowUpRight size={14} />
             <span>Entrada de capital</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-10 rounded-[3.5rem] shadow-xl shadow-slate-200/20 border border-slate-100 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-rose-100 transition-colors"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Egresos</h4>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><TrendingDown size={20}/></div>
          </div>
          <p className="text-5xl font-black text-slate-900 tracking-tighter relative z-10">${expense.toLocaleString()}</p>
          <div className="mt-6 flex items-center gap-2 text-rose-400 font-bold text-xs relative z-10">
             <ArrowDownRight size={14} />
             <span>Gastos operativos</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group ${net >= 0 ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-rose-600 text-white shadow-rose-600/20'}`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h4 className="text-[11px] font-black opacity-60 uppercase tracking-widest">Ganancia Neta</h4>
            <div className="p-3 bg-white/10 rounded-2xl"><Wallet size={20}/></div>
          </div>
          <p className="text-5xl font-black tracking-tighter relative z-10">${net.toLocaleString()}</p>
          <div className="mt-6 flex items-center gap-2 opacity-60 font-bold text-xs relative z-10">
             <PieChart size={14} />
             <span>Resultado del periodo</span>
          </div>
        </motion.div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-[3.5rem] shadow-xl shadow-slate-200/20 border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Detalle de Movimientos</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Historial completo del mes</p>
            </div>
          </div>
          <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm active:scale-95">
            <Download size={18} />
            Exportar Reporte
          </button>
        </div>
        
        <div className="p-10">
          {monthlyMovements.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pb-6 px-6">
                <span className="col-span-1">Día</span>
                <span className="col-span-6">Concepto</span>
                <span className="col-span-2 text-right">Monto</span>
                <span className="col-span-3 text-right">Saldo Parcial</span>
              </div>
              <div className="space-y-2">
                {monthlyMovements.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((m, idx) => {
                  const partialBalance = monthlyMovements
                    .slice(0, idx + 1)
                    .reduce((acc, curr) => curr.type === MovementType.INGRESO ? acc + curr.amount : acc - curr.amount, 0);

                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={m.id}
                      className="grid grid-cols-12 items-center p-6 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 rounded-3xl border border-transparent hover:border-slate-100 transition-all group"
                    >
                      <div className="col-span-1">
                        <span className="w-10 h-10 flex items-center justify-center bg-white rounded-xl font-black text-slate-400 text-xs shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors">{new Date(m.date).getDate()}</span>
                      </div>
                      <div className="col-span-6">
                        <p className="font-bold text-slate-700 truncate pr-4">{m.description}</p>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">{m.category || 'General'}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className={`font-black text-sm ${m.type === MovementType.INGRESO ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {m.type === MovementType.INGRESO ? '+' : '-'}${m.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="col-span-3 text-right">
                        <span className="text-xs font-black text-slate-400 bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">${partialBalance.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="p-10 bg-slate-50 rounded-full inline-block mb-6 text-slate-200">
                <FileText size={64} />
              </div>
              <h4 className="font-black text-slate-900 text-xl tracking-tight mb-2">Sin movimientos agendados</h4>
              <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px] max-w-xs mx-auto leading-relaxed">
                No hay registros financieros para el periodo seleccionado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;
