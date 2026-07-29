// src/pages/shared/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <p className="text-xl text-gray-600 mt-2">Página no encontrada</p>
        <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;