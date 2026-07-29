// src/pages/admin/GestionDispositivos.tsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Dispositivo {
  id: number;
  usuario_id: number;
  usuario_nombre: string;
  usuario_email: string;
  nombre_dispositivo: string;
  sistema_operativo: string;
  navegador: string;
  ip: string;
  autorizado: boolean;
  created_at: string;
}

const GestionDispositivos: React.FC = () => {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'pendientes' | 'autorizados'>('todos');
  const { showNotification } = useNotification();

  const cargarDispositivos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/dispositivos');
      setDispositivos(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Error al cargar dispositivos');
    } finally {
      setLoading(false);
    }
  };

  const autorizarDispositivo = async (id: number) => {
    try {
      await api.put(`/admin/dispositivos/${id}/autorizar`);
      showNotification('success', '✅ Dispositivo autorizado correctamente');
      cargarDispositivos();
    } catch (error) {
      showNotification('error', 'Error al autorizar dispositivo');
    }
  };

  const rechazarDispositivo = async (id: number) => {
    try {
      await api.delete(`/admin/dispositivos/${id}/rechazar`);
      showNotification('info', 'Dispositivo rechazado');
      cargarDispositivos();
    } catch (error) {
      showNotification('error', 'Error al rechazar dispositivo');
    }
  };

  useEffect(() => {
    cargarDispositivos();
  }, []);

  const dispositivosFiltrados = dispositivos.filter(d => {
    if (filtro === 'pendientes') return !d.autorizado;
    if (filtro === 'autorizados') return d.autorizado;
    return true;
  });

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
          <h1 className="text-3xl font-bold text-gray-800">📱 Gestión de Dispositivos</h1>
          <p className="text-gray-500 mt-1">Administra los dispositivos autorizados</p>
        </div>
        <button
          onClick={cargarDispositivos}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition flex items-center gap-2"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Filtros */}
      <Card title="🔍 Filtrar dispositivos">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filtro === 'todos'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 Todos
          </button>
          <button
            onClick={() => setFiltro('pendientes')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filtro === 'pendientes'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⏳ Pendientes
          </button>
          <button
            onClick={() => setFiltro('autorizados')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filtro === 'autorizados'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✅ Autorizados
          </button>
        </div>
      </Card>

      {/* Tabla de dispositivos */}
      <Card title={`📱 Dispositivos (${dispositivosFiltrados.length})`}>
        {dispositivosFiltrados.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay dispositivos con este filtro</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispositivo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Navegador</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dispositivosFiltrados.map((d, index) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{d.usuario_nombre}</div>
                      <div className="text-xs text-gray-400">{d.usuario_email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{d.nombre_dispositivo}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{d.sistema_operativo}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{d.navegador}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{d.ip}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        d.autorizado
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {d.autorizado ? '✅ Autorizado' : '⏳ Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {!d.autorizado ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => autorizarDispositivo(d.id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs transition flex items-center gap-1"
                          >
                            ✅ Autorizar
                          </button>
                          <button
                            onClick={() => rechazarDispositivo(d.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition flex items-center gap-1"
                          >
                            ❌ Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Autorizado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default GestionDispositivos;