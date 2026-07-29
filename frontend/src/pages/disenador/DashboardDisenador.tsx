// src/pages/disenador/DashboardDisenador.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { pedidoService } from '../../services/pedidoService';
import { useSocket } from '../../hooks/useSocket';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Pedido {
  id: number;
  nombre: string;
  estado: 'pendiente' | 'proceso' | 'impreso' | 'entregado';
  prioridad: 'urgente' | 'media' | 'baja';
  fecha_entrega: string;
  created_at: string;
}

type EstadoType = Pedido['estado'];

const DashboardDisenador: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    proceso: 0,
    impresos: 0,
    entregados: 0,
    urgentes: 0,
  });

  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { on, off } = useSocket();

  const cargarPedidos = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await pedidoService.getPedidosByDisenador(user.id);
      setPedidos(data || []);
      
      const items = data || [];
      setStats({
        total: items.length,
        pendientes: items.filter((p: Pedido) => p.estado === 'pendiente').length,
        proceso: items.filter((p: Pedido) => p.estado === 'proceso').length,
        impresos: items.filter((p: Pedido) => p.estado === 'impreso').length,
        entregados: items.filter((p: Pedido) => p.estado === 'entregado').length,
        urgentes: items.filter((p: Pedido) => p.prioridad === 'urgente').length,
      });
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      showNotification('error', 'Error al cargar tus pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();

    const handleEstadoCambiado = () => {
      cargarPedidos();
    };

    on('estado-cambiado', handleEstadoCambiado);

    return () => {
      off('estado-cambiado', handleEstadoCambiado);
    };
  }, [user]);

  // 🔥 Obtener el ícono del estado para el diseñador
  const getEstadoIcon = (estado: EstadoType) => {
    const icons = {
      pendiente: '⏳',
      proceso: '🖨️',
      impreso: '✅',
      entregado: '📦',
    };
    return icons[estado] || '📌';
  };

  // 🔥 Obtener el texto amigable para el diseñador
  const getEstadoTexto = (estado: EstadoType) => {
    const textos = {
      pendiente: 'Pendiente',
      proceso: 'En impresión',
      impreso: 'Impreso',
      entregado: 'Entregado',
    };
    return textos[estado] || estado;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header con botón */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            📊 Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Bienvenido, {user?.nombre || 'Diseñador'} 👋
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/disenador/nuevo-pedido')}
            icon="📤"
          >
            Nuevo Pedido
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={cargarPedidos}
            icon="🔄"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <p className="text-sm text-gray-500">📊 Total</p>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-yellow-200">
          <p className="text-sm text-gray-500">⏳ Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-blue-200">
          <p className="text-sm text-gray-500">🖨️ En impresión</p>
          <p className="text-3xl font-bold text-blue-600">{stats.proceso}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-green-200">
          <p className="text-sm text-gray-500">✅ Impresos</p>
          <p className="text-3xl font-bold text-green-600">{stats.impresos}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-purple-200">
          <p className="text-sm text-gray-500">🔴 Urgentes</p>
          <p className="text-3xl font-bold text-red-600">{stats.urgentes}</p>
        </div>
      </div>

      {/* Últimos pedidos */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">📋 Mis últimos pedidos</h2>
          <button
            onClick={() => navigate('/disenador/mis-pedidos')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Ver todos →
          </button>
        </div>
        <div className="overflow-x-auto">
          {pedidos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Aún no tienes pedidos</p>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/disenador/nuevo-pedido')}
                className="mt-4"
                icon="📤"
              >
                Crear tu primer pedido
              </Button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pedidos.slice(0, 5).map((pedido, index) => (
                  <tr key={pedido.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {pedido.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(pedido.created_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        pedido.estado === 'proceso' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        pedido.estado === 'impreso' ? 'bg-green-100 text-green-800 border-green-200' :
                        'bg-gray-100 text-gray-800 border-gray-300'
                      }`}>
                        {getEstadoIcon(pedido.estado)} {getEstadoTexto(pedido.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pedido.prioridad === 'urgente' ? 'bg-red-100 text-red-800' :
                        pedido.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {pedido.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/disenador/pedido/${pedido.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver detalles →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardDisenador;