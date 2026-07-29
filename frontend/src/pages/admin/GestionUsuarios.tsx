// src/pages/admin/GestionUsuarios.tsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  telefono?: string;
  empresa?: string;
  created_at: string;
}

const GestionUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todos' | 'pendiente' | 'aprobado' | 'rechazado'>('todos');
  const { showNotification } = useNotification();

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/usuarios');
      setUsuarios(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      showNotification('error', 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const aprobarUsuario = async (id: number) => {
    try {
      await api.put(`/admin/usuarios/${id}/aprobar`);
      showNotification('success', '✅ Usuario aprobado correctamente');
      cargarUsuarios();
    } catch (error) {
      showNotification('error', 'Error al aprobar usuario');
    }
  };

  const rechazarUsuario = async (id: number) => {
    try {
      await api.put(`/admin/usuarios/${id}/rechazar`);
      showNotification('info', 'Usuario rechazado');
      cargarUsuarios();
    } catch (error) {
      showNotification('error', 'Error al rechazar usuario');
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const getEstadoColor = (estado: string) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      aprobado: 'bg-green-100 text-green-800 border-green-200',
      rechazado: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoIcon = (estado: string) => {
    const icons = {
      pendiente: '⏳',
      aprobado: '✅',
      rechazado: '❌',
    };
    return icons[estado as keyof typeof icons] || '📌';
  };

  const usuariosFiltrados = filtro === 'todos' 
    ? usuarios 
    : usuarios.filter(u => u.estado === filtro);

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
          <h1 className="text-3xl font-bold text-gray-800">👤 Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1">Administra los usuarios del sistema</p>
        </div>
        <button
          onClick={cargarUsuarios}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition flex items-center gap-2"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Filtros */}
      <Card title="🔍 Filtrar por estado">
        <div className="flex flex-wrap gap-2">
          {['todos', 'pendiente', 'aprobado', 'rechazado'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltro(estado as typeof filtro)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filtro === estado
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {estado === 'todos' ? '📋 Todos' : `${getEstadoIcon(estado)} ${estado}`}
            </button>
          ))}
        </div>
      </Card>

      {/* Tabla de usuarios */}
      <Card title={`👤 Usuarios (${usuariosFiltrados.length})`}>
        {usuariosFiltrados.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay usuarios con este filtro</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuariosFiltrados.map((usuario, index) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {usuario.nombre}
                      {usuario.empresa && (
                        <span className="text-xs text-gray-400 block">{usuario.empresa}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{usuario.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(usuario.estado)}`}>
                        {getEstadoIcon(usuario.estado)} {usuario.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(usuario.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {usuario.estado === 'pendiente' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => aprobarUsuario(usuario.id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs transition flex items-center gap-1"
                          >
                            ✅ Aprobar
                          </button>
                          <button
                            onClick={() => rechazarUsuario(usuario.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition flex items-center gap-1"
                          >
                            ❌ Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Procesado</span>
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

export default GestionUsuarios;