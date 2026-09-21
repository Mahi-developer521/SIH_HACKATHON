import React from 'react';
import { RiskLevel, CaseStatus } from '../../types/surveillance';
import { AlertTriangle, AlertCircle, CheckCircle2, Clock, ShieldAlert, Activity, Check } from 'lucide-react';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'high' | 'medium' | 'low' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = ''
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5'
  };

  const variantStyles = {
    high: 'bg-rose-50 text-rose-700 border border-rose-200 font-bold',
    medium: 'bg-amber-50 text-amber-800 border border-amber-200 font-bold',
    low: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 font-bold',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200 font-bold',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    info: 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200 font-medium'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full tracking-wide select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export const RiskBadge: React.FC<{ risk: RiskLevel; size?: 'sm' | 'md'; showIcon?: boolean }> = ({
  risk,
  size = 'md',
  showIcon = true
}) => {
  if (risk === 'HIGH') {
    return (
      <Badge
        variant="high"
        size={size}
        icon={showIcon ? <AlertCircle className={size === 'sm' ? 'w-3 h-3 text-rose-600' : 'w-3.5 h-3.5 text-rose-600'} /> : undefined}
      >
        High Risk
      </Badge>
    );
  }
  if (risk === 'MEDIUM') {
    return (
      <Badge
        variant="medium"
        size={size}
        icon={showIcon ? <AlertTriangle className={size === 'sm' ? 'w-3 h-3 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} /> : undefined}
      >
        Moderate
      </Badge>
    );
  }
  return (
    <Badge
      variant="low"
      size={size}
      icon={showIcon ? <CheckCircle2 className={size === 'sm' ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} /> : undefined}
    >
      Low Risk
    </Badge>
  );
};

export const StatusBadge: React.FC<{ status: CaseStatus | string; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm'
}) => {
  switch (status) {
    case 'REPORTED':
      return <Badge variant="warning" size={size} icon={<Clock className="w-3 h-3 text-amber-600" />}>Reported</Badge>;
    case 'TRIAGED':
      return <Badge variant="info" size={size} icon={<Activity className="w-3 h-3 text-blue-600" />}>Triaged</Badge>;
    case 'INVESTIGATING':
      return <Badge variant="warning" size={size} icon={<Activity className="w-3 h-3 text-amber-600" />}>Investigating</Badge>;
    case 'SAMPLE_COLLECTED':
      return <Badge variant="info" size={size} icon={<Clock className="w-3 h-3 text-blue-600" />}>Sample Collected</Badge>;
    case 'LAB_CONFIRMED':
      return <Badge variant="danger" size={size} icon={<ShieldAlert className="w-3 h-3 text-rose-600" />}>Lab Confirmed</Badge>;
    case 'INTERVENED':
      return <Badge variant="info" size={size} icon={<Clock className="w-3 h-3 text-blue-600" />}>Intervention Active</Badge>;
    case 'RESOLVED':
    case 'CONTAINED':
      return <Badge variant="success" size={size} icon={<Check className="w-3 h-3 text-emerald-600" />}>Resolved</Badge>;
    default:
      return <Badge variant="neutral" size={size}>{status}</Badge>;
  }
};
