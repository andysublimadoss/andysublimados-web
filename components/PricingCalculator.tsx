
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, Plus, Trash2, Info, Save, RefreshCcw, 
  DollarSign, Percent, Package, ShoppingCart, TrendingUp,
  FileText, ArrowRight, HelpCircle, User, Briefcase, FileCheck,
  Search, ChevronDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product } from '../types';

interface CostItem {
  id: string;
  description: string;
  cost: number;
}

interface PricingCalculatorProps {
  products?: Product[];
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({ products = [] }) => {
  const [items, setItems] = useState<CostItem[]>(() => {
    const saved = localStorage.getItem('andy_calc_items');
    return saved ? JSON.parse(saved) : [{ id: crypto.randomUUID(), description: '', cost: 0 }];
  });
  const [quantity, setQuantity] = useState<number>(() => {
    const saved = localStorage.getItem('andy_calc_qty');
    return saved ? Number(saved) : 1;
  });
  const [margin, setMargin] = useState<number>(() => {
    const saved = localStorage.getItem('andy_calc_margin');
    return saved ? Number(saved) : 100;
  });
  const [clientName, setClientName] = useState(() => localStorage.getItem('andy_calc_client') || '');
  const [projectName, setProjectName] = useState(() => localStorage.getItem('andy_calc_project') || '');
  const [notes, setNotes] = useState(() => localStorage.getItem('andy_calc_notes') || '');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState('Presupuesto');
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('andy_calc_items', JSON.stringify(items));
    localStorage.setItem('andy_calc_qty', quantity.toString());
    localStorage.setItem('andy_calc_margin', margin.toString());
    localStorage.setItem('andy_calc_client', clientName);
    localStorage.setItem('andy_calc_project', projectName);
    localStorage.setItem('andy_calc_notes', notes);
  }, [items, quantity, margin, clientName, projectName, notes]);

  const addItem = (description = '', cost = 0) => {
    setItems([...items, { id: crypto.randomUUID(), description, cost }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      setItems([{ id: crypto.randomUUID(), description: '', cost: 0 }]);
    }
  };

  const updateItem = (id: string, updates: Partial<CostItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const totals = useMemo(() => {
    const unitCost = items.reduce((acc, item) => acc + (item.cost || 0), 0);
    const totalCost = unitCost * quantity;
    const marginMultiplier = 1 + (margin / 100);
    
    // Subtotal before taxes
    const suggestedUnitPrice = unitCost * marginMultiplier;
    const suggestedTotalPrice = suggestedUnitPrice * quantity;
    
    const totalProfit = suggestedTotalPrice - totalCost;

    return {
      unitCost,
      totalCost,
      suggestedUnitPrice,
      suggestedTotalPrice,
      totalProfit
    };
  }, [items, quantity, margin]);

  const resetAll = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar toda la calculadora?')) {
      setItems([{ id: crypto.randomUUID(), description: '', cost: 0 }]);
      setQuantity(1);
      setMargin(100);
      setClientName('');
      setProjectName('');
      setNotes('');
    }
  };

  const handleDownload = async () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-AR');
    const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    
    const doc = new jsPDF();
    
    // Add Logo
    try {
      const img = new Image();
      img.src = '/logo.png';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      doc.addImage(img, 'PNG', 14, 10, 20, 20);
    } catch (e) {
      console.warn('Could not load logo', e);
    }

    // Company Info (Right Aligned)
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('ANDY SUBLIMADOS', 196, 15, { align: 'right' });
    doc.text('Gestión de Presupuestos Profesionales', 196, 20, { align: 'right' });

    // Header
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESUPUESTO', 14, 45);
    
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229);
    doc.text(`#${now.getTime().toString().slice(-6)}`, 14, 52);

    // Client/Project Info Box
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 60, 182, 35, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, 60, 182, 35, 'S');

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE:', 20, 70);
    doc.text('PROYECTO:', 20, 78);
    doc.text('FECHA:', 20, 86);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(clientName || 'Consumidor Final', 45, 70);
    doc.text(projectName || 'Sin nombre de proyecto', 45, 78);
    doc.text(`${dateStr} - ${timeStr}`, 45, 86);

    // Items Table
    const tableData = items.map((item, i) => [
      item.description || `Item ${i + 1}`,
      `$${(item.cost || 0).toLocaleString('es-AR')}`
    ]);

    autoTable(doc, {
      startY: 105,
      head: [['Descripción del Insumo/Servicio', 'Costo Unitario Base']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontStyle: 'bold', halign: 'left' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        1: { halign: 'right', cellWidth: 40 }
      },
      margin: { left: 14, right: 14 },
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    let currentY = finalY;
    
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    // Summary Box
    const summaryX = 120;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    
    currentY += 12;
    doc.setLineWidth(0.5);
    doc.line(summaryX, currentY - 6, 196, currentY - 6);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL:', summaryX, currentY);
    doc.text(`$${Math.round(totals.suggestedTotalPrice).toLocaleString('es-AR')}`, 196, currentY, { align: 'right' });

    // Notes
    if (notes) {
      currentY += 25;
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('NOTAS:', 14, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const splitNotes = doc.splitTextToSize(notes, 182);
      doc.text(splitNotes, 14, currentY + 6);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Este presupuesto tiene una validez de 7 días corridos.', 105, 285, { align: 'center' });

    doc.save(`${fileName.replace(/\s+/g, '_')}_${now.getTime()}.pdf`);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Filename Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl border border-slate-100"
            >
              <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Finalizar Presupuesto</h3>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Archivo</label>
                <input 
                  type="text" 
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  autoFocus
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-3xl text-lg font-bold text-slate-900 transition-all outline-none"
                  placeholder="Ej: Presupuesto_Juan"
                />
              </div>
              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDownload}
                  className="flex-1 py-5 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-500 transition-all"
                >
                  Generar PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl shadow-inner">
            <Calculator size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Calculadora <span className="text-indigo-600 italic">Pro.</span></h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Cotizaciones precisas y profesionales</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={resetAll}
            className="p-4 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 active:scale-95"
            title="Reiniciar todo"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      {/* Project Info Card */}
      <div className="bg-white p-8 md:p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            <User size={12} /> Cliente
          </div>
          <input 
            type="text" 
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Nombre del cliente..."
            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-900 transition-all outline-none"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            <Briefcase size={12} /> Proyecto
          </div>
          <input 
            type="text" 
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Nombre del proyecto..."
            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-900 transition-all outline-none"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            <FileCheck size={12} /> Notas Internas
          </div>
          <input 
            type="text" 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones..."
            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-sm font-bold text-slate-900 transition-all outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Items List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 md:p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Package size={20} className="text-indigo-600" />
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Estructura de Costos</h3>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setShowProductSearch(!showProductSearch)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                  >
                    <Search size={14} />
                    Insumos Stock
                    <ChevronDown size={14} className={`transition-transform ${showProductSearch ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showProductSearch && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-20 max-h-64 overflow-y-auto p-2"
                      >
                        {products.length > 0 ? products.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              addItem(p.name, p.price);
                              setShowProductSearch(false);
                            }}
                            className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl transition-colors flex justify-between items-center group"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-900">{p.name}</span>
                              <span className="text-[9px] text-slate-400 uppercase font-black">{p.category}</span>
                            </div>
                            <span className="text-xs font-black text-indigo-600 group-hover:scale-110 transition-transform">${p.price}</span>
                          </button>
                        )) : (
                          <div className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">No hay productos</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => addItem()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-200"
                >
                  <Plus size={14} />
                  Manual
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {items.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 group"
                  >
                    <div className="flex-1 grid grid-cols-12 gap-3">
                      <div className="col-span-7 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                          <FileText size={16} />
                        </div>
                        <input 
                          type="text" 
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          placeholder="Descripción..."
                          className="w-full pl-10 pr-4 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-base font-bold text-slate-900 transition-all outline-none"
                        />
                      </div>
                      <div className="col-span-5 relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                          <DollarSign size={16} />
                        </div>
                        <input 
                          type="number" 
                          value={item.cost || ''}
                          onChange={(e) => updateItem(item.id, { cost: Number(e.target.value) })}
                          placeholder="Costo"
                          className="w-full pl-10 pr-4 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl text-xl font-black text-slate-900 transition-all outline-none"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Costo Unitario Base</span>
              <span className="text-2xl font-black text-slate-900">${totals.unitCost.toLocaleString()}</span>
            </div>
          </div>

          {/* Config Section */}
          <div className="bg-white p-8 md:p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart size={18} className="text-indigo-600" />
                <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">Cantidad del Pedido</h4>
              </div>
              <div className="relative group">
                <input 
                  type="number" 
                  min="1"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-3xl text-xl font-black text-slate-900 transition-all outline-none"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">Unidades</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Percent size={18} className="text-indigo-600" />
                  <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">Margen de Ganancia</h4>
                </div>
                <span className="text-indigo-600 font-black text-sm">{margin}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="500" 
                step="5"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest">
                <span>Costo</span>
                <span>Doble</span>
                <span>Triple</span>
                <span>500%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-10 space-y-8">
            <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-slate-900/30 relative overflow-hidden group flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-600/30 transition-all duration-700"></div>
              
              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-3 mb-10">
                  <TrendingUp size={20} className="text-indigo-400" />
                  <h4 className="text-[11px] font-black text-indigo-300 uppercase tracking-[0.2em]">Resumen de Cotización</h4>
                </div>

                <div className="space-y-10">
                  {/* Total Order Price */}
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Final ({quantity} u.)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-indigo-400">$</span>
                      <span className="text-7xl font-black tracking-tighter leading-none">
                        {Math.round(totals.suggestedTotalPrice).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Precio Sugerido por Unidad</span>
                    <div className="text-3xl font-black text-white">
                      ${Math.round(totals.suggestedUnitPrice).toLocaleString()}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Costo Total</span>
                      <p className="text-lg font-black text-slate-300">${Math.round(totals.totalCost).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Ganancia Neta</span>
                      <p className="text-lg font-black text-emerald-400">+${Math.round(totals.totalProfit).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-3xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-3 group/btn active:scale-95"
                >
                  <Save size={18} />
                  Exportar Presupuesto PDF
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            <div className="bg-indigo-50 p-8 rounded-[3.5rem] flex items-start gap-5">
              <HelpCircle size={24} className="text-indigo-600 mt-1 shrink-0" />
              <div>
                <h5 className="text-sm font-black text-indigo-900 uppercase tracking-tight mb-2">Modo Profesional</h5>
                <p className="text-xs font-bold text-indigo-900/60 leading-relaxed">
                  Podés importar insumos directamente desde tu stock para agilizar la carga. 
                  No te olvides de completar los datos del cliente para que el PDF se vea impecable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
