import React from 'react';
import { motion } from 'motion/react';

interface PipelineStepProps {
  label: string;
  count: number;
  color: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
  percentage: number;
}

const PipelineStep: React.FC<PipelineStepProps> = ({ label, count, color, bgColor, textColor, icon, percentage }) => (
  <div className={`${bgColor} p-6 rounded-3xl border border-slate-100 flex flex-col gap-4 relative overflow-hidden group`}>
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-indigo-200/20`}>
        {icon}
      </div>
      <span className="text-3xl font-black text-slate-900">{count}</span>
    </div>
    <div className="relative z-10">
      <p className={`text-[10px] font-black uppercase tracking-widest ${textColor} mb-2`}>{label}</p>
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  </div>
);

export default PipelineStep;
