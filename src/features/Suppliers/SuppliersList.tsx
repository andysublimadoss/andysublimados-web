
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Truck, Phone, Mail, Tag, X, Trash2, Edit2, MessageCircle, ExternalLink, FilterX, ChevronDown, AlertCircle, Bookmark, ArrowRight, Save } from 'lucide-react';
import { Supplier } from '@/types';
import { suppliersService } from '@/services/supabase';

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

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast?.("El nombre es obligatorio", "error");
      return;
    }

    const finalData = {
      ...formData,
      category: formData.category.trim() || 'General'
    };

    try {
      if (editingId) {
        // Actualizar en Supabase
        const updated = await suppliersService.update(editingId, finalData);
        // Actualizar estado local
        setSuppliers(prev => prev.map(s => s.id === editingId ? updated : s));
        showToast?.("Proveedor actualizado con éxito", "success");
      } else {
        // Crear en Supabase
        const newSupplier = await suppliersService.create(finalData);
        // Actualizar estado local
        setSuppliers(prev => [...prev, newSupplier]);
        showToast?.("Proveedor registrado con éxito", "success");
      }
      closeModal();
    } catch (error) {
      console.error('Error saving supplier:', error);
      showToast?.("Error al guardar el proveedor", "error");
    }
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

  // Autosave deshabilitado - ahora se guarda en Supabase al hacer clic en "Guardar"
  // React.useEffect(() => {
  //   if (isModalOpen && editingId && formData.name.trim()) {
  //     const timer = setTimeout(() => {
  //       setSuppliers(prev => prev.map(s => String(s.id) === String(editingId) ? { ...formData, id: s.id } : s));
  //     }, 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [formData, editingId, isModalOpen, setSuppliers]);

  const executeDelete = async () => {
    if (deleteConfirmId) {
      try {
        // Eliminar en Supabase
        await suppliersService.delete(deleteConfirmId);
        // Actualizar estado local
        setSuppliers(prev => prev.filter(s => s.id !== deleteConfirmId));
        showToast?.("Proveedor eliminado permanentemente", "success");
        setDeleteConfirmId(null);
      } catch (error) {
        console.error('Error deleting supplier:', error);
        showToast?.("Error al eliminar el proveedor", "error");
      }
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

  const openEmail = (email: string) => {
    if (!email) {
      showToast?.("No hay un correo registrado", "error");
      return;
    }
    window.open(`mailto:${email}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Barra de filtros y acciones */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Búsqueda */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center flex-1 min-w-[280px] max-w-[400px]">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar proveedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3.5 rounded-lg outline-none w-full bg-transparent text-sm font-semibold focus:bg-indigo-50/30 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Filtro de categoría */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all relative ${categoryFilter === cat ? 'text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {categoryFilter === cat && <motion.div layoutId="category-filter" className="absolute inset-0 bg-indigo-50 rounded-lg -z-10 border border-indigo-100" />}
              {cat}
            </button>
          ))}
        </div>

        {/* Botón limpiar filtros */}
        {(searchTerm || categoryFilter !== 'Todas') && (
          <button
            onClick={() => { setSearchTerm(''); setCategoryFilter('Todas'); }}
            className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm px-4 py-2.5 text-slate-400 hover:text-slate-600 transition-all flex items-center gap-2"
          >
            <FilterX size={16} />
            <span className="text-xs font-bold uppercase">Limpiar</span>
          </button>
        )}

        {/* Botón Nuevo Proveedor */}
        <button
          onClick={() => openModal()}
          className="relative h-[46px] px-6 overflow-hidden bg-zinc-900 transition-all duration-200 rounded-xl group ml-auto"
        >
          {/* Gradient background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-40 group-hover:opacity-80 blur transition-opacity duration-500" />

          {/* Content */}
          <div className="relative flex items-center justify-center gap-2">
            <Plus className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">Nuevo Proveedor</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/90" />
          </div>
        </button>
      </div>

      {/* Grid of Suppliers */}
      {filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredSuppliers.map((s, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={s.id}
                className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-5 border border-slate-200 shadow-lg hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Header */}
                <div className="relative mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Truck size={22} className="text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Bookmark size={8} className="text-white" fill="white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 text-base tracking-tight leading-tight truncate mb-1">{s.name}</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 rounded-lg text-[9px] font-bold uppercase tracking-wide border border-indigo-200/50">
                          {s.category || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(s)}
                      className="flex-1 p-2.5 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95 border border-slate-200 hover:border-indigo-300 flex items-center justify-center gap-1.5 font-semibold text-[11px]"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(s.id)}
                      className="p-2.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95 border border-slate-200 hover:border-rose-300"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Contact info */}
                <div className="relative space-y-2.5">
                  <button
                    onClick={() => openWhatsApp(s.phone)}
                    className="w-full flex items-center gap-2.5 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all group/btn"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Phone size={16} className="text-emerald-600" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">WhatsApp</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{s.phone || 'No registrado'}</p>
                    </div>
                    <MessageCircle size={14} className="text-emerald-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>

                  <button
                    onClick={() => openEmail(s.email)}
                    className="w-full flex items-center gap-2.5 p-3 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group/btn"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Mail size={16} className="text-indigo-500" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Email</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{s.email || 'Sin correo'}</p>
                    </div>
                    {s.email && <ExternalLink size={12} className="text-indigo-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />}
                  </button>
                </div>

                {/* Notes */}
                {s.notes && (
                  <div className="relative mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-start gap-2">
                      <div className="p-1 bg-amber-100 rounded-lg">
                        <Bookmark size={11} className="text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Notas</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">"{s.notes}"</p>
                      </div>
                    </div>
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
