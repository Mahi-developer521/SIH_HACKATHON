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
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
          {label} {props.required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`w-full bg-white border rounded-xl py-2 px-3.5 text-xs sm:text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          error
            ? 'border-rose-400 focus:border-rose-500'
            : 'border-slate-300 focus:border-blue-600'
        } ${className}`}
        {...props}
      >
        {options ? (
          options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
              {opt.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';
