import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are currently no items matching this criteria.',
  icon,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-3.5 shadow-inner">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
