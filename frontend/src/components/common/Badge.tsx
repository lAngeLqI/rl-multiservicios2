// src/components/common/Badge.tsx
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'urgente' | 'media' | 'baja' | 'pendiente' | 'proceso' | 'listo' | 'aprobado' | 'default';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    urgente: 'bg-red-100 text-red-800',
    media: 'bg-yellow-100 text-yellow-800',
    baja: 'bg-green-100 text-green-800',
    pendiente: 'bg-gray-100 text-gray-800',
    proceso: 'bg-blue-100 text-blue-800',
    listo: 'bg-green-100 text-green-800',
    aprobado: 'bg-purple-100 text-purple-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;