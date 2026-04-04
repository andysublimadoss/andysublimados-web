import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Printer, Save, X, FileText, User, Calendar as CalendarIcon, Edit2, Search, Phone, ArrowRight, MessageSquare } from 'lucide-react';
import { Quote, QuoteItem } from '../types';

interface QuotesManagerProps {
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  customers: any[];
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const QuotesManager: React.FC<QuotesManagerProps> = ({ quotes, setQuotes, customers, showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      quantity: 1,
      description: '',
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const q = parseFloat(String(updatedItem.quantity)) || 0;
          const p = parseFloat(String(updatedItem.unitPrice)) || 0;
          updatedItem.quantity = q;
          updatedItem.unitPrice = p;
          updatedItem.total = q * p;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  // Autosave effect for editing
  React.useEffect(() => {
    if (isModalOpen && editingId && customerName.trim() && items.length > 0) {
      const timer = setTimeout(() => {
        setQuotes(prev => prev.map(q => q.id === editingId ? {
          ...q,
          customerName,
          customerPhone,
          items,
          totalAmount,
          notes
        } : q));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [customerName, customerPhone, items, totalAmount, notes, editingId, isModalOpen, setQuotes]);

  const handleSave = () => {
    const trimmedName = customerName?.trim();
    if (!trimmedName) {
      showToast("El nombre del cliente es obligatorio", "error");
      return;
    }
    if (!items || items.length === 0) {
      showToast("Debe agregar al menos un ítem", "error");
      return;
    }

    const quoteData = {
      customerName: trimmedName,
      customerPhone,
      items,
      totalAmount: totalAmount || 0,
      notes
    };

    if (editingId) {
      setQuotes(prev => prev.map(q => q.id === editingId ? {
        ...q,
        ...quoteData
      } : q));
      showToast("Presupuesto actualizado");
    } else {
      const newQuote: Quote = {
        id: Date.now().toString(),
        ...quoteData,
        date: new Date().toISOString()
      };
      setQuotes(prev => [newQuote, ...prev]);
      showToast("Presupuesto guardado");
    }
    closeModal();
  };

  const openEditModal = (quote: Quote) => {
    setEditingId(quote.id);
    setCustomerName(quote.customerName);
    setCustomerPhone(quote.customerPhone || '');
    setItems(quote.items);
    setNotes(quote.notes || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setCustomerName('');
    setCustomerPhone('');
    setShowSuggestions(false);
    setItems([]);
    setNotes('');
  };

  const handlePrint = (quote?: Quote) => {
    const printContent = quote || { 
      customerName, 
      customerPhone, 
      items, 
      totalAmount: totalAmount || 0, 
      notes, 
      date: editingId ? (quotes.find(q => q.id === editingId)?.date || new Date().toISOString()) : new Date().toISOString() 
    };
    
    if (!printContent.customerName) {
      showToast("Complete el nombre del cliente para imprimir", "error");
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      showToast("El bloqueador de ventanas impidió abrir la impresión. Por favor, permítelas.", "error");
      return;
    }

    const html = `
      <html>
        <head>
          <title>Presupuesto - ${printContent.customerName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 40px; }
            .logo-section { display: flex; align-items: center; gap: 20px; }
            .logo-box { width: 80px; height: 80px; background: #fff; border: 2px solid #f1f5f9; border-radius: 24px; display: flex; align-items: center; justify-content: center; padding: 4px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); overflow: hidden; position: relative; }
            .logo-img { width: 100%; height: 100%; object-fit: contain; }
            .brand-name { font-size: 32px; font-weight: 900; letter-spacing: -2px; color: #0f172a; }
            .brand-sub { font-size: 12px; font-weight: 800; color: #6366f1; text-transform: uppercase; letter-spacing: 5px; margin-top: -5px; }
            .info-section { text-align: right; font-size: 13px; color: #64748b; font-weight: 600; }
            .info-item { margin-bottom: 4px; }
            .title-area { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
            .title { font-size: 48px; font-weight: 900; color: #0f172a; letter-spacing: -2px; text-transform: uppercase; }
            .quote-meta { text-align: right; }
            .meta-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; }
            .meta-value { font-size: 16px; font-weight: 700; color: #1e293b; }
            .customer-card { background: #f8fafc; padding: 30px; border-radius: 24px; margin-bottom: 40px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
            .customer-label { font-size: 10px; font-weight: 800; color: #6366f1; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
            .customer-name { font-size: 24px; font-weight: 900; color: #0f172a; }
            .customer-phone { font-size: 14px; font-weight: 700; color: #64748b; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 40px; }
            th { text-align: left; padding: 16px; background: #f8fafc; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 15px; font-weight: 500; }
            .col-cant { width: 80px; text-align: center; }
            .col-price { width: 150px; text-align: right; }
            .col-total { width: 150px; text-align: right; font-weight: 700; }
            .total-section { display: flex; justify-content: flex-end; margin-top: 20px; }
            .total-box { background: #0f172a; color: #fff; padding: 30px 50px; border-radius: 24px; text-align: right; }
            .total-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; opacity: 0.7; margin-bottom: 8px; }
            .total-amount { font-size: 36px; font-weight: 900; letter-spacing: -1px; }
            .notes-area { margin-top: 60px; padding: 30px; border-left: 4px solid #6366f1; background: #f5f7ff; border-radius: 0 24px 24px 0; }
            .notes-title { font-size: 12px; font-weight: 800; color: #6366f1; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
            .notes-content { font-size: 14px; color: #475569; font-style: italic; }
            .footer { margin-top: 80px; text-align: center; font-size: 12px; color: #94a3b8; font-weight: 600; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              <div class="logo-box">
                <img src="/logo.png" class="logo-img" onerror="if(this.src.endsWith('.png')){this.src='/logo.jpg'}else{this.style.display='none'; this.nextElementSibling.style.display='block';}">
                <svg viewBox="0 0 100 100" class="logo-img" style="display: none;">
                  <path d="M20 80 L50 20 L80 80" fill="none" stroke="#E6007E" stroke-width="15" />
                  <path d="M10 40 L35 20 L45 50 Z" fill="#FFED00" />
                  <path d="M30 75 L50 95 L20 95 Z" fill="#009EE3" />
                  <path d="M45 30 L55 30 L50 50 Z" fill="#000000" />
                </svg>
              </div>
              <div>
                <div class="brand-name">ANDY</div>
                <div class="brand-sub">Sublimados</div>
              </div>
            </div>
            <div class="info-section">
              <div class="info-item">Bolivar 1726 – Tres Arroyos</div>
              <div class="info-item">Tel: 2983-347954</div>
              <div class="info-item">Instagram: @andysublimados</div>
            </div>
          </div>
          
          <div class="title-area">
            <div class="title">Presupuesto</div>
            <div class="quote-meta">
              <div class="meta-label">Fecha de Emisión</div>
              <div class="meta-value">${new Date(printContent.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
          
          <div class="customer-card">
            <div>
              <div class="customer-label">Presupuestado para</div>
              <div class="customer-name">${printContent.customerName}</div>
            </div>
            ${printContent.customerPhone ? `
              <div style="text-align: right;">
                <div class="customer-label">Teléfono</div>
                <div class="customer-phone">${printContent.customerPhone}</div>
              </div>
            ` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th class="col-cant">Cant.</th>
                <th>Descripción</th>
                <th class="col-price">P. Unitario</th>
                <th class="col-total">Total</th>
              </tr>
            </thead>
            <tbody>
              ${printContent.items.map((item: any) => `
                <tr>
                  <td class="col-cant">${item.quantity}</td>
                  <td>${item.description}</td>
                  <td class="col-price">$${Number(item.unitPrice).toLocaleString()}</td>
                  <td class="col-total">$${Number(item.total).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-box">
              <div class="total-label">Total a Pagar</div>
              <div class="total-amount">$${Number(printContent.totalAmount).toLocaleString()}</div>
            </div>
          </div>
          
          ${printContent.notes ? `
            <div class="notes-area">
              <div class="notes-title">Observaciones</div>
              <div class="notes-content">${printContent.notes}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            Gracias por confiar en Andy Sublimados. Este presupuesto tiene una validez de 15 días.
          </div>
          
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                // Close after a delay to ensure print dialog opened
                setTimeout(() => {
                  if (window.confirm('¿Cerrar ventana de impresión?')) {
                    window.close();
                  }
                }, 1000);
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  };

  const handleWhatsAppShare = (quote?: Quote) => {
    const data = quote || { customerName, customerPhone, items, totalAmount, notes };
    
    if (!data.customerName) {
      showToast("Complete el nombre del cliente para compartir", "error");
      return;
    }

    if (data.items.length === 0) {
      showToast("Agregue al menos un ítem para compartir", "error");
      return;
    }

    const dateStr = new Date().toLocaleDateString('es-AR');
    let message = `*PRESUPUESTO - ANDY SUBLIMADOS*\n`;
    message += `--------------------------------\n`;
    message += `*Cliente:* ${data.customerName}\n`;
    message += `*Fecha:* ${dateStr}\n\n`;
    
    message += `*DETALLE:*\n`;
    data.items.forEach((item: QuoteItem) => {
      message += `• ${item.quantity}x ${item.description} ($${item.unitPrice.toLocaleString()}) -> *$${item.total.toLocaleString()}*\n`;
    });
    
    message += `\n*TOTAL: $${data.totalAmount.toLocaleString()}*\n`;
    
    if (data.notes) {
      message += `\n*Notas:* ${data.notes}\n`;
    }
    
    message += `--------------------------------\n`;
    message += `_Gracias por confiar en Andy Sublimados._`;

    const encodedMessage = encodeURIComponent(message);
    const phone = data.customerPhone ? data.customerPhone.replace(/\D/g, '') : '';
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const filteredQuotes = quotes.filter(quote => {
    const searchLower = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const name = (quote.customerName || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const phone = (quote.customerPhone || "").toLowerCase();
    const dateStr = new Date(quote.date).toLocaleDateString();
    return name.includes(searchLower) || phone.includes(searchTerm) || dateStr.includes(searchTerm);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Presupuestos</h2>
          <p className="text-slate-500 font-medium">Genera cotizaciones profesionales para tus clientes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          Nuevo Presupuesto
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text"
            placeholder="Buscar por cliente o fecha (DD/MM/AAAA)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuotes.map(quote => (
          <motion.div 
            key={quote.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:shadow-2xl transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                <FileText size={24} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleWhatsAppShare(quote)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                  title="Compartir por WhatsApp"
                >
                  <MessageSquare size={18} />
                </button>
                <button 
                  onClick={() => handlePrint(quote)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                  title="Imprimir"
                >
                  <Printer size={18} />
                </button>
                <button 
                  onClick={() => openEditModal(quote)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => setDeletingId(quote.id)}
                  className={`p-3 rounded-xl transition-all ${deletingId === quote.id ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-300 hover:bg-rose-500 hover:text-white'}`}
                  title="Eliminar"
                >
                  {deletingId === quote.id ? <X size={18} /> : <Trash2 size={18} />}
                </button>
                {deletingId === quote.id && (
                  <button 
                    onClick={() => {
                      setQuotes(quotes.filter(q => q.id !== quote.id));
                      setDeletingId(null);
                      showToast("Presupuesto eliminado");
                    }}
                    className="p-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all animate-pulse flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    <span className="text-[10px] font-black uppercase">Borrar</span>
                  </button>
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{quote.customerName}</h3>
            {quote.customerPhone && (
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                <Phone size={12} />
                {quote.customerPhone}
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">
              <CalendarIcon size={12} />
              {new Date(quote.date).toLocaleDateString()}
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                <span className="text-lg font-black text-indigo-600">${quote.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {quotes.length === 0 && (
        <div className="bg-white rounded-[3rem] p-20 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
            <FileText size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No hay presupuestos</h3>
          <p className="text-slate-400 font-medium max-w-xs">Comienza creando un nuevo presupuesto para tus clientes.</p>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white rounded-[4rem] w-full max-w-5xl my-8 overflow-hidden shadow-2xl flex flex-col min-h-[80vh]"
            >
              <div className="p-10 md:p-16 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">{editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Detalle de servicios y productos</p>
                  </div>
                  <button onClick={closeModal} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-3 relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Cliente</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={e => {
                          setCustomerName(e.target.value);
                          setShowSuggestions(e.target.value.length > 0);
                        }}
                        onFocus={() => customerName.length > 0 && setShowSuggestions(true)}
                        placeholder="Nombre del cliente"
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-3xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all"
                      />
                    </div>
                    
                    <AnimatePresence>
                      {showSuggestions && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          {customers
                            .filter(c => {
                              const name = (c.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                              const whatsapp = (c.whatsapp || "").toLowerCase();
                              const number = (c.customerNumber || "").toString();
                              const search = customerName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                              return name.includes(search) || whatsapp.includes(search) || number.includes(search);
                            })
                            .map(c => (
                              <button
                                key={c.id}
                                onClick={() => {
                                  setCustomerName(c.name);
                                  setCustomerPhone(c.whatsapp);
                                  setShowSuggestions(false);
                                }}
                                className="w-full text-left px-6 py-4 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-none group"
                              >
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name}</span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">#{c.customerNumber || 'S/N'} • {c.whatsapp}</span>
                                </div>
                                <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-all" />
                              </button>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="Teléfono del cliente"
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-3xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Fecha</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        value={editingId ? new Date(quotes.find(q => q.id === editingId)?.date || '').toLocaleDateString() : new Date().toLocaleDateString()}
                        disabled
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-3xl outline-none font-bold text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[3rem] p-8 mb-12">
                  <div className="flex items-center justify-between mb-8 px-4">
                    <h4 className="text-lg font-black text-slate-900 tracking-tight">Ítems del Presupuesto</h4>
                    <button 
                      onClick={addItem}
                      className="flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all"
                    >
                      <Plus size={16} />
                      Agregar Ítem
                    </button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="col-span-2">
                          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 block ml-2">Cant.</label>
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none font-bold text-center"
                          />
                        </div>
                        <div className="col-span-5">
                          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 block ml-2">Descripción</label>
                          <input 
                            type="text" 
                            value={item.description}
                            onChange={e => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Producto o servicio"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none font-bold"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 block ml-2">P. Unit</label>
                          <input 
                            type="number" 
                            value={item.unitPrice}
                            onChange={e => updateItem(item.id, 'unitPrice', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none font-bold"
                          />
                        </div>
                        <div className="col-span-2 text-right px-4">
                          <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 block text-right">Total</label>
                          <span className="font-black text-slate-900 block py-3">${item.total.toLocaleString()}</span>
                        </div>
                        <div className="col-span-1 flex justify-center pt-5">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-rose-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-10 text-slate-400 font-medium italic">No hay ítems agregados</div>
                    )}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-200 flex justify-end px-8">
                    <div className="flex items-center gap-8">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Presupuesto</span>
                      <span className="text-3xl font-black text-indigo-600 tracking-tighter">${totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Notas Adicionales</label>
                  <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Ej: Validez del presupuesto, tiempo de entrega, etc."
                    className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] outline-none font-bold text-slate-700 focus:ring-4 focus:ring-indigo-50 transition-all min-h-[120px]"
                  />
                </div>
              </div>

              <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-end relative z-[110]">
                <button 
                  type="button"
                  onClick={() => handleWhatsAppShare()}
                  className="flex items-center justify-center gap-3 px-10 py-5 bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-emerald-600 shadow-xl shadow-emerald-200 transition-all active:scale-95"
                >
                  <MessageSquare size={20} />
                  Enviar por WhatsApp
                </button>
                <button 
                  type="button"
                  onClick={() => handlePrint()}
                  className="flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-600 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                >
                  <Printer size={20} />
                  Vista Previa / Imprimir
                </button>
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex items-center justify-center gap-3 px-10 py-5 bg-rose-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all active:scale-95"
                >
                  <X size={20} />
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={handleSave}
                  className="flex items-center justify-center gap-3 px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95"
                >
                  <Save size={20} />
                  {editingId ? 'Actualizar Presupuesto' : 'Guardar Presupuesto'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuotesManager;
