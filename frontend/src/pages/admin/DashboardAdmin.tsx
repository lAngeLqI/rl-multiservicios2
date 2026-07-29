// src/pages/admin/DashboardAdmin.tsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Stats {
  totalUsuarios: number;
  usuariosPendientes: number;
  dispositivosPendientes: number;
  usuariosPorRol: Array<{ rol: string; total: number }>;
}

const DashboardAdmin: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">Bienvenido al panel de administración</p>
        </div>
        <button
          onClick={cargarEstadisticas}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition flex items-center gap-2"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.totalUsuarios || 0}</p>
            </div>
            <span className="text-4xl">👥</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Usuarios Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.usuariosPendientes || 0}</p>
            </div>
            <span className="text-4xl">⏳</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Dispositivos Pendientes</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.dispositivosPendientes || 0}</p>
            </div>
            <span className="text-4xl">📱</span>
          </div>
        </div>
      </div>

      {/* Usuarios por rol */}
      <Card title="📋 Usuarios por Rol">
        <div className="space-y-3">
          {stats?.usuariosPorRol?.map((item) => (
            <div key={item.rol} className="flex items-center gap-4">
              <span className="w-24 text-sm font-medium text-gray-600 capitalize">{item.rol}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-primary-600 transition-all duration-500"
                  style={{
                    width: `${(item.total / (stats?.totalUsuarios || 1)) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">{item.total}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => window.location.href = '/admin/usuarios'}
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition border border-gray-200 text-left"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">👤</span>
            <div>
              <h3 className="font-semibold text-gray-800">Gestionar Usuarios</h3>
              <p className="text-sm text-gray-500">Aprobar o rechazar solicitudes de usuarios</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => window.location.href = '/admin/dispositivos'}
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition border border-gray-200 text-left"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">📱</span>
            <div>
              <h3 className="font-semibold text-gray-800">Gestionar Dispositivos</h3>
              <p className="text-sm text-gray-500">Autorizar o rechazar dispositivos</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DashboardAdmin;