
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Truck, Phone, Mail, Tag, X, Trash2, Edit2, MessageCircle, ExternalLink, FilterX, ChevronDown, AlertCircle, Bookmark, ArrowRight, Save } from 'lucide-react';
import { Supplier } from '@/types';

interface SuppliersListProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  showToast?: (msg: string, type: 'success' | 'error') => void;
}

const SuppliersList: React.FC<SuppliersListProps> = ({ suppliers, setSuppliers, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({
    name: '',
    phone: '',
    email: '',
    category: '',
    notes: ''
  });

  const summaryStats = useMemo(() => {
    return {
      total: suppliers.length,
      categories: new Set(suppliers.map(s => s.category).filter(Boolean)).size
    };
  }, [suppliers]);

  const categories = useMemo(() => {
    const cats = suppliers
      .map(s => s.category)
      .filter(Boolean)
      .map(c => c.trim());
    return ['Todas', ...Array.from(new Set(cats))];
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const term = searchTerm.toLowerCase().trim();
      const sName = (s.name || '').toLowerCase();
      const sCategory = (s.category || '').toLowerCase();
      const sNotes = (s.notes || '').toLowerCase();
      
      const matchesSearch = sName.includes(term) || 
                            sCategory.includes(term) ||
                            sNotes.includes(term);
      
      const matchesCategory = categoryFilter === 'Todas' || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [suppliers, searchTerm, categoryFilter]);

  const handleSave = () => {
    if (!formData.name.trim()) {
      showToast?.("El nombre es obligatorio", "error");
      return;
    }
    
    const finalData = {
      ...formData,
      category: formData.category.trim() || 'General'
    };
    
    if (editingId) {
      setSuppliers(prev => prev.map(s => String(s.id) === String(editingId) ? { ...finalData, id: s.id } : s));
      showToast?.("Proveedor actualizado con éxito", "success");
    } else {
      setSuppliers(prev => [...prev, { ...finalData, id: `SUP-${Date.now()}` }]);
      showToast?.("Proveedor registrado con éxito", "success");
    }
    closeModal();
  };

  const openModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingId(supplier.id);
      setFormData({
        name: supplier.name,
        phone: supplier.phone,
        email: supplier.email,
        category: supplier.category,
        notes: supplier.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', phone: '', email: '', category: '', notes: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // Autosave effect for editing
  React.useEffect(() => {
    if (isModalOpen && editingId && formData.name.trim()) {
      const timer = setTimeout(() => {
        setSuppliers(prev => prev.map(s => String(s.id) === String(editingId) ? { ...formData, id: s.id } : s));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData, editingId, isModalOpen, setSuppliers]);

  const executeDelete = () => {
    if (deleteConfirmId) {
      setSuppliers(prev => prev.filter(s => String(s.id) !== String(deleteConfirmId)));
      showToast?.("Proveedor eliminado permanentemente", "success");
      setDeleteConfirmId(null);
    }
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) {
      showToast?.("No hay un número registrado", "error");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
        showToast?.("Número inválido", "error");
        return;
    }
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl shadow-inner">
            <Truck size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Proveedores</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Tu red de suministros para Andy Sublimados</p>
          </div>
        </div>
        
        <button 
          onClick={() => openModal()} 
          className="w-full lg:w-auto bg-slate-900 text-white px-10 py-5 rounded-[2rem] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl hover:-translate-y-1 active:scale-95 group"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform" />
          <span className="font-black uppercase tracking-widest text-[11px]">Nuevo Proveedor</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white p-6 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, rubro o notas..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none shadow-inner focus:ring-4 focus:ring-indigo-500/5 font-bold text-sm transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="md:col-span-4 relative">
          <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-16 pr-12 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none shadow-inner focus:ring-4 focus:ring-indigo-500/5 font-black text-[11px] uppercase tracking-widest appearance-none cursor-pointer text-slate-600"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat} {cat !== 'Todas' ? `(${suppliers.filter(s => s.category === cat).length})` : ''}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
        </div>

        <button 
          onClick={() => { setSearchTerm(''); setCategoryFilter('Todas'); }}
          className="md:col-span-2 flex items-center justify-center gap-3 py-5 bg-slate-100 text-slate-500 rounded-[2rem] hover:bg-slate-200 transition-all font-black uppercase text-[10px] tracking-widest active:scale-95"
        >
          <FilterX size={18} />
          Limpiar
        </button>
      </div>

      {/* Grid of Suppliers */}
      {filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredSuppliers.map((s, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={s.id} 
                className="bg-white rounded-[3.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/30 relative overflow-hidden group hover:shadow-2xl transition-all"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-50 text-indigo-600 rounded-[1.8rem] flex items-center justify-center shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                      <Truck size={32} />
                    </div>
                    <div className="flex-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-1.5 group-hover:bg-white/20 group-hover:text-white transition-colors">
                        <Bookmark size={10} fill="currentColor"/>
                        {s.category || 'General'}
                      </span>
                      <h3 className="font-black text-slate-900 text-xl tracking-tight leading-none truncate max-w-[150px]">{s.name}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openModal(s)} 
                      className="p-4 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-90"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(s.id)} 
                      className="p-4 bg-rose-50 text-rose-300 hover:text-rose-600 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-90"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => openWhatsApp(s.phone)}
                    className="w-full flex items-center gap-5 p-5 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group/btn"
                  >
                    <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-500"><Phone size={18} /></div>
                    <div className="text-left overflow-hidden">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">WhatsApp</p>
                      <p className="text-sm font-black text-slate-700 truncate">{s.phone || 'No registrado'}</p>
                    </div>
                    <MessageCircle size={18} className="ml-auto text-emerald-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>

                  <div className="w-full flex items-center gap-5 p-5 bg-slate-50/50 rounded-[2rem] border border-transparent">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-400"><Mail size={18} /></div>
                    <div className="text-left overflow-hidden">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Correo Electrónico</p>
                      <p className="text-sm font-black text-slate-700 truncate">{s.email || 'Sin correo'}</p>
                    </div>
                    {s.email && <ExternalLink size={16} className="ml-auto text-slate-300" />}
                  </div>
                </div>

                {s.notes && (
                  <div className="mt-8 pt-8 border-t border-slate-50 relative">
                    <div className="absolute top-0 left-8 -translate-y-1/2 bg-white px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">Notas Internas</div>
                    <p className="text-xs text-slate-500 font-bold italic leading-relaxed line-clamp-2">"{s.notes}"</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
           <div className="p-10 bg-indigo-50/50 text-indigo-600 rounded-full mb-6 animate-pulse">
              <Truck size={64} />
           </div>
           <h4 className="font-black text-slate-900 text-xl tracking-tight mb-2">Sin resultados</h4>
           <p className="font-bold text-slate-400 uppercase tracking-widest text-[11px] text-center px-6 max-w-sm">
              No hay proveedores que coincidan con tu búsqueda actual.
           </p>
           <button onClick={() => { setSearchTerm(''); setCategoryFilter('Todas'); }} className="mt-8 text-indigo-600 font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8">
             Ver todo el directorio
           </button>
        </div>
      )}

      {/* Confirmation Delete Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6 z-[120]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[4rem] w-full max-w-sm overflow-hidden shadow-2xl p-12 text-center space-y-10"
            >
              <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                 <AlertCircle size={48} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">¿Eliminar?</h3>
                <p className="text-slate-400 font-bold text-sm leading-relaxed uppercase tracking-widest text-[10px]">
                  Esta acción es definitiva. Se perderá la información de contacto y notas asociadas.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={executeDelete} 
                  className="w-full py-6 bg-rose-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all"
                >
                  Sí, Eliminar
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(null)} 
                  className="w-full py-6 bg-slate-100 text-slate-400 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110] overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Directorio comercial Andy Sublimados</p>
                </div>
                <button onClick={closeModal} className="p-4 bg-white rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-all"><X size={24}/></button>
              </div>
              
              <div className="p-12 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre Comercial</label>
                  <div className="relative">
                    <Truck className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-3xl border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-indigo-50 text-slate-700" placeholder="Ej: Mayorista Textil..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">WhatsApp / Celular</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                      <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-3xl border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-indigo-50 text-slate-700" placeholder="549..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoría / Rubro</label>
                    <div className="relative">
                      <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                      <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-3xl border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-indigo-50 text-slate-700" placeholder="Ej: Insumos, Tazas..." />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email (Opcional)</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-3xl border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-indigo-50 text-slate-700" placeholder="contacto@proveedor.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Notas e Información Adicional</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-8 py-6 bg-slate-50 rounded-[2rem] border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-indigo-50 min-h-[140px] text-slate-700 resize-none" placeholder="Escribe aquí días de entrega, precios especiales, etc..." />
                </div>
              </div>

              <div className="p-12 bg-slate-50/50 border-t border-slate-100">
                <button 
                  onClick={handleSave} 
                  className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-4"
                >
                  <Save size={24}/>
                  {editingId ? 'Guardar Cambios' : 'Confirmar Registro'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuppliersList;
