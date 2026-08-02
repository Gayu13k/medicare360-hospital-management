import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose' | 'teal';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  color = 'blue',
}) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  };

  return (
    <div className="bg-[#121212] rounded-2xl p-5 border border-white/10 shadow-lg hover:border-[#C5A059]/40 transition-all group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{title}</p>
          <p className="text-2xl font-serif font-bold text-zinc-100 mt-1 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-zinc-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-2xl border ${colorMap[color]} group-hover:scale-105 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
