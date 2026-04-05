
import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, ShoppingBag, 
  CreditCard, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight, Calendar, Star
} from 'lucide-react';
import { CashMovement, Order, Product, MovementType, PaymentMethod } from '@/types';

interface ChartsViewProps {
  movements: CashMovement[];
  orders: Order[];
  products: Product[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const ChartsView: React.FC<ChartsViewProps> = ({ movements, orders, products }) => {
  const [timeRange, setTimeRange] = useState<'30' | '90' | 'all'>('30');

  // Helper to filter by time range
  const filteredMovements = useMemo(() => {
    if (timeRange === 'all') return movements;
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() - parseInt(timeRange));
    return movements.filter(m => new Date(m.date) >= limit);
  }, [movements, timeRange]);

  const filteredOrders = useMemo(() => {
    if (timeRange === 'all') return orders;
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() - parseInt(timeRange));
    return orders.filter(o => new Date(o.createdAt) >= limit);
  }, [orders, timeRange]);

  // 0. Summary Stats
  const summaryStats = useMemo(() => {
    const now = new Date();
    const limit = new Date();
    const prevLimit = new Date();
    const days = timeRange === 'all' ? 365 : parseInt(timeRange);
    
    limit.setDate(now.getDate() - days);
    prevLimit.setDate(now.getDate() - (days * 2));

    const currentMovements = movements.filter(m => new Date(m.date) >= limit);
    const prevMovements = movements.filter(m => {
      const d = new Date(m.date);
      return d >= prevLimit && d < limit;
    });

    const currentOrders = orders.filter(o => new Date(o.createdAt) >= limit);
    const prevOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= prevLimit && d < limit;
    });

    const calculateIncome = (movs: CashMovement[]) => movs.filter(m => m.type === MovementType.INGRESO).reduce((s, m) => s + m.amount, 0);
    const calculateExpenses = (movs: CashMovement[]) => movs.filter(m => m.type === MovementType.EGRESO).reduce((s, m) => s + m.amount, 0);

    const curIncome = calculateIncome(currentMovements);
    const prevIncome = calculateIncome(prevMovements);
    const curExpenses = calculateExpenses(currentMovements);
    const prevExpenses = calculateExpenses(prevMovements);
    const curProfit = curIncome - curExpenses;
    const prevProfit = prevIncome - prevExpenses;
    const curAvg = currentOrders.length > 0 ? curIncome / currentOrders.length : 0;
    const prevAvg = prevOrders.length > 0 ? prevIncome / prevOrders.length : 0;

    const getGrowth = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return ((cur - prev) / prev) * 100;
    };

    return {
      totalIncome: curIncome,
      incomeGrowth: getGrowth(curIncome, prevIncome),
      totalExpenses: curExpenses,
      expensesGrowth: getGrowth(curExpenses, prevExpenses),
      netProfit: curProfit,
      profitGrowth: getGrowth(curProfit, prevProfit),
      avgOrderValue: curAvg,
      avgGrowth: getGrowth(curAvg, prevAvg),
      orderCount: currentOrders.length
    };
  }, [movements, orders, timeRange]);

  // 1. Income vs Expenses Data
  const incomeVsExpensesData = useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleDateString('es-AR', { month: 'short' });
      const monthYear = d.getFullYear();
      last6Months.push({
        name: monthName,
        month: d.getMonth(),
        year: monthYear,
        ingresos: 0,
        egresos: 0
      });
    }

    movements.forEach(m => {
      const mDate = new Date(m.date);
      const month = mDate.getMonth();
      const year = mDate.getFullYear();
      
      const monthData = last6Months.find(d => d.month === month && d.year === year);
      if (monthData) {
        if (m.type === MovementType.INGRESO) {
          monthData.ingresos += m.amount;
        } else {
          monthData.egresos += m.amount;
        }
      }
    });

    return last6Months;
  }, [movements]);

  // 2. Top Sales by Category
  const categorySalesData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    filteredOrders.forEach(order => {
      if (order.linkedProducts) {
        order.linkedProducts.forEach(op => {
          const product = products.find(p => p.id === op.productId);
          const category = product?.category || 'Sin Categoría';
          categoryTotals[category] = (categoryTotals[category] || 0) + op.quantity;
        });
      }
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [filteredOrders, products]);

  // 3. Payment Methods Distribution
  const paymentMethodsData = useMemo(() => {
    const methodTotals: Record<string, number> = {};
    
    filteredMovements.filter(m => m.type === MovementType.INGRESO).forEach(m => {
      const method = m.method || 'Otro';
      methodTotals[method] = (methodTotals[method] || 0) + m.amount;
    });

    const total = Object.values(methodTotals).reduce((a, b) => a + b, 0);

    return Object.entries(methodTotals)
      .map(([name, value]) => ({ 
        name, 
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredMovements]);

  // 4. Monthly Net Balance Data
  const netBalanceData = useMemo(() => {
    return incomeVsExpensesData.map(d => ({
      name: d.name,
      balance: d.ingresos - d.egresos
    }));
  }, [incomeVsExpensesData]);

  // 5. Expenses by Category
  const expensesByCategoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    filteredMovements.filter(m => m.type === MovementType.EGRESO).forEach(m => {
      const category = m.category || 'Otros';
      categoryTotals[category] = (categoryTotals[category] || 0) + m.amount;
    });

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ 
        name, 
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredMovements]);

  // 6. Daily Income Data (Last 30 days)
  const dailyIncomeData = useMemo(() => {
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => {
      const dayMovements = filteredMovements.filter(m => m.date.startsWith(date));
      const income = dayMovements.filter(m => m.type === MovementType.INGRESO).reduce((s, m) => s + m.amount, 0);
      return { 
        date: date.split('-')[2], // Just the day
        fullDate: date,
        ingresos: income 
      };
    });
  }, [filteredMovements]);

  // 7. Top Customers by Revenue
  const topCustomersData = useMemo(() => {
    const customerTotals: Record<string, number> = {};
    filteredOrders.forEach(o => {
      customerTotals[o.customerName] = (customerTotals[o.customerName] || 0) + o.totalAmount;
    });

    return Object.entries(customerTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredOrders]);

  // 8. Top Products by Revenue
  const topProductsRevenueData = useMemo(() => {
    const productTotals: Record<string, number> = {};
    filteredOrders.forEach(o => {
      if (o.linkedProducts) {
        o.linkedProducts.forEach(lp => {
          const product = products.find(p => p.id === lp.productId);
          const price = product?.price || 0;
          productTotals[lp.name] = (productTotals[lp.name] || 0) + (lp.quantity * price);
        });
      }
    });

    return Object.entries(productTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredOrders, products]);

  // 9. Top Products by Quantity (Best Sellers)
  const topProductsQuantityData = useMemo(() => {
    const soldStats: Record<string, number> = {};
    filteredOrders.forEach(o => {
      o.linkedProducts?.forEach(lp => {
        soldStats[lp.name] = (soldStats[lp.name] || 0) + lp.quantity;
      });
    });
    return Object.keys(soldStats)
      .map(name => ({ name, value: soldStats[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredOrders]);

  // 10. All-time Monthly Income Data
  const allTimeMonthlyIncomeData = useMemo(() => {
    const monthlyDataMap: { [key: string]: number } = {};
    movements.forEach(m => {
      if (m.type === MovementType.INGRESO) {
        const monthKey = m.date.substring(0, 7); // YYYY-MM
        monthlyDataMap[monthKey] = (monthlyDataMap[monthKey] || 0) + m.amount;
      }
    });

    return Object.keys(monthlyDataMap).sort().map(month => {
      const [year, monthNum] = month.split('-');
      const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('es-ES', { month: 'short' });
      return {
        month: `${monthName} ${year.slice(2)}`,
        ingresos: monthlyDataMap[month]
      };
    });
  }, [movements]);

  // 10. Sales by Day of Week
  const salesByDayData = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    
    filteredOrders.forEach(o => {
      const day = new Date(o.createdAt).getDay();
      dayTotals[day] += o.totalAmount;
    });

    return days.map((name, i) => ({
      name,
      value: dayTotals[i]
    }));
  }, [filteredOrders]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-sm font-bold text-slate-700">{entry.name}:</span>
              <span className="text-sm font-black text-slate-900">
                {entry.value < 0 ? '-' : ''}${Math.abs(entry.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="p-3 md:p-4 bg-indigo-50 text-indigo-600 rounded-2xl md:rounded-3xl shadow-inner">
            <BarChart3 size={24} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Reportes Avanzados</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mt-1">Análisis profundo de tu negocio</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl">
          {[
            { id: '30', label: '30 Días' },
            { id: '90', label: '90 Días' },
            { id: 'all', label: 'Todo' }
          ].map(range => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                timeRange === range.id 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SummaryCard 
          title="Ingresos Totales" 
          value={summaryStats.totalIncome} 
          growth={summaryStats.incomeGrowth}
          icon={<TrendingUp size={20} />} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50"
          isCurrency
        />
        <SummaryCard 
          title="Gastos Totales" 
          value={summaryStats.totalExpenses} 
          growth={summaryStats.expensesGrowth}
          icon={<TrendingDown size={20} />} 
          color="text-rose-600" 
          bgColor="bg-rose-50"
          isCurrency
        />
        <SummaryCard 
          title="Ganancia Neta" 
          value={summaryStats.netProfit} 
          growth={summaryStats.profitGrowth}
          icon={<DollarSign size={20} />} 
          color="text-indigo-600" 
          bgColor="bg-indigo-50"
          isCurrency
        />
        <SummaryCard 
          title="Ticket Promedio" 
          value={summaryStats.avgOrderValue} 
          growth={summaryStats.avgGrowth}
          icon={<Target size={20} />} 
          color="text-amber-600" 
          bgColor="bg-amber-50"
          isCurrency
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        {/* Income vs Expenses Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="p-2.5 md:p-3 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-base md:text-xl font-black text-slate-900 tracking-tight">Ingresos vs Egresos</h3>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimos 6 meses</p>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpensesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Bar dataKey="ingresos" name="Ingresos" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="egresos" name="Egresos" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Net Balance Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="p-2.5 md:p-3 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="text-base md:text-xl font-black text-slate-900 tracking-tight">Balance Neto</h3>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ganancia neta mensual</p>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netBalanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  name="Balance Neto" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Payment Methods Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="p-2.5 md:p-3 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="text-base md:text-xl font-black text-slate-900 tracking-tight">Medios de Pago</h3>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distribución de ingresos</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="h-[200px] md:h-[300px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100">
                            <p className="text-sm font-black text-slate-900">{payload[0].name}</p>
                            <p className="text-sm font-bold text-indigo-600">${payload[0].value.toLocaleString()}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{payload[0].payload.percentage}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              {paymentMethodsData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">${entry.value.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400">{entry.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Sales by Category */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 lg:col-span-1"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="p-2.5 md:p-3 bg-amber-50 text-amber-600 rounded-xl md:rounded-2xl">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 className="text-base md:text-xl font-black text-slate-900 tracking-tight">Ventas por Categoría</h3>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top de categorías</p>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" 
                data={categorySalesData} 
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }}
                  width={120}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100">
                          <p className="text-sm font-black text-slate-900">{payload[0].payload.name}</p>
                          <p className="text-sm font-bold text-indigo-600">{payload[0].value} unidades vendidas</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#6366f1" 
                  radius={[0, 10, 10, 0]} 
                  barSize={30}
                >
                  {categorySalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Expenses by Category Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="p-2.5 md:p-3 bg-rose-50 text-rose-600 rounded-xl md:rounded-2xl">
              <TrendingDown size={18} />
            </div>
            <div>
              <h3 className="text-base md:text-xl font-black text-slate-900 tracking-tight">Gastos por Categoría</h3>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distribución de egresos</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="h-[200px] md:h-[300px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensesByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100">
                            <p className="text-sm font-black text-slate-900">{payload[0].name}</p>
                            <p className="text-sm font-bold text-rose-600">${payload[0].value.toLocaleString()}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{payload[0].payload.percentage}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              {expensesByCategoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }} />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{entry.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">${entry.value.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400">{entry.percentage}%</p>
                  </div>
                </div>
              ))}
              {expensesByCategoryData.length === 0 && (
                <p className="text-center text-slate-400 font-medium italic py-10">No hay egresos registrados</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Daily Income Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="p-2.5 md:p-3 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-base md:text-xl font-black text-slate-900 tracking-tight">Ingresos Diarios</h3>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimos 30 días</p>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyIncomeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  interval={2}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullDate;
                    }
                    return label;
                  }}
                />
                <Bar dataKey="ingresos" radius={[6, 6, 0, 0]}>
                  {dailyIncomeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.ingresos > 0 ? '#4f46e5' : '#e2e8f0'} 
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Customers Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="p-2.5 md:p-3 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-base md:text-xl font-black text-slate-900 tracking-tight">Top Clientes</h3>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Por facturación total</p>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCustomersData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Total Comprado" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Products by Revenue */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="p-2.5 md:p-3 bg-amber-50 text-amber-600 rounded-xl md:rounded-2xl">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 className="text-base md:text-xl font-black text-slate-900 tracking-tight">Productos Estrella</h3>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Por recaudación total</p>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsRevenueData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Recaudación" fill="#f59e0b" radius={[0, 10, 10, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Products by Quantity (Best Sellers) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-indigo-600 p-8 md:p-14 rounded-[2.5rem] md:rounded-[4.5rem] shadow-2xl shadow-indigo-200 text-white flex flex-col relative overflow-hidden"
        >
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-10 md:mb-14 relative z-10">Más <span className="text-indigo-200 italic">Vendidos.</span></h3>
          
          <div className="flex-1 space-y-6 md:space-y-8 relative z-10">
            {topProductsQuantityData.length > 0 ? topProductsQuantityData.map((p, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + (i * 0.1) }}
                key={i} 
                className="space-y-3"
              >
                 <div className="flex justify-between items-end">
                    <span className="font-black text-sm md:text-lg tracking-tight">{p.name}</span>
                    <span className="text-indigo-200 font-black text-xs uppercase tracking-widest">{p.value} u.</span>
                 </div>
                 <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.value / topProductsQuantityData[0].value) * 100}%` }}
                      transition={{ duration: 1.5, delay: 1.5 + (i * 0.1), ease: "easeOut" }}
                      className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                    />
                 </div>
              </motion.div>
            )) : (
              <div className="text-center py-20 opacity-50">
                 <Star size={40} className="mx-auto mb-4" />
                 <p className="font-black text-xs uppercase tracking-widest">Sin datos aún</p>
              </div>
            )}
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-[2rem] border border-white/10 backdrop-blur-md relative z-10">
             <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-2xl text-indigo-600 shadow-xl"><Star size={16} fill="currentColor"/></div>
                <p className="text-[9px] md:text-[11px] font-black uppercase tracking-widest leading-relaxed">Tip: Revisa tu stock de los productos más vendidos.</p>
             </div>
          </div>
        </motion.div>

        {/* Monthly Income Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="p-2.5 md:p-3 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="text-base md:text-xl font-black text-slate-900 tracking-tight">Ingresos Mensuales</h3>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Histórico por mes</p>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={allTimeMonthlyIncomeData}>
                <defs>
                  <linearGradient id="colorIngresosArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                />
                <Area 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorIngresosArea)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sales by Day of Week */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/20"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="p-2.5 md:p-3 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-base md:text-xl font-black text-slate-900 tracking-tight">Ventas por Día</h3>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rendimiento semanal</p>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByDayData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Ventas" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: number;
  growth: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  isCurrency?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, growth, icon, color, bgColor, isCurrency }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/20 flex flex-col justify-between"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 ${bgColor} ${color} rounded-2xl`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${growth >= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
        {growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        <span>{Math.abs(growth).toFixed(0)}%</span>
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
        {isCurrency ? '$' : ''}{value.toLocaleString()}
      </h4>
    </div>
  </motion.div>
);

export default ChartsView;
