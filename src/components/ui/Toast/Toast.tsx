import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';

export interface ToastProps {
  msg: string;
  type: 'success' | 'error';
}

export const Toast: React.FC<{ toast: ToastProps | null }> = ({ toast }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 ${
            toast.type === 'success'
              ? 'bg-white border-emerald-100 text-emerald-700'
              : 'bg-white border-rose-100 text-rose-700'
          }`}
        >
          <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={20}/> : <X size={20}/>}
          </div>
          <span className="font-bold text-sm tracking-tight">{toast.msg}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
