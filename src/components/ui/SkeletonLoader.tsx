import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`} />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 6
}) => {
  return (
    <div className="w-full space-y-3 p-4">
      {/* Table Header Skeleton */}
      <div className="grid grid-cols-6 gap-4 pb-3 border-b border-slate-200">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`th-${i}`} className="h-4 w-20" />
        ))}
      </div>
      {/* Table Rows Skeleton */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`tr-${r}`} className="grid grid-cols-6 gap-4 py-3 border-b border-slate-100 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={`td-${r}-${c}`} className={`h-4 ${c === 0 ? 'w-24' : 'w-16'}`} />
          ))}
        </div>
      ))}
    </div>
  );
};
