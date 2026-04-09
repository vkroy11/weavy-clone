import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface NodeShellProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
  selected?: boolean;
}

export const NodeShell = ({ title, icon: Icon, iconColor, children, selected }: NodeShellProps) => {
  return (
    <div className={`min-w-[280px] bg-white rounded-2xl shadow-xl border-2 transition-all ${selected ? 'border-primary ring-4 ring-primary/10' : 'border-transparent'}`}>
      <div className="flex items-center justify-between p-3 border-b border-node-border bg-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gray-50">
            <Icon className={iconColor} size={16} />
          </div>
          <span className="text-[13px] font-bold text-gray-800 uppercase tracking-tight">{title}</span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-md transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>
      <div className="p-4 bg-white rounded-b-2xl">
        {children}
      </div>
    </div>
  );
};

