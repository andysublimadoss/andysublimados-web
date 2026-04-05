import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Plus, Minus, Package } from 'lucide-react';
import { Product, OrderProduct } from '@/types';

interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProducts: OrderProduct[];
  onConfirm: (products: OrderProduct[]) => void;
}

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  isOpen,
  onClose,
  products,
  selectedProducts: initialSelected,
  onConfirm
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<OrderProduct[]>(initialSelected);

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const getQuantity = (productId: string) => {
    return selected.find(p => p.productId === productId)?.quantity || 0;
  };

  const updateQuantity = (product: Product, delta: number) => {
    const currentQty = getQuantity(product.id);
    const newQty = Math.max(0, currentQty + delta);

    if (newQty === 0) {
      setSelected(selected.filter(p => p.productId !== product.id));
    } else {
      const existing = selected.find(p => p.productId === product.id);
      if (existing) {
        setSelected(selected.map(p =>
          p.productId === product.id ? { ...p, quantity: newQty } : p
        ));
      } else {
        setSelected([...selected, {
          productId: product.id,
          name: product.name,
          quantity: newQty
        }]);
      }
    }
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl"
          style={{ borderRadius: '4px' }}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Seleccionar Productos</h3>
              <p className="text-sm text-slate-500 mt-1">Busca y selecciona los productos del inventario</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 transition-colors"
              style={{ borderRadius: '4px' }}
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Search */}
          <div className="px-8 py-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre, código o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 text-sm font-medium outline-none focus:border-indigo-300 focus:bg-white transition-all"
                style={{ borderRadius: '4px' }}
                autoFocus
              />
            </div>
          </div>

          {/* Products List */}
          <div className="flex-1 overflow-y-auto px-8 py-4">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Package size={48} strokeWidth={1.5} />
                <p className="mt-4 text-sm font-medium">No se encontraron productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredProducts.map((product) => {
                  const qty = getQuantity(product.id);
                  return (
                    <div
                      key={product.id}
                      className={`p-4 border transition-all ${
                        qty > 0
                          ? 'border-indigo-200 bg-indigo-50/50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                      style={{ borderRadius: '4px' }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-slate-900">{product.name}</h4>
                            {product.code && (
                              <span className="text-xs font-mono text-slate-500 px-2 py-0.5 bg-slate-100 border border-slate-200" style={{ borderRadius: '2px' }}>
                                {product.code}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            {product.category && (
                              <span className="text-xs text-slate-600">{product.category}</span>
                            )}
                            <span className="text-xs text-slate-500">
                              Stock: <span className="font-bold">{product.stock}</span>
                            </span>
                            <span className="text-xs text-slate-500">
                              ${product.price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(product, -1)}
                            disabled={qty === 0}
                            className="w-8 h-8 flex items-center justify-center border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            style={{ borderRadius: '4px' }}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-12 text-center font-bold text-slate-900">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(product, 1)}
                            disabled={qty >= product.stock}
                            className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            style={{ borderRadius: '4px' }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-600">
                {selected.length} producto{selected.length !== 1 ? 's' : ''} seleccionado{selected.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Total: {selected.reduce((sum, p) => sum + p.quantity, 0)} unidades
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium hover:bg-white transition-colors"
                style={{ borderRadius: '4px' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={selected.length === 0}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ borderRadius: '4px' }}
              >
                Confirmar Selección
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
