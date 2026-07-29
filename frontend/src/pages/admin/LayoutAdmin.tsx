// src/pages/admin/LayoutAdmin.tsx
import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LayoutAdmin: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/usuarios', icon: '👤', label: 'Usuarios' },
    { path: '/admin/dispositivos', icon: '📱', label: 'Dispositivos' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col fixed h-full z-50 shadow-2xl`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">Admin Panel</h1>
                <p className="text-xs text-gray-400">RL-Multiservicios</p>
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
                    ? 'bg-gray-800 shadow-lg'
                    : 'hover:bg-gray-800'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Usuario */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
              {user?.nombre?.charAt(0) || '👤'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user?.nombre}</p>
                <p className="text-xs text-gray-400 truncate capitalize">{user?.rol}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-800 rounded-lg transition"
              title="Cerrar sesión"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              👑 {user?.nombre} (Administrador)
            </span>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutAdmin;