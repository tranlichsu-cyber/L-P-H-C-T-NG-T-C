import React from 'react';

interface BadgeProps {
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'neutral' | 'primary';
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  children,
  size = 'md',
  className = '',
}) => {
  const styles = {
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-sky-500 text-white border-sky-600',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-sm font-semibold',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${styles[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
