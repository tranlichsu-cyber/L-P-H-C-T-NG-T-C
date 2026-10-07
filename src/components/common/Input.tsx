import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  largeText?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  largeText = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 placeholder:text-slate-400 ${
          largeText ? 'text-2xl font-bold tracking-widest text-center py-4' : 'text-base'
        } ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm font-medium text-rose-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
