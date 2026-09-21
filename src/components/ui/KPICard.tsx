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
  accentColor = 'blue',
  onClick,
  className = ''
}) => {
  const colorMap = {
    blue: {
      border: 'hover:border-blue-400',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      valueColor: 'text-blue-700',
      bar: 'bg-blue-600'
    },
    emerald: {
      border: 'hover:border-emerald-400',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      valueColor: 'text-emerald-700',
      bar: 'bg-emerald-600'
    },
    amber: {
      border: 'hover:border-amber-400',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      valueColor: 'text-amber-700',
      bar: 'bg-amber-500'
    },
    rose: {
      border: 'hover:border-rose-400',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      valueColor: 'text-rose-700',
      bar: 'bg-rose-600'
    },
    purple: {
      border: 'hover:border-purple-400',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      valueColor: 'text-purple-700',
      bar: 'bg-purple-600'
    },
    slate: {
      border: 'hover:border-slate-400',
      iconBg: 'bg-slate-100 text-slate-600 border-slate-200',
      valueColor: 'text-slate-800',
      bar: 'bg-slate-400'
    }
  };

  const theme = colorMap[accentColor] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all ${
        onClick ? `cursor-pointer ${theme.border} hover:shadow-md active:scale-[0.99]` : ''
      } ${className}`}
    >
      {/* Subtle top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${theme.bar}`} />

      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${theme.valueColor}`}>
              {value}
            </span>
            {trend && (
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                  trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtext && <p className="text-xs text-slate-500 leading-snug pt-0.5">{subtext}</p>}
        </div>

        {icon && (
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${theme.iconBg}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
