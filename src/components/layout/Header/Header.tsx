import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User, ChevronDown, Menu, X } from 'lucide-react';
import { Logo } from '../Logo';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
  badgeColor?: string;
  children?: Array<{
    id: string;
    label: string;
  }>;
}

interface HeaderProps {
  currentUser: any;
  onLogout: () => void;
  navItems: NavItem[];
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, navItems }) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openNavDropdown, setOpenNavDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navDropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Map navItem IDs to routes
  const routeMap: Record<string, string> = {
    dashboard: '/',
    agenda: '/orders',
    productos: '/inventory',
    clientes: '/customers',
    caja: '/cash-flow',
    proveedores: '/suppliers',
    graficos: '/charts',
    calculadora: '/calculator',
    deudores: '/debtors',
    presupuestos: '/quotes'
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }

      // Close nav dropdowns if clicking outside
      if (openNavDropdown) {
        const clickedOutside = !Object.values(navDropdownRefs.current).some(
          ref => ref && (ref as HTMLDivElement).contains(event.target as Node)
        );
        if (clickedOutside) {
          setOpenNavDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openNavDropdown]);

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const getUserName = () => {
    if (currentUser?.user_metadata?.full_name) {
      return currentUser.user_metadata.full_name;
    }
    return currentUser?.email || 'Usuario';
  };

  return (
    <header className="bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="px-4 md:px-8 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          </div>

          {/* Navegación Desktop - Horizontal */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-4xl">
            {navItems.map((item) => (
              item.children ? (
                // Item with dropdown
                <div
                  key={item.id}
                  className="relative"
                  ref={el => { if (el) navDropdownRefs.current[item.id] = el; }}
                >
                  <button
                    onClick={() => setOpenNavDropdown(openNavDropdown === item.id ? null : item.id)}
                    className={`relative flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      item.children.some(child => routeMap[child.id] === location.pathname)
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${openNavDropdown === item.id ? 'rotate-180' : ''}`}
                    />
                    {item.children.some(child => routeMap[child.id] === location.pathname) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                      />
                    )}
                  </button>

                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {openNavDropdown === item.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden min-w-[180px] z-50"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            to={routeMap[child.id]}
                            onClick={() => setOpenNavDropdown(null)}
                            className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                              location.pathname === routeMap[child.id]
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Regular item
                <Link
                  key={item.id}
                  to={routeMap[item.id]}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    location.pathname === routeMap[item.id]
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-rose-500'}`}>
                      {item.badge}
                    </span>
                  )}
                  {location.pathname === routeMap[item.id] && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    />
                  )}
                </Link>
              )
            ))}
          </nav>

          {/* Botones derecha */}
          <div className="flex items-center gap-2">
            {/* Botón menú móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Perfil del usuario */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {getInitials(currentUser?.email || 'U')}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {getInitials(currentUser?.email || 'U')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">{getUserName()}</p>
                          <p className="text-xs text-slate-600 truncate">{currentUser?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-all text-left">
                        <User size={18} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Mi Perfil</span>
                      </button>

                      <div className="my-1 border-t border-slate-100"></div>

                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-rose-50 transition-all text-left group"
                      >
                        <LogOut size={18} className="text-rose-500" />
                        <span className="text-sm font-medium text-rose-600 group-hover:text-rose-700">
                          Cerrar Sesión
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 bg-white"
          >
            <nav className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                item.children ? (
                  // Item with submenu
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => setOpenNavDropdown(openNavDropdown === item.id ? null : item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                        item.children.some(child => routeMap[child.id] === location.pathname)
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${openNavDropdown === item.id ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {openNavDropdown === item.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-4 space-y-1"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              to={routeMap[child.id]}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setOpenNavDropdown(null);
                              }}
                              className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                location.pathname === routeMap[child.id]
                                  ? 'bg-indigo-50 text-indigo-600'
                                  : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  // Regular item
                  <Link
                    key={item.id}
                    to={routeMap[item.id]}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      location.pathname === routeMap[item.id]
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${item.badgeColor || 'bg-rose-500'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
