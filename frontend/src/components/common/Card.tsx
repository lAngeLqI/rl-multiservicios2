// src/components/common/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  icon,
  actions,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-primary-50 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 border border-primary-50 ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && <span className="text-2xl">{icon}</span>}
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;