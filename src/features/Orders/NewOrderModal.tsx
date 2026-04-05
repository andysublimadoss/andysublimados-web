import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, User, Package, FileText, CheckCircle, Mail, Phone, MessageSquare, Calendar, DollarSign } from 'lucide-react';
import { Order, OrderProduct, Product, PaymentMethod, OrderStatus } from '@/types';
import { ProductSelectorModal } from './ProductSelectorModal';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  formData: any;
  setFormData: (data: any) => void;
  selectedProducts: OrderProduct[];
  setSelectedProducts: (products: OrderProduct[]) => void;
  products: Product[];
  updateAmounts: (total: number, deposit: number) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  selectedProducts,
  setSelectedProducts,
  products,
  updateAmounts
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showProductSelector, setShowProductSelector] = useState(false);

  const steps = [
    { number: 1, title: 'Cliente', icon: User },
    { number: 2, title: 'Productos', icon: Package },
    { number: 3, title: 'Detalles', icon: FileText },
    { number: 4, title: 'Finalizar', icon: CheckCircle }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.customerName.trim() && formData.whatsapp.trim();
      case 2:
        return selectedProducts.length > 0;
      case 3:
        return formData.totalAmount > 0 && formData.deliveryDate;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    onSave();
    setCurrentStep(1);
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative bg-white w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl"
            style={{ borderRadius: '4px' }}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Nuevo Trabajo</h2>
                  <p className="text-sm text-slate-500 mt-1">Complete los datos del pedido</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 transition-colors"
                  style={{ borderRadius: '4px' }}
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Steps */}
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 flex items-center justify-center border-2 transition-all ${
                          currentStep >= step.number
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 text-slate-400'
                        }`}
                        style={{ borderRadius: '4px' }}
                      >
                        <step.icon size={20} strokeWidth={2.5} />
                      </div>
                      <span className={`text-xs font-medium mt-2 ${
                        currentStep >= step.number ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-2 ${
                        currentStep > step.number ? 'bg-indigo-600' : 'bg-slate-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Datos del Cliente</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Nombre Completo <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                            style={{ borderRadius: '4px' }}
                            placeholder="Juan Pérez"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            WhatsApp <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="tel"
                              value={formData.whatsapp}
                              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                              className="w-full pl-11 pr-4 py-3 border border-slate-300 text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                              style={{ borderRadius: '4px' }}
                              placeholder="1123456789"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Email
                          </label>
                          <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="email"
                              value={formData.customerEmail}
                              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                              className="w-full pl-11 pr-4 py-3 border border-slate-300 text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                              style={{ borderRadius: '4px' }}
                              placeholder="cliente@email.com"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Medio de Contacto
                          </label>
                          <select
                            value={formData.contactMethod || ''}
                            onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 text-sm font-medium outline-none focus:border-indigo-500 transition-colors bg-white"
                            style={{ borderRadius: '4px' }}
                          >
                            <option value="">Seleccionar...</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Presencial">Presencial</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Notas
                          </label>
                          <textarea
                            value={formData.customerNotes}
                            onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 border border-slate-300 text-sm font-medium outline-none focus:border-indigo-500 transition-colors resize-none"
                            style={{ borderRadius: '4px' }}
                            placeholder="Información adicional del cliente..."
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Selección de Productos</h3>
                        <button
                          onClick={() => setShowProductSelector(true)}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                          style={{ borderRadius: '4px' }}
                        >
                          <Package size={16} />
                          Seleccionar Productos
                        </button>
                      </div>

                      {selectedProducts.length === 0 ? (
                        <div className="border-2 border-dashed border-slate-300 p-12 text-center">
                          <Package size={48} className="mx-auto text-slate-300 mb-4" strokeWidth={1.5} />
                          <p className="text-sm font-medium text-slate-500">
                            No has seleccionado productos
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Click en "Seleccionar Productos" para agregar
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedProducts.map((product) => {
                            const productInfo = products.find(p => p.id === product.productId);
                            return (
                              <div
                                key={product.productId}
                                className="p-4 border border-slate-200 bg-slate-50 flex items-center justify-between"
                                style={{ borderRadius: '4px' }}
                              >
                                <div>
                                  <h4 className="font-bold text-slate-900">{product.name}</h4>
                                  {productInfo && (
                                    <p className="text-xs text-slate-500 mt-1">
                                      ${productInfo.price.toLocaleString()} × {product.quantity} = ${(productInfo.price * product.quantity).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-slate-900">{product.quantity} unidades</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Detalles del Pedido</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Descripción del Trabajo <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 border border-slate-300 text-sm font-medium outline-none focus:border-indigo-500 transition-colors resize-none"
                            style={{ borderRadius: '4px' }}
                            placeholder="Detalles del trabajo..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Fecha de Entrega <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="date"
                              value={formData.deliveryDate}
                              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                              className="w-full pl-11 pr-4 py-3 border border-slate-300 text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                              style={{ borderRadius: '4px' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Precio Total <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="number"
                              value={formData.totalAmount || ''}
                              onChange={(e) => {
                                const total = parseFloat(e.target.value) || 0;
                                updateAmounts(total, formData.depositAmount);
                              }}
                              className="w-full pl-11 pr-4 py-3 border border-slate-300 text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                              style={{ borderRadius: '4px' }}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Seña
                          </label>
                          <div className="relative">
                            <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="number"
                              value={formData.depositAmount || ''}
                              onChange={(e) => {
                                const deposit = parseFloat(e.target.value) || 0;
                                updateAmounts(formData.totalAmount, deposit);
                              }}
                              className="w-full pl-11 pr-4 py-3 border border-slate-300 text-sm font-medium outline-none focus:border-indigo-500 transition-colors"
                              style={{ borderRadius: '4px' }}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Método de Pago (Seña)
                          </label>
                          <select
                            value={formData.depositMethod}
                            onChange={(e) => setFormData({ ...formData, depositMethod: e.target.value as PaymentMethod })}
                            className="w-full px-4 py-3 border border-slate-300 text-sm font-medium outline-none focus:border-indigo-500 transition-colors bg-white"
                            style={{ borderRadius: '4px' }}
                          >
                            <option value={PaymentMethod.EFECTIVO}>Efectivo Físico</option>
                            <option value={PaymentMethod.DIGITAL}>Dinero Digital</option>
                          </select>
                        </div>

                        {formData.remainingAmount > 0 && (
                          <>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">
                                Saldo Pendiente
                              </label>
                              <div className="px-4 py-3 bg-amber-50 border border-amber-200 text-sm font-bold text-amber-900" style={{ borderRadius: '4px' }}>
                                ${formData.remainingAmount.toLocaleString()}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">
                                Método de Pago (Saldo)
                              </label>
                              <select
                                value={formData.remainingMethod}
                                onChange={(e) => setFormData({ ...formData, remainingMethod: e.target.value as PaymentMethod })}
                                className="w-full px-4 py-3 border border-slate-300 text-sm font-medium outline-none focus:border-indigo-500 transition-colors bg-white"
                                style={{ borderRadius: '4px' }}
                              >
                                <option value={PaymentMethod.EFECTIVO}>Efectivo Físico</option>
                                <option value={PaymentMethod.DIGITAL}>Dinero Digital</option>
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <label className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={formData.remainingPaid}
                                  onChange={(e) => setFormData({ ...formData, remainingPaid: e.target.checked })}
                                  className="w-5 h-5"
                                  style={{ borderRadius: '4px' }}
                                />
                                <span className="text-sm font-bold text-slate-700">
                                  Marcar saldo como cobrado
                                </span>
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Estado del Pedido</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {['pedido', 'proceso', 'terminado'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setFormData({ ...formData, status: status as OrderStatus })}
                            className={`p-4 border-2 text-left transition-all ${
                              formData.status === status
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            style={{ borderRadius: '4px' }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                                formData.status === status
                                  ? 'border-indigo-500 bg-indigo-500'
                                  : 'border-slate-300'
                              }`} style={{ borderRadius: '50%' }}>
                                {formData.status === status && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 capitalize">{status}</h4>
                                <p className="text-xs text-slate-500">
                                  {status === 'pedido' && 'Pedido registrado, pendiente de inicio'}
                                  {status === 'proceso' && 'En producción o preparación'}
                                  {status === 'terminado' && 'Trabajo finalizado, listo para entrega'}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="mt-6 p-6 bg-slate-50 border border-slate-200" style={{ borderRadius: '4px' }}>
                        <h4 className="font-bold text-slate-900 mb-3">Resumen del Pedido</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Cliente:</span>
                            <span className="font-medium text-slate-900">{formData.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Productos:</span>
                            <span className="font-medium text-slate-900">{selectedProducts.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total:</span>
                            <span className="font-bold text-slate-900">${formData.totalAmount.toLocaleString()}</span>
                          </div>
                          {formData.depositAmount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Seña:</span>
                              <span className="font-medium text-green-600">${formData.depositAmount.toLocaleString()}</span>
                            </div>
                          )}
                          {formData.remainingAmount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Pendiente:</span>
                              <span className="font-medium text-amber-600">${formData.remainingAmount.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                style={{ borderRadius: '4px' }}
              >
                <ChevronLeft size={16} />
                Atrás
              </button>

              <div className="text-sm font-medium text-slate-600">
                Paso {currentStep} de 4
              </div>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  style={{ borderRadius: '4px' }}
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-8 py-2.5 bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                  style={{ borderRadius: '4px' }}
                >
                  <CheckCircle size={16} />
                  Guardar Pedido
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Product Selector Modal */}
      <ProductSelectorModal
        isOpen={showProductSelector}
        onClose={() => setShowProductSelector(false)}
        products={products}
        selectedProducts={selectedProducts}
        onConfirm={setSelectedProducts}
      />
    </>
  );
};
