
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Calendar, Wallet, FileText, LayoutDashboard,
  Users, Menu, X, Download, Upload, Save, CheckCircle2, Sparkles, Bell, Truck, Monitor,
  ChevronRight, BarChart3, Calculator, Banknote, AlertCircle
} from 'lucide-react';
import { TabType, Product, Order, CashMovement, Customer, Supplier, Quote } from './types';
import Inventory from './components/Inventory';
import OrdersAgenda from './components/OrdersAgenda';
import CashFlow from './components/CashFlow';
import Dashboard from './components/Dashboard';
import CustomersList from './components/CustomersList';
import AiAssistant from './components/AiAssistant';
import SuppliersList from './components/SuppliersList';
import QuotesManager from './components/QuotesManager';
import ChartsView from './components/ChartsView';
import PricingCalculator from './components/PricingCalculator';
import CashReconciliation from './components/CashReconciliation';
import DebtorCustomers from './components/DebtorCustomers';

const Logo = ({ className = "h-12" }: { className?: string }) => (
  <div className={`flex items-center space-x-4 ${className}`}>
    <div className="relative h-14 w-14 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100 p-1 group transition-transform hover:rotate-6 overflow-hidden">
      <img 
        src="/logo.png" 
        alt="Logo" 
        className="w-full h-full object-contain"
        onError={(e) => {
          // If .png fails, try .jpg
          if (e.currentTarget.src.endsWith('.png')) {
            e.currentTarget.src = '/logo.jpg';
          } else {
            // Fallback to SVG if both fail
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }
        }}
      />
      <svg viewBox="0 0 100 100" className="w-full h-full hidden">
        <path d="M20 80 L50 20 L80 80" fill="none" stroke="#E6007E" strokeWidth="15" />
        <path d="M10 40 L35 20 L45 50 Z" fill="#FFED00" />
        <path d="M30 75 L50 95 L20 95 Z" fill="#009EE3" />
        <path d="M45 30 L55 30 L50 50 Z" fill="#000000" />
      </svg>
      <div className="absolute -inset-1 bg-indigo-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-xl font-black tracking-tighter text-slate-900">ANDY</span>
      <span className="text-[8px] font-extrabold text-indigo-500 uppercase tracking-[0.4em] -mt-0.5">Sublimados</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(() => (localStorage.getItem('andy_active_tab') as TabType) || 'dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [lastSaved, setLastSaved] = useState<string>('...');
  const [inventorySearch, setInventorySearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initial Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        const data = await res.json();
        if (data) {
          setProducts(data.products || []);
          setOrders(data.orders || []);
          setMovements(data.movements || []);
          setCustomers(data.customers || []);
          setSuppliers(data.suppliers || []);
          setQuotes(data.quotes || []);
        }
        setIsLoading(false);
        setTimeout(() => setIsInitialLoad(false), 500);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };
    fetchData();
  }, []);

  // Save Data
  useEffect(() => {
    if (isInitialLoad) return;

    const saveData = async () => {
      try {
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products, orders, movements, customers, suppliers, quotes })
        });
        setLastSaved(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };

    const timer = setTimeout(saveData, 1000);
    return () => clearTimeout(timer);
  }, [products, orders, movements, customers, suppliers, quotes]);

  // Tab persistence
  useEffect(() => {
    localStorage.setItem('andy_active_tab', activeTab);
  }, [activeTab]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportData = () => {
    const data = { products, orders, movements, customers, suppliers, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `andy-sublimados-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast("Datos exportados correctamente");
  };

  const handleCreateShortcut = () => {
    const url = window.location.origin;
    const shortcutContent = `[InternetShortcut]\nURL=${url}\nIconIndex=0`;
    const blob = new Blob([shortcutContent], { type: 'application/octet-stream' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = "Andy Sublimados.url";
    a.click();
    showToast("¡Listo! Busca el archivo 'Andy Sublimados.url' en tus descargas y muévelo al escritorio.");
  };

  const handleManageStock = (productName?: string) => {
    setInventorySearch(productName || '');
    setActiveTab('productos');
  };

  const criticalStockCount = useMemo(() => 
    products.filter(p => p.stock <= (p.minStock || 0)).length
  , [products]);

  const todayOrdersCount = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    return orders.filter(o => o.deliveryDate === todayStr && o.status !== 'terminado' && !o.isDelivered).length;
  }, [orders]);

  const debtorsCount = useMemo(() => {
    const debtorNames = new Set(
      orders
        .filter(o => o.remainingAmount > 0 && !o.remainingPaid)
        .map(o => o.customerName)
    );
    return debtorNames.size;
  }, [orders]);

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar, badge: todayOrdersCount, badgeColor: 'bg-rose-500' },
    { id: 'calculadora', label: 'Calculadora de Costos', icon: Calculator },
    { id: 'productos', label: 'Insumos', icon: Package, badge: criticalStockCount, badgeColor: 'bg-amber-500' },
    { id: 'presupuesto', label: 'Presupuesto', icon: FileText },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
    { id: 'caja', label: 'Caja', icon: Wallet },
    { id: 'graficos', label: 'Gráficos', icon: BarChart3 },
    { id: 'arqueo', label: 'Arqueo de Caja', icon: Banknote },
    { id: 'deudores', label: 'Clientes Deudores', icon: AlertCircle, badge: debtorsCount, badgeColor: 'bg-rose-600' },
    { id: 'asistente', label: 'Gemini IA', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 ${toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-700' : 'bg-white border-rose-100 text-rose-700'}`}
          >
            <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={20}/> : <X size={20}/>}
            </div>
            <span className="font-bold text-sm tracking-tight">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className="md:hidden bg-white/90 backdrop-blur-xl border-b border-slate-200 p-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-white rounded-xl shadow-md flex items-center justify-center border border-slate-100 p-1 overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                if (e.currentTarget.src.endsWith('.png')) {
                  e.currentTarget.src = '/logo.jpg';
                } else {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }
              }}
            />
            <svg viewBox="0 0 100 100" className="w-full h-full hidden">
              <path d="M20 80 L50 20 L80 80" fill="none" stroke="#E6007E" strokeWidth="15" />
              <path d="M10 40 L35 20 L45 50 Z" fill="#FFED00" />
              <path d="M30 75 L50 95 L20 95 Z" fill="#009EE3" />
              <path d="M45 30 L55 30 L50 50 Z" fill="#000000" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-black tracking-tighter text-slate-900">ANDY</span>
            <span className="text-[6px] font-extrabold text-indigo-500 uppercase tracking-[0.3em] -mt-0.5">Sublimados</span>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-100 rounded-xl text-slate-600 active:scale-90 transition-transform">
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed md:relative z-[60] w-72 h-screen bg-white border-r border-slate-200 
        transition-transform duration-500 ease-in-out flex flex-col shrink-0 shadow-2xl md:shadow-none
      `}>
        <div className="p-8 md:p-10"><Logo /></div>
        <nav className="flex-1 px-4 md:px-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-5 md:px-6 py-3.5 md:py-4 rounded-2xl font-bold transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-black text-white border-2 border-white shadow-sm ${item.badgeColor || 'bg-rose-500'}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[12px] md:text-[13px] uppercase tracking-[0.1em]">{item.label}</span>
              </div>
              {activeTab === item.id && (
                <motion.div layoutId="active-indicator">
                  <ChevronRight size={14} className="opacity-50" />
                </motion.div>
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-6 md:p-8 border-t border-slate-50 space-y-4 bg-slate-50/30">
           <div className="flex items-center justify-between px-3 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Sincronizado</span>
                <span className="text-[9px] font-bold text-slate-500">{lastSaved}</span>
              </div>
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-50" />
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-2">
             <button onClick={handleExportData} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all group shadow-sm">
                <Download size={18} className="mb-1.5 group-hover:translate-y-0.5 transition-transform" />
                <span className="text-[7px] font-black uppercase tracking-widest">Backup</span>
             </button>
             <button onClick={handleCreateShortcut} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all group shadow-sm">
                <Monitor size={18} className="mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[7px] font-black uppercase tracking-widest">Acceso</span>
             </button>
           </div>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden bg-[#F8FAFC] relative">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-[1800px] mx-auto p-3 md:p-10 pb-24 md:pb-10"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-indigo-600 animate-pulse" size={20} />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Cargando tus datos...</h2>
                  <p className="text-slate-500 text-sm font-medium">Sincronizando con la nube de Andy Pro</p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && <Dashboard orders={orders} movements={movements} products={products} suppliers={suppliers} onManageStock={handleManageStock} onNavigate={setActiveTab} />}
                {activeTab === 'productos' && <Inventory products={products} setProducts={setProducts} initialSearch={inventorySearch} onSearchChange={setInventorySearch} showToast={showToast} />}
                {activeTab === 'agenda' && <OrdersAgenda orders={orders} setOrders={setOrders} setMovements={setMovements} customers={customers} setCustomers={setCustomers} products={products} setProducts={setProducts} showToast={showToast} />}
                {activeTab === 'clientes' && <CustomersList customers={customers} setCustomers={setCustomers} orders={orders} showToast={showToast} onNavigate={setActiveTab} />}
                {activeTab === 'proveedores' && <SuppliersList suppliers={suppliers} setSuppliers={setSuppliers} showToast={showToast} />}
                {activeTab === 'caja' && <CashFlow movements={movements} setMovements={setMovements} showToast={showToast} />}
                { activeTab === 'graficos' && <ChartsView movements={movements} orders={orders} products={products} /> }
                { activeTab === 'calculadora' && <PricingCalculator products={products} /> }
                { activeTab === 'arqueo' && <CashReconciliation /> }
                { activeTab === 'deudores' && <DebtorCustomers orders={orders} onNavigate={setActiveTab} /> }
                { activeTab === 'presupuesto' && <QuotesManager quotes={quotes} setQuotes={setQuotes} customers={customers} showToast={showToast} /> }
                {activeTab === 'asistente' && <AiAssistant products={products} orders={orders} />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-4 py-3 flex justify-around items-center z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        {navItems.filter(item => ['dashboard', 'agenda', 'calculadora'].includes(item.id)).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
          >
            <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label === 'Inicio' ? 'Home' : item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
