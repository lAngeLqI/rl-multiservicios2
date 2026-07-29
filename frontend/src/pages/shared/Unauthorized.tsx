// src/pages/shared/Unauthorized.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500">⛔</h1>
        <p className="text-xl text-gray-600 mt-2">Acceso no autorizado</p>
        <p className="text-sm text-gray-400 mt-2">No tienes permisos para acceder a esta página</p>
        <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;