import React from 'react';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: any;
  color: string;
  icon: React.ReactNode;
  delay?: number;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, icon, delay = 0, onClick }) => {
  const isLight = color.includes('white') || color.includes('-50') || color.includes('-100');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`${color} p-2 md:p-3 rounded-[1.5rem] md:rounded-3xl shadow-xl shadow-slate-200/20 flex flex-col justify-between min-h-17.5 md:min-h-25 transition-all ${onClick ? 'cursor-pointer' : 'cursor-default'} overflow-hidden`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'opacity-60'} truncate`}>{title}</span>
        <div className={`p-1 md:p-1.5 rounded-lg md:rounded-xl ${isLight ? 'bg-slate-50 shadow-inner' : 'bg-white/10'} shrink-0`}>{icon}</div>
      </div>
      <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-black mt-2 md:mt-4 tracking-tighter whitespace-nowrap">{value}</span>
    </motion.div>
  );
};

export default StatCard;
