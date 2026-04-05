import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Minus } from 'lucide-react';
import { Product, Order, CashMovement, Customer, Supplier, Quote } from '@/types';
import { useToast } from '@/hooks';
import { Toast } from '@/components/ui';
import { Header } from '@/components/layout';
import { fetchData } from '@/services';
import { authService } from '@/services/auth';
import { createNavItems } from '@/utils';
import { AiAssistant, Login } from '@/features';
import {
  DashboardPage,
  OrdersPage,
  InventoryPage,
  CustomersPage,
  CashFlowPage,
  SuppliersPage,
  ChartsPage,
  CalculatorPage,
  DebtorsPage,
  QuotesPage
} from '@/pages';

const AppContent: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { toast, showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setIsAuthenticated(!!user);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
      setCurrentUser(user);

      // Reload data when user logs in
      if (user && !isAuthenticated) {
        loadData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initial Load
  const loadData = async () => {
    if (!isAuthenticated) return;

    try {
      const data = await fetchData();
      setProducts(data.products);
      setOrders(data.orders);
      setMovements(data.movements);
      setCustomers(data.customers);
      setSuppliers(data.suppliers);
      setQuotes(data.quotes);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      loadData();
    }
  }, [isAuthenticated, isCheckingAuth]);

  const handleManageStock = (productName?: string) => {
    setInventorySearch(productName || '');
    navigate('/inventory');
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setIsAuthenticated(false);
      setCurrentUser(null);
      // Clear all data
      setProducts([]);
      setOrders([]);
      setMovements([]);
      setCustomers([]);
      setSuppliers([]);
      setQuotes([]);
      showToast('Sesión cerrada correctamente');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      showToast('Error al cerrar sesión', 'error');
    }
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

  const navItems = createNavItems(todayOrdersCount, criticalStockCount, debtorsCount);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="inline-block bg-white/20 p-6 rounded-2xl mb-4 animate-pulse">
            <svg className="w-16 h-16" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z" opacity="0.3" />
              <circle cx="50" cy="50" r="20" />
            </svg>
          </div>
          <p className="text-xl font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Toast toast={toast} />
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Toast toast={toast} />

      {/* Header con navegación */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        navItems={navItems}
      />

      <main className="flex-1 overflow-x-hidden bg-[#F8FAFC] relative pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-[1800px] mx-auto px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-10"
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
              <Routes>
                <Route path="/" element={<DashboardPage orders={orders} movements={movements} products={products} suppliers={suppliers} onManageStock={handleManageStock} />} />
                <Route path="/orders" element={<OrdersPage orders={orders} setOrders={setOrders} setMovements={setMovements} customers={customers} setCustomers={setCustomers} products={products} setProducts={setProducts} showToast={showToast} />} />
                <Route path="/inventory" element={<InventoryPage products={products} setProducts={setProducts} showToast={showToast} initialSearch={inventorySearch} />} />
                <Route path="/customers" element={<CustomersPage customers={customers} setCustomers={setCustomers} orders={orders} showToast={showToast} />} />
                <Route path="/cash-flow" element={<CashFlowPage movements={movements} setMovements={setMovements} showToast={showToast} />} />
                <Route path="/suppliers" element={<SuppliersPage suppliers={suppliers} setSuppliers={setSuppliers} showToast={showToast} />} />
                <Route path="/charts" element={<ChartsPage movements={movements} orders={orders} products={products} />} />
                <Route path="/calculator" element={<CalculatorPage products={products} />} />
                <Route path="/debtors" element={<DebtorsPage orders={orders} />} />
                <Route path="/quotes" element={<QuotesPage quotes={quotes} setQuotes={setQuotes} customers={customers} showToast={showToast} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-4 py-3 flex justify-around items-center z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
        {[
          { id: 'dashboard', path: '/', icon: navItems.find(i => i.id === 'dashboard')?.icon, label: 'Home' },
          { id: 'agenda', path: '/orders', icon: navItems.find(i => i.id === 'agenda')?.icon, label: 'Pedidos' },
          { id: 'calculadora', path: '/calculator', icon: navItems.find(i => i.id === 'calculadora')?.icon, label: 'Calc' }
        ].map((item) => (
          item.icon && (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-all ${location.pathname === item.path ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
            >
              <item.icon size={20} strokeWidth={location.pathname === item.path ? 2.5 : 2} />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          )
        ))}
      </div>

      {/* Floating AI Chat Button */}
      <motion.button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-2xl shadow-purple-500/50 flex items-center justify-center z-50 hover:scale-110 transition-transform group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isChatOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="sparkles"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Sparkles size={24} strokeWidth={2.5} />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0, x: 400, y: 400 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{
                opacity: 0,
                scale: 0.1,
                x: 400,
                y: 400,
                transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }
              }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-[calc(100vw-3rem)] md:w-[500px] h-[calc(100vh-8rem)] md:h-[650px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-200"
            >
              {/* Chat Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Gemini IA</h3>
                    <p className="text-xs text-slate-500 font-medium">Asistente Virtual</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors group"
                  title="Minimizar"
                >
                  <Minus size={18} className="text-slate-600 group-hover:text-slate-900" />
                </button>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-hidden">
                <AiAssistant products={products} orders={orders} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
