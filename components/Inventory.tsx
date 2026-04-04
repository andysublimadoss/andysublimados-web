
import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Save, X, AlertTriangle, Package, Search, Upload, Image as ImageIcon, ArrowRight, Layers, DollarSign, BarChart3, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  initialSearch?: string;
  onSearchChange?: (term: string) => void;
  showToast?: (msg: string, type: 'success' | 'error') => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, initialSearch = '', onSearchChange, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [formData, setFormData] = useState({ code: '', name: '', stock: 0, minStock: 3, price: 0, imageUrl: '', category: '', size: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!formData.name) return;
    
    let finalCode = formData.code;
    if (!finalCode && !editingId) {
      // Generate a simple code if none provided for new product
      const nextNum = products.length + 1;
      finalCode = `INS-${nextNum.toString().padStart(3, '0')}`;
    }

    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...formData, code: finalCode } : p));
      showToast?.("Insumo actualizado", "success");
    } else {
      setProducts(prev => [...prev, { id: Date.now().toString(), ...formData, code: finalCode }]);
      showToast?.("Insumo registrado", "success");
    }
    closeModal();
  };

  // Autosave effect for editing
  React.useEffect(() => {
    if (isModalOpen && editingId && formData.name) {
      const timer = setTimeout(() => {
        setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData, editingId, isModalOpen, setProducts]);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({ 
        code: product.code || '',
        name: product.name, 
        stock: product.stock, 
        minStock: product.minStock || 3,
        price: product.price, 
        imageUrl: product.imageUrl, 
        category: product.category || '',
        size: product.size || ''
      });
    } else {
      setEditingId(null);
      setFormData({ 
        code: '',
        name: '', 
        stock: 0, 
        minStock: 3,
        price: 0, 
        imageUrl: `https://picsum.photos/seed/${Date.now()}/400/400`, 
        category: '',
        size: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const isCritical = p.stock <= (p.minStock || 3);
      
      if (showCriticalOnly) {
        return matchesSearch && isCritical;
      }
      
      return matchesSearch;
    });
  }, [products, searchTerm, showCriticalOnly]);

  const criticalCount = useMemo(() => {
    return products.filter(p => p.stock <= (p.minStock || 3)).length;
  }, [products]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="p-3 md:p-4 bg-indigo-50 text-indigo-600 rounded-2xl md:rounded-3xl shadow-inner">
            <Layers size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Insumos</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mt-1">Gestión de stock e inventario físico</p>
          </div>
        </div>
        
        <button 
          onClick={() => openModal()} 
          className="w-full md:w-auto bg-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-[1.2rem] md:rounded-[2rem] flex items-center justify-center gap-3 md:gap-4 hover:bg-black transition-all shadow-2xl hover:-translate-y-1 active:scale-95 group"
        >
          <Plus size={20} className="md:w-6 md:h-6 group-hover:rotate-90 transition-transform" />
          <span className="font-black uppercase tracking-widest text-[10px] md:text-[11px]">Nuevo Insumo</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, categoría o descripción..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearchChange?.(e.target.value);
            }}
            className="w-full pl-12 md:pl-16 pr-8 py-4 md:py-5 bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] outline-none shadow-xl shadow-slate-200/20 focus:ring-4 focus:ring-indigo-500/5 font-bold text-sm transition-all placeholder:text-slate-300"
          />
          {searchTerm && (
            <button 
              onClick={() => { setSearchTerm(''); onSearchChange?.(''); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="md:col-span-4 flex items-center gap-4">
           <button 
             onClick={() => setShowCriticalOnly(!showCriticalOnly)}
             className={`flex-1 p-4 rounded-[1.5rem] md:rounded-[2rem] border transition-all flex items-center justify-between px-6 md:px-8 shadow-xl shadow-slate-200/20 ${showCriticalOnly ? 'bg-rose-500 border-rose-600 text-white' : 'bg-white border-slate-100 text-slate-900'}`}
           >
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className={showCriticalOnly ? 'text-white' : 'text-rose-500'} />
                <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${showCriticalOnly ? 'text-rose-100' : 'text-slate-400'}`}>Productos Críticos</span>
              </div>
              <span className="text-base md:text-lg font-black">{criticalCount}</span>
           </button>
           <div className="flex-1 bg-white p-4 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center justify-between px-6 md:px-8">
              <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Items</span>
              <span className="text-base md:text-lg font-black text-slate-900">{filteredProducts.length}</span>
           </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={product.id} 
                className="bg-white rounded-[1.5rem] md:rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden hover:shadow-2xl transition-all relative group flex flex-col"
              >
                {product.stock <= (product.minStock || 3) && (
                  <div className="absolute top-3 md:top-6 left-3 md:left-6 z-10 bg-rose-500 text-white p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-lg animate-bounce">
                    <AlertTriangle size={14} className="md:w-5 md:h-5" />
                  </div>
                )}
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 md:gap-4 backdrop-blur-[3px]">
                    {deletingId === product.id ? (
                      <div className="flex items-center gap-2 animate-in zoom-in duration-200">
                        <button 
                          onClick={() => {
                            setProducts(p => p.filter(x => x.id !== product.id));
                            showToast?.("Insumo eliminado", "success");
                            setDeletingId(null);
                          }}
                          className="px-3 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 shadow-lg"
                        >
                          Borrar
                        </button>
                        <button 
                          onClick={() => setDeletingId(null)}
                          className="p-2 bg-white text-slate-400 rounded-xl hover:text-slate-600 shadow-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => openModal(product)} className="p-2.5 md:p-4 bg-white rounded-xl md:rounded-2xl text-slate-900 hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110 shadow-xl"><Edit2 size={18} className="md:w-6 md:h-6" /></button>
                        <button onClick={() => setDeletingId(product.id)} className="p-2.5 md:p-4 bg-white rounded-xl md:rounded-2xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110 shadow-xl"><Trash2 size={18} className="md:w-6 md:h-6" /></button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4 md:p-8 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest">{product.category || 'VARIOS'}</span>
                      {product.size && (
                        <span className="text-[8px] md:text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Talle: {product.size}
                        </span>
                      )}
                    </div>
                    {product.code && (
                      <span className="text-[7px] md:text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 md:px-2 md:py-1 rounded md:rounded-lg uppercase tracking-widest">
                        {product.code}
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-slate-900 truncate text-sm md:text-xl leading-tight mb-2 md:mb-4">{product.name}</h3>
                  <div className="mt-auto pt-4 border-t border-slate-50 flex flex-col gap-3">
                     <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border shadow-sm w-fit ${product.stock <= (product.minStock || 3) ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        <Package size={14} className={product.stock <= (product.minStock || 3) ? 'text-rose-500' : 'text-slate-400'} />
                        <span>Stock: <span className="text-sm md:text-base ml-0.5">{product.stock}</span></span>
                     </div>
                     <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">
                        ${product.price.toLocaleString()}
                     </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
           <div className={`p-10 ${showCriticalOnly ? 'bg-rose-50/50 text-rose-600' : 'bg-indigo-50/50 text-indigo-600'} rounded-full mb-6 animate-pulse`}>
              {showCriticalOnly ? <AlertTriangle size={64} /> : <Package size={64} />}
           </div>
           <h4 className="font-black text-slate-900 text-xl tracking-tight mb-2">
             {showCriticalOnly ? '¡Todo en orden!' : 'Sin coincidencias'}
           </h4>
           <p className="font-bold text-slate-400 uppercase tracking-widest text-[11px] text-center px-6 max-w-sm">
              {showCriticalOnly 
                ? 'No hay productos que necesiten reposición inmediata en este momento.' 
                : 'No encontramos insumos con ese nombre o categoría. Intenta una búsqueda diferente.'}
           </p>
           <button 
             onClick={() => { 
               setSearchTerm(''); 
               onSearchChange?.(''); 
               setShowCriticalOnly(false);
             }} 
             className="mt-8 text-indigo-600 font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-8"
           >
             {showCriticalOnly ? 'Ver todo el inventario' : 'Limpiar filtros'}
           </button>
        </div>
      )}

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[110] overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[4rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{editingId ? 'Editar Insumo' : 'Nuevo Insumo'}</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mt-1">Gestión de Insumos Andy Sublimados</p>
                </div>
                <button onClick={closeModal} className="p-3 md:p-4 bg-white rounded-xl md:rounded-2xl text-slate-400 hover:text-rose-500 shadow-sm transition-all"><X size={20} className="md:w-6 md:h-6"/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-6 md:space-y-10 custom-scrollbar">
                {/* Image Selection Section */}
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Imagen del Producto</label>
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-2 border-slate-100 bg-slate-50 group shrink-0 shadow-inner">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <Upload size={24} />
                      </button>
                    </div>
                    <div className="flex-1 w-full space-y-3 md:space-y-4">
                      <div className="relative">
                        <ImageIcon className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          type="text" 
                          value={formData.imageUrl} 
                          onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                          className="w-full pl-12 md:pl-16 pr-8 py-4 md:py-5 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 font-bold text-xs outline-none focus:ring-4 focus:ring-indigo-50" 
                          placeholder="URL de la imagen..." 
                        />
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 md:gap-3 w-full py-3 md:py-4 border-2 border-dashed border-slate-200 rounded-xl md:rounded-[1.5rem] text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                      >
                        <Upload size={16} />
                        Subir archivo local
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre Comercial</label>
                  <div className="relative">
                    <Package className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-12 md:pl-16 pr-8 py-4 md:py-5 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-indigo-50 text-slate-700 text-sm" placeholder="Ej: Taza Blanca Importada..." />
                  </div>
                </div>

                {(formData.category.toLowerCase().includes('remera') || formData.name.toLowerCase().includes('remera')) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 md:space-y-2 overflow-hidden"
                  >
                    <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Talle (Detectado: Remera)</label>
                    <div className="relative">
                      <Layers className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                      <select 
                        value={formData.size} 
                        onChange={e => setFormData({...formData, size: e.target.value})} 
                        className="w-full pl-12 md:pl-16 pr-8 py-4 md:py-5 bg-white rounded-2xl md:rounded-3xl border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-indigo-50 text-slate-700 text-sm appearance-none cursor-pointer"
                      >
                        <option value="">Seleccionar talle...</option>
                        <optgroup label="Adultos">
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                          <option value="XXXL">XXXL</option>
                        </optgroup>
                        <optgroup label="Niños">
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="4">4</option>
                          <option value="6">6</option>
                          <option value="8">8</option>
                          <option value="10">10</option>
                          <option value="12">12</option>
                          <option value="14">14</option>
                          <option value="16">16</option>
                        </optgroup>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight size={14} className="rotate-90" />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Stock Disponible</label>
                    <div className="relative">
                      <BarChart3 className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                      <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} className="w-full pl-12 md:pl-16 pr-8 py-4 md:py-5 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 font-black outline-none focus:ring-4 focus:ring-indigo-50 text-slate-700 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Stock Mínimo</label>
                    <div className="relative">
                      <AlertTriangle className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-rose-400" size={18} />
                      <input type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} className="w-full pl-12 md:pl-16 pr-8 py-4 md:py-5 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 font-black outline-none focus:ring-4 focus:ring-indigo-50 text-slate-700 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Precio Venta ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                      <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} className="w-full pl-12 md:pl-16 pr-8 py-4 md:py-5 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 font-black outline-none focus:ring-4 focus:ring-indigo-50 text-slate-700 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoría / Rubro</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})} 
                      className="w-full pl-12 md:pl-16 pr-8 py-4 md:py-5 bg-white rounded-2xl md:rounded-3xl border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-indigo-50 text-slate-700 text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Seleccionar categoría...</option>
                      <option value="Tela">Tela</option>
                      <option value="Ceramica">Ceramica</option>
                      <option value="Vidrio">Vidrio</option>
                      <option value="metal">metal</option>
                      <option value="papel">papel</option>
                      <option value="polymer">polymer</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-12 bg-slate-50/50 border-t border-slate-100">
                <button 
                  onClick={handleSave} 
                  className="w-full py-4 md:py-6 bg-slate-900 text-white rounded-2xl md:rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 md:gap-4 text-[10px] md:text-base"
                >
                  <Save size={20} className="md:w-6 md:h-6"/>
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

export default Inventory;
