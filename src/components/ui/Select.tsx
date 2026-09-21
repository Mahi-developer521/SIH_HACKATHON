import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  children,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-300">
          {label} {props.required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`w-full bg-slate-950 border rounded-xl py-2 px-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
          error
            ? 'border-rose-500/80 focus:border-rose-500'
            : 'border-slate-800 focus:border-emerald-500/80'
        } ${className}`}
        {...props}
      >
        {options ? (
          options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-100">
              {opt.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';
