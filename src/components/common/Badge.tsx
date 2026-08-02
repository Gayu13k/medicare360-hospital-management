import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getColors = (s: string) => {
    switch (s.toUpperCase()) {
      case 'IN_PROGRESS':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30 animate-pulse';
      case 'APPROVED':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'COMPLETED':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'PENDING':
        return 'bg-[#C5A059]/15 text-[#E5C278] border-[#C5A059]/30';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'PAID':
        return 'bg-[#C5A059]/20 text-[#E5C278] border-[#C5A059]/40';
      case 'ACTIVE':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-zinc-800/80 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getColors(
        status
      )} ${className}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
};
