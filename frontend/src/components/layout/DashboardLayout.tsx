// src/components/layout/DashboardLayout.tsx
import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { notifications, removeNotification } = useNotification();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menú según el rol del usuario
  const menuItems = user?.rol === 'disenador' ? [
    { path: '/disenador/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/disenador/nuevo-pedido', icon: '📤', label: 'Nuevo Pedido' },
    { path: '/disenador/mis-pedidos', icon: '📋', label: 'Mis Pedidos' },
  ] : [
    { path: '/operador/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/operador/pedidos', icon: '📋', label: 'Gestión de Pedidos' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ========== SIDEBAR ========== */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-primary-900 text-white transition-all duration-300 flex flex-col fixed h-full z-50 shadow-2xl`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🖨️</span>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">RL-Multiservicios</h1>
                <p className="text-xs text-primary-300">Gigantografías</p>
              </div>
            )}
          </div>
        </div>

        {/* Menú */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-700 shadow-lg'
                    : 'hover:bg-primary-800'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Usuario */}
        <div className="p-4 border-t border-primary-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-lg font-bold">
              {user?.nombre?.charAt(0) || '👤'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user?.nombre}</p>
                <p className="text-xs text-primary-300 truncate capitalize">{user?.rol}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-primary-800 rounded-lg transition"
              title="Cerrar sesión"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* ========== CONTENIDO PRINCIPAL ========== */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>

          <div className="flex items-center gap-4">
            {/* Notificaciones */}
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                🔔
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {notifications.length > 0 && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 border-b border-gray-100 hover:bg-gray-50 flex items-start gap-2"
                    >
                      <span>
                        {n.type === 'success' && '✅'}
                        {n.type === 'error' && '❌'}
                        {n.type === 'warning' && '⚠️'}
                        {n.type === 'info' && 'ℹ️'}
                      </span>
                      <p className="text-sm flex-1">{n.message}</p>
                      <button
                        onClick={() => removeNotification(n.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;