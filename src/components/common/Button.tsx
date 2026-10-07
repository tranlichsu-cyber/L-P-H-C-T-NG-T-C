import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'student' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97]';

  const variants = {
    primary: 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-500 hover:to-indigo-500 active:from-sky-700 active:to-indigo-700 shadow-md shadow-sky-600/30 border border-sky-500/30',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200',
    outline: 'border-2 border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-sky-400 active:bg-slate-100',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 active:from-rose-700 active:to-red-700 shadow-md shadow-rose-600/30 border border-rose-500/30',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 shadow-md shadow-emerald-600/30 border border-emerald-500/30',
    warning: 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 hover:from-amber-300 hover:to-orange-300 active:from-amber-500 active:to-orange-500 shadow-md shadow-amber-400/30 border border-amber-300',
    student: 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 hover:from-amber-300 hover:to-orange-400 active:from-amber-600 active:to-orange-600 shadow-lg shadow-amber-500/35 text-xl font-black border-b-4 border-amber-600 tracking-wide',
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg font-semibold',
    xl: 'px-8 py-4 text-xl font-bold rounded-2xl',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
