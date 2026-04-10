import React from 'react';

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

const ActionItem: React.FC<ActionItemProps> = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`${color} w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95 group`}
  >
    <div className="shrink-0 group-hover:rotate-12 transition-transform">{icon}</div>
    <span className="font-black text-[11px] uppercase tracking-widest">{label}</span>
  </button>
);

export default ActionItem;
