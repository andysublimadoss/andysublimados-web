
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calculator, Trash2, Save, Download, Wallet, Banknote, Coins, ArrowRight } from 'lucide-react';

const DENOMINATIONS = [20000, 10000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5];

const CashReconciliation: React.FC = () => {
  const [counts, setCounts] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    DENOMINATIONS.forEach(d => initial[d] = 0);
    return initial;
  });

  const totals = useMemo(() => {
    const perDenom: Record<number, number> = {};
    let grandTotal = 0;
    DENOMINATIONS.forEach(d => {
      const val = d * (counts[d] || 0);
      perDenom[d] = val;
      grandTotal += val;
    });
    return { perDenom, grandTotal };
  }, [counts]);

  const handleCountChange = (denom: number, value: string) => {
    const num = parseInt(value) || 0;
    setCounts(prev => ({ ...prev, [denom]: num >= 0 ? num : 0 }));
  };

  const clearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todo el arqueo?')) {
      const reset: Record<number, number> = {};
      DENOMINATIONS.forEach(d => reset[d] = 0);
      setCounts(reset);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-200 flex items-center justify-center text-white rotate-3">
            <Calculator size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Arqueo de Caja</h1>
            <p className="text-slate-500 font-bold text-sm md:text-base uppercase tracking-widest flex items-center gap-2">
              <Banknote size={16} className="text-indigo-400" />
              Control de Efectivo Físico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={clearAll}
            className="p-4 bg-white border border-slate-100 text-rose-500 rounded-2xl hover:bg-rose-50 transition-all shadow-sm flex items-center gap-2 font-bold text-sm"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DENOMINATIONS.map((denom) => (
              <motion.div 
                key={denom}
                whileHover={{ scale: 1.02 }}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg ${denom >= 1000 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                    ${denom}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block">Billetes</span>
                    <span className="font-bold text-slate-900">{formatCurrency(totals.perDenom[denom])}</span>
                  </div>
                </div>
                
                <div className="relative w-24">
                  <input 
                    type="number"
                    min="0"
                    value={counts[denom] || ''}
                    onChange={(e) => handleCountChange(denom, e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-black text-slate-900 text-center focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary Section */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Wallet className="text-indigo-400" size={24} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest">Resumen Total</h2>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-2">Total en Efectivo</span>
                <div className="text-4xl md:text-5xl font-black tracking-tighter">
                  {formatCurrency(totals.grandTotal)}
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {DENOMINATIONS.map(denom => counts[denom] > 0 && (
                  <div key={denom} className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">${denom}</span>
                      <span className="text-xs font-bold text-indigo-300">{counts[denom]} {counts[denom] === 1 ? 'billete' : 'billetes'}</span>
                    </div>
                    <span className="font-black text-white text-sm">
                      {formatCurrency(totals.perDenom[denom])}
                    </span>
                  </div>
                ))}
                {Object.values(counts).every(c => c === 0) && (
                  <div className="text-center py-4 text-slate-500 text-xs font-bold uppercase tracking-widest italic">
                    Sin billetes cargados
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 text-slate-400 text-xs font-medium mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Cálculo en tiempo real
                </div>
                
                <button 
                  onClick={() => window.print()}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Download size={18} />
                  Imprimir Arqueo
                </button>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
            <div className="flex gap-4">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                <Banknote size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm mb-1 uppercase tracking-tight">Consejo de Caja</h4>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Realiza el arqueo al final de cada jornada para asegurar que el físico coincida con los movimientos registrados en la pestaña de Caja.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashReconciliation;
