import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl shadow-sm transition-all ${
        interactive ? 'hover:border-blue-300 hover:shadow-md cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, icon, className = '' }) => {
  return (
    <div className={`p-5 border-b border-slate-100 flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-slate-500 shrink-0">{icon}</span>}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`px-5 py-3.5 border-t border-slate-100 bg-slate-50/70 rounded-b-2xl flex items-center justify-between gap-3 text-xs text-slate-500 ${className}`}>
      {children}
    </div>
  );
};
