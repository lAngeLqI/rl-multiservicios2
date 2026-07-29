// src/pages/auth/RegisterPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-900">📝 Registro</h1>
          <p className="text-gray-500 mt-1">Crea tu cuenta</p>
        </div>
        <div className="text-center text-gray-400 py-8">
          <p>Registro - En desarrollo</p>
          <Link to="/login" className="text-primary-600 hover:underline mt-4 inline-block">
            ← Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;