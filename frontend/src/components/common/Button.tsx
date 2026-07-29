// src/components/common/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-md hover:shadow-lg',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white',
    ghost: 'text-primary-600 hover:bg-primary-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-base rounded-lg',
    lg: 'px-7 py-3.5 text-lg rounded-xl',
  };

  const baseClasses = 'font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;  // ← Asegurar que existe esta línea