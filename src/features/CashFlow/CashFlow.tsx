
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, TrendingDown, Plus, Trash2, Wallet, Filter, Calendar,
  CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, X, ChevronDown, MoreHorizontal,
  Calculator, Banknote
} from 'lucide-react';
import { CashMovement, MovementType, PaymentMethod } from '@/types';
import { useCashFlow } from '@/hooks';
import { CASH_CATEGORIES, CATEGORY_ICONS, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/utils';

const DENOMINATIONS = [20000, 10000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5];

interface CashFlowProps {
  movements: CashMovement[];
  setMovements: React.Dispatch<React.SetStateAction<CashMovement[]>>;
  showToast?: (msg: string, type: 'success' | 'error') => void;
}

const CashFlow: React.FC<CashFlowProps> = ({ movements, setMovements, showToast }) => {
  const {
    formData,
    setFormData,
    handleAdd,
    deleteMovement
  } = useCashFlow({ movements, setMovements, showToast });

  const [filterType, setFilterType] = useState<'TODOS' | MovementType>('TODOS');
  const [filterCategory, setFilterCategory] = useState<string>('TODOS');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Cash Reconciliation State
  const [counts, setCounts] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    DENOMINATIONS.forEach(d => initial[d] = 0);
    return initial;
  });

  const cashTotals = useMemo(() => {
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

  const clearCashCount = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar el arqueo?')) {
      const reset: Record<number, number> = {};
      DENOMINATIONS.forEach(d => reset[d] = 0);
      setCounts(reset);
    }
  };

  const handleDeleteWithClose = (id: string) => {
    deleteMovement(id);
    setDeletingId(null);
  };

  const filteredMovements = movements.filter(m => {
    const matchesType = filterType === 'TODOS' || m.type === filterType;
    const matchesCategory = filterCategory === 'TODOS' || m.category === filterCategory;
    
    const movementDate = new Date(m.date).toISOString().split('T')[0];
    const matchesStart = !startDate || movementDate >= startDate;
    const matchesEnd = !endDate || movementDate <= endDate;
    
    return matchesType && matchesCategory && matchesStart && matchesEnd;
  });

  const totalIncome = filteredMovements.filter(m => m.type === MovementType.INGRESO).reduce((sum, m) => sum + m.amount, 0);
  const totalExpense = filteredMovements.filter(m => m.type === MovementType.EGRESO).reduce((sum, m) => sum + m.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-700">
      {/* Main Content - Left Side */}
      <div className="xl:col-span-8 space-y-10">
      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-50/50 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-xl shadow-emerald-100/20 border border-emerald-100 group hover:border-emerald-200 transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <TrendingUp size={60} className="md:w-20 md:h-20" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 md:p-3 bg-white text-emerald-600 rounded-xl md:rounded-2xl shadow-sm"><TrendingUp size={20} className="md:w-6 md:h-6" /></div>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-emerald-600/70">Ingresos {startDate || endDate ? 'Período' : 'Totales'}</span>
            </div>
            <ArrowUpRight className="text-emerald-400" size={16} />
          </div>
          <div className="text-3xl md:text-5xl font-black text-emerald-900 relative z-10 tracking-tighter">
            <span className="text-xl md:text-2xl mr-1 opacity-50">$</span>
            {totalIncome.toLocaleString()}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-rose-50/50 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-xl shadow-rose-100/20 border border-rose-100 group hover:border-rose-200 transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
            <TrendingDown size={60} />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white text-rose-600 rounded-2xl shadow-sm"><TrendingDown size={20} /></div>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-rose-600/70">Egresos {startDate || endDate ? 'del Período' : 'Totales'}</span>
            </div>
            <ArrowDownRight className="text-rose-400" size={16} />
          </div>
          <div className="text-3xl md:text-5xl font-black text-rose-900 relative z-10 tracking-tighter">
            <span className="text-xl md:text-2xl mr-1 opacity-50">$</span>
            {totalExpense.toLocaleString()}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-slate-200 text-white relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md"><Wallet size={20} /></div>
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] opacity-60">Balance {startDate || endDate ? 'del Período' : 'Neto'}</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
          <div className="text-3xl md:text-5xl font-black relative z-10 tracking-tighter">
            <span className="text-xl md:text-2xl mr-1 opacity-40">$</span>
            {balance.toLocaleString()}
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 transition-all duration-1000" 
                style={{ width: `${Math.min(100, (balance / (totalIncome || 1)) * 100)}%` }}
              ></div>
            </div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">Rentabilidad</span>
          </div>
        </motion.div>
      </div>

      {/* Registration Form */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl shadow-slate-200/20 border border-slate-100">
        <div className="flex items-center gap-4 mb-6 md:mb-10">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><Plus size={24} /></div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Registrar Movimiento</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mt-1">Control de flujo de caja en tiempo real</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
          <div className="lg:col-span-3 space-y-2">
            <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Descripción</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ej: Insumos, Tinta..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-5 md:px-6 py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] outline-none shadow-inner focus:ring-4 focus:ring-indigo-500/5 font-bold text-sm transition-all"
              />
            </div>
          </div>
          <div className="lg:col-span-3 space-y-2">
            <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Monto ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-6 md:left-7 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="number" 
                value={formData.amount || ''}
                onChange={e => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
                placeholder="0"
                className="w-full pl-14 md:pl-16 pr-5 md:pr-6 py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] outline-none shadow-inner focus:ring-4 focus:ring-indigo-500/5 font-black text-2xl md:text-3xl text-slate-900 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-2">
             <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipo</label>
             <div className="relative flex bg-slate-50 p-1.5 rounded-[1.5rem] md:rounded-[2rem] h-[56px] md:h-[64px] shadow-inner border border-slate-100 overflow-hidden">
                <motion.div
                  className={`absolute top-1.5 bottom-1.5 rounded-[1.2rem] md:rounded-[1.5rem] shadow-lg ${formData.type === MovementType.INGRESO ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  initial={false}
                  animate={{
                    left: formData.type === MovementType.INGRESO ? '6px' : '50%',
                    right: formData.type === MovementType.INGRESO ? '50%' : '6px',
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
                <button 
                  onClick={() => setFormData({...formData, type: MovementType.INGRESO, category: 'Varios'})}
                  className={`relative z-10 flex-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${formData.type === MovementType.INGRESO ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >Ingreso</button>
                <button 
                  onClick={() => setFormData({...formData, type: MovementType.EGRESO, category: 'Varios'})}
                  className={`relative z-10 flex-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${formData.type === MovementType.EGRESO ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >Egreso</button>
             </div>
          </div>
          <div className="lg:col-span-2 space-y-2">
            <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Medio</label>
            <div className="relative">
              <select 
                value={formData.method}
                onChange={e => setFormData({...formData, method: e.target.value as PaymentMethod})}
                className="w-full px-5 md:px-6 py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] outline-none shadow-inner focus:ring-4 focus:ring-indigo-500/5 font-bold text-sm transition-all appearance-none cursor-pointer pr-10 md:pr-12"
              >
                {[PaymentMethod.EFECTIVO, PaymentMethod.DIGITAL].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-2">
            <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoría</label>
            <div className="relative">
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-5 md:px-6 py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] outline-none shadow-inner focus:ring-4 focus:ring-indigo-500/5 font-bold text-sm transition-all appearance-none cursor-pointer pr-10 md:pr-12"
              >
                {(formData.type === MovementType.INGRESO ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div className="lg:col-span-2 flex items-end">
            <button 
              onClick={handleAdd}
              className="w-full bg-slate-900 text-white px-6 md:px-8 py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 h-[56px] md:h-[64px] active:scale-95 group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              <span className="text-[10px] md:text-xs">Cargar</span>
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-[3.5rem] shadow-xl shadow-slate-200/20 border border-slate-100 overflow-hidden">
        <div className="px-4 md:px-10 py-6 md:py-8 border-b border-slate-50 bg-slate-50/50 flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="p-2.5 md:p-3 bg-indigo-600 text-white rounded-xl md:rounded-2xl shadow-xl shadow-indigo-200"><Wallet size={18} /></div>
            <div>
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px] md:text-sm">Historial de Movimientos</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[7px] md:text-[9px] mt-0.5">Registro detallado de transacciones</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full lg:w-auto">
            {/* Date Range Filter */}
            <div className="flex items-center bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] p-1 shadow-sm overflow-x-auto custom-scrollbar max-w-full">
              <div className="px-3 md:px-4 py-1.5 md:py-2 text-[8px] md:text-[10px] font-black text-slate-300 border-r border-slate-100 flex items-center gap-2 whitespace-nowrap"><Calendar size={12}/> FECHAS</div>
              <div className="flex items-center gap-2 px-3">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-transparent text-[8px] md:text-[10px] font-bold text-slate-600 outline-none"
                />
                <span className="text-slate-300 text-[8px] md:text-[10px] font-black">A</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="bg-transparent text-[8px] md:text-[10px] font-bold text-slate-600 outline-none"
                />
                {(startDate || endDate) && (
                  <button 
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] p-1 shadow-sm overflow-x-auto custom-scrollbar max-w-full">
              <div className="px-3 md:px-4 py-1.5 md:py-2 text-[8px] md:text-[10px] font-black text-slate-300 border-r border-slate-100 flex items-center gap-2 whitespace-nowrap"><Filter size={12}/> TIPO</div>
              <div className="flex gap-1 ml-1">
                {(['TODOS', MovementType.INGRESO, MovementType.EGRESO] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setFilterType(t);
                      setFilterCategory('TODOS');
                    }}
                    className={`px-3 md:px-5 py-1.5 md:py-2 rounded-[1rem] md:rounded-[1.5rem] text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            {filterType !== 'TODOS' && (
              <div className="flex items-center bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] p-1 shadow-sm overflow-x-auto custom-scrollbar max-w-full">
                <div className="px-3 md:px-4 py-1.5 md:py-2 text-[8px] md:text-[10px] font-black text-slate-300 border-r border-slate-100 flex items-center gap-2 whitespace-nowrap"><Filter size={12}/> CATEGORÍA</div>
                <div className="flex gap-1 ml-1 overflow-x-auto custom-scrollbar no-scrollbar">
                  <button
                    onClick={() => setFilterCategory('TODOS')}
                    className={`px-3 md:px-5 py-1.5 md:py-2 rounded-[1rem] md:rounded-[1.5rem] text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterCategory === 'TODOS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    TODAS
                  </button>
                  {(filterType === MovementType.INGRESO ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                    <button
                      key={c}
                      onClick={() => setFilterCategory(c)}
                      className={`px-3 md:px-5 py-1.5 md:py-2 rounded-[1rem] md:rounded-[1.5rem] text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${filterCategory === c ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {CATEGORY_ICONS[c]}
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-4 md:px-10 py-4 md:py-6">Fecha / Hora</th>
                <th className="px-4 md:px-10 py-4 md:py-6">Descripción / Categoría</th>
                <th className="px-4 md:px-10 py-4 md:py-6">Método</th>
                <th className="px-4 md:px-10 py-4 md:py-6 text-right">Monto</th>
                <th className="px-4 md:px-10 py-4 md:py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredMovements.map((m, idx) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    key={m.id} 
                    className={`transition-colors group ${
                      m.type === MovementType.INGRESO 
                        ? 'bg-emerald-50/20 hover:bg-emerald-50/50' 
                        : 'bg-rose-50/20 hover:bg-rose-50/50'
                    }`}
                  >
                    <td className="px-4 md:px-10 py-4 md:py-6 whitespace-nowrap">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-1.5 md:p-2 bg-white rounded-lg md:rounded-xl shadow-sm text-slate-400">
                          <Calendar size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs md:text-sm font-black text-slate-700">{new Date(m.date).toLocaleDateString('es-AR')}</span>
                          <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(m.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-10 py-4 md:py-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-sm ${m.type === MovementType.INGRESO ? 'text-emerald-600 bg-white' : 'text-rose-600 bg-white'}`}>
                          {m.type === MovementType.INGRESO ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-700 tracking-tight text-xs md:text-base">{m.description}</span>
                          {m.category && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-indigo-400">{CATEGORY_ICONS[m.category] || <MoreHorizontal size={10} />}</span>
                              <span className="text-[8px] md:text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{m.category}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-10 py-4 md:py-6">
                      <div className="flex items-center gap-2 md:gap-3">
                        <CreditCard size={12} className="text-slate-300" />
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-100 px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-sm">{m.method}</span>
                      </div>
                    </td>
                    <td className={`px-4 md:px-10 py-4 md:py-6 text-right font-black text-lg md:text-2xl tracking-tighter ${m.type === MovementType.INGRESO ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <span className="text-xs mr-0.5 md:mr-1 opacity-50">{m.type === MovementType.INGRESO ? '+' : '-'}$</span>
                      {m.amount.toLocaleString()}
                    </td>
                    <td className="px-4 md:px-10 py-4 md:py-6 text-right">
                      {deletingId === m.id ? (
                        <div className="flex items-center justify-end gap-2 animate-in fade-in zoom-in duration-200">
                          <button 
                            onClick={() => deleteMovement(m.id)} 
                            className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 active:scale-95"
                          >
                            Borrar
                          </button>
                          <button 
                            onClick={() => setDeletingId(null)} 
                            className="p-1.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeletingId(m.id)} 
                          className="p-2 md:p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg md:rounded-xl transition-all active:scale-90 shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredMovements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-10 bg-slate-50 rounded-full mb-6 text-slate-200 animate-pulse">
                        <Wallet size={64} />
                      </div>
                      <p className="font-black uppercase tracking-[0.2em] text-slate-300 text-sm">Sin movimientos registrados</p>
                      <p className="text-slate-400 font-bold text-xs mt-2">Los nuevos registros aparecerán aquí</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Cash Reconciliation Sidebar - Right Side */}
      <div className="xl:col-span-4 space-y-6">
        {/* Sticky Sidebar */}
        <div className="sticky top-20 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calculator size={20} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight">Arqueo de Caja</h3>
            </div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Contador de Efectivo</p>
          </div>

          {/* Denominations Input */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {DENOMINATIONS.map((denom) => (
              <div
                key={denom}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm ${denom >= 1000 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    ${denom}
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">Total</span>
                    <span className="font-bold text-slate-900 text-sm">${cashTotals.perDenom[denom].toLocaleString()}</span>
                  </div>
                </div>

                <div className="relative w-20">
                  <input
                    type="number"
                    min="0"
                    value={counts[denom] || ''}
                    onChange={(e) => handleCountChange(denom, e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 font-black text-slate-900 text-center focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Wallet className="text-indigo-400" size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest">Total</h3>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-4">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-1">Efectivo Contado</span>
              <div className="text-3xl font-black tracking-tighter">
                ${cashTotals.grandTotal.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar mb-4">
              {DENOMINATIONS.map(denom => counts[denom] > 0 && (
                <div key={denom} className="flex justify-between items-center px-3 py-2 bg-white/5 rounded-xl">
                  <span className="text-xs font-bold text-indigo-300">{counts[denom]} × ${denom}</span>
                  <span className="font-black text-white text-sm">${cashTotals.perDenom[denom].toLocaleString()}</span>
                </div>
              ))}
              {Object.values(counts).every(c => c === 0) && (
                <div className="text-center py-3 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  Sin billetes
                </div>
              )}
            </div>

            <button
              onClick={clearCashCount}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 text-xs"
            >
              <Trash2 size={16} />
              Limpiar
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
            <div className="flex gap-3">
              <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                <Banknote size={16} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs mb-1 uppercase tracking-tight">Tip</h4>
                <p className="text-slate-600 text-[10px] leading-relaxed font-medium">
                  Cuenta los billetes al cierre y verifica que coincida con el balance de movimientos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
