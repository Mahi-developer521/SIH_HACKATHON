import React from 'react';

export interface KPICardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'slate';
  onClick?: () => void;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  accentColor = 'emerald',
  onClick,
  className = ''
}) => {
  const colorMap = {
    emerald: {
      border: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      valueColor: 'text-emerald-400',
      bar: 'bg-emerald-500'
    },
    amber: {
      border: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      valueColor: 'text-amber-400',
      bar: 'bg-amber-500'
    },
    rose: {
      border: 'hover:border-rose-500/50',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      valueColor: 'text-rose-400',
      bar: 'bg-rose-500'
    },
    blue: {
      border: 'hover:border-blue-500/50',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      valueColor: 'text-blue-400',
      bar: 'bg-blue-500'
    },
    purple: {
      border: 'hover:border-purple-500/50',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      valueColor: 'text-purple-400',
      bar: 'bg-purple-500'
    },
    slate: {
      border: 'hover:border-slate-600',
      iconBg: 'bg-slate-800 text-slate-300 border-slate-700',
      valueColor: 'text-white',
      bar: 'bg-slate-500'
    }
  };

  const theme = colorMap[accentColor] || colorMap.emerald;

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800/90 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all ${
        onClick ? `cursor-pointer ${theme.border} hover:shadow-xl hover:shadow-slate-950/40 active:scale-[0.99]` : ''
      } ${className}`}
    >
      {/* Subtle top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${theme.bar} opacity-70`} />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${theme.valueColor}`}>
              {value}
            </span>
            {trend && (
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                  trend.isPositive
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-rose-500/15 text-rose-400'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtext && <p className="text-xs text-slate-400 leading-snug pt-0.5">{subtext}</p>}
        </div>

        {icon && (
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${theme.iconBg}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
