// src/pages/operador/DashboardOperador.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { pedidoService } from '../../services/pedidoService';
import { useSocket } from '../../hooks/useSocket';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Pedido {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_entrega: string;
  prioridad: 'urgente' | 'media' | 'baja';
  comentario_general?: string;
  estado: 'pendiente' | 'proceso' | 'impreso' | 'entregado';  // 🔥 SOLO 4 ESTADOS
  disenador_id: number;
  disenador_nombre?: string;
  operador_id?: number;
  total_archivos: number;
  created_at: string;
}

// 🔥 SOLO 4 ESTADOS PARA EL OPERADOR
type EstadoType = 'pendiente' | 'proceso' | 'impreso' | 'entregado';

const DashboardOperador: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<EstadoType | 'todos'>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<'todas' | 'urgente' | 'media' | 'baja'>('todas');
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
    setLoading(true);
    try {
      const response = await pedidoService.getPedidos(1, 100);
      setPedidos(response.items || []);
      
      const items = response.items || [];
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
      showNotification('error', 'Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();

    const handleNuevoPedido = () => {
      showNotification('info', '📦 Nuevo pedido recibido');
      cargarPedidos();
    };

    const handleEstadoCambiado = () => {
      cargarPedidos();
    };

    on('nuevo-pedido', handleNuevoPedido);
    on('estado-cambiado', handleEstadoCambiado);

    return () => {
      off('nuevo-pedido', handleNuevoPedido);
      off('estado-cambiado', handleEstadoCambiado);
    };
  }, []);

  const cambiarEstado = async (id: number, nuevoEstado: EstadoType) => {
    try {
      await pedidoService.cambiarEstado(id, nuevoEstado);
      showNotification('success', `✅ Estado actualizado a "${nuevoEstado}"`);
      cargarPedidos();
    } catch (error: any) {
      showNotification('error', error.userMessage || 'Error al cambiar estado');
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroEstado !== 'todos' && pedido.estado !== filtroEstado) return false;
    if (filtroPrioridad !== 'todas' && pedido.prioridad !== filtroPrioridad) return false;
    return true;
  });

  // 🔥 COLORES PARA LOS 4 ESTADOS
  const getEstadoColor = (estado: EstadoType) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      proceso: 'bg-blue-100 text-blue-800 border-blue-200',
      impreso: 'bg-green-100 text-green-800 border-green-200',
      entregado: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  // 🔥 ÍCONOS PARA LOS 4 ESTADOS
  const getEstadoIcon = (estado: EstadoType) => {
    const icons = {
      pendiente: '⏳',
      proceso: '🖨️',
      impreso: '✅',
      entregado: '📦',
    };
    return icons[estado] || '📌';
  };

  const getPrioridadColor = (prioridad: string) => {
    const colors = {
      urgente: 'text-red-600 bg-red-50 border-red-200',
      media: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      baja: 'text-green-600 bg-green-50 border-green-200',
    };
    return colors[prioridad as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard Operador</h1>
          <p className="text-gray-500 mt-1">
            Bienvenido, {user?.nombre || 'Operador'} 👋
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={cargarPedidos}
          icon="🔄"
        >
          Actualizar
        </Button>
      </div>

      {/* 🔥 ESTADÍSTICAS CON 4 ESTADOS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-yellow-200">
          <p className="text-sm text-gray-500">⏳ Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-blue-200">
          <p className="text-sm text-gray-500">🖨️ Proceso</p>
          <p className="text-2xl font-bold text-blue-600">{stats.proceso}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-green-200">
          <p className="text-sm text-gray-500">✅ Impresos</p>
          <p className="text-2xl font-bold text-green-600">{stats.impresos}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-gray-300">
          <p className="text-sm text-gray-500">📦 Entregados</p>
          <p className="text-2xl font-bold text-gray-600">{stats.entregados}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-red-200">
          <p className="text-sm text-gray-500">🔴 Urgentes</p>
          <p className="text-2xl font-bold text-red-600">{stats.urgentes}</p>
        </div>
      </div>

      {/* Filtros */}
      <Card title="🔍 Filtros">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltroEstado('todos')}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  filtroEstado === 'todos' ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {['pendiente', 'proceso', 'impreso', 'entregado'].map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado as EstadoType)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    filtroEstado === estado ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {getEstadoIcon(estado as EstadoType)} {estado}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroPrioridad('todas')}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  filtroPrioridad === 'todas' ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltroPrioridad('urgente')}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  filtroPrioridad === 'urgente' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🔴 Urgente
              </button>
              <button
                onClick={() => setFiltroPrioridad('media')}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  filtroPrioridad === 'media' ? 'bg-yellow-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🟡 Media
              </button>
              <button
                onClick={() => setFiltroPrioridad('baja')}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  filtroPrioridad === 'baja' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🟢 Baja
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de pedidos */}
      <Card title={`📋 Pedidos (${pedidosFiltrados.length})`}>
        {pedidosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No hay pedidos con estos filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diseñador</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrega</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archivos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pedidosFiltrados.map((pedido, index) => (
                  <tr key={pedido.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{pedido.nombre}</div>
                      {pedido.comentario_general && (
                        <div className="text-xs text-gray-400 truncate max-w-xs">
                          💬 {pedido.comentario_general}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{pedido.disenador_nombre || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(pedido.fecha_entrega).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(pedido.prioridad)}`}>
                        {pedido.prioridad}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(pedido.estado)}`}>
                        {getEstadoIcon(pedido.estado)} {pedido.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-center">
                      {pedido.total_archivos || 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <select
                          value={pedido.estado}
                          onChange={(e) => cambiarEstado(pedido.id, e.target.value as EstadoType)}
                          className={`text-xs px-2 py-1 rounded border ${getEstadoColor(pedido.estado)} focus:outline-none`}
                        >
                          <option value="pendiente">⏳ Pendiente</option>
                          <option value="proceso">🖨️ Proceso</option>
                          <option value="impreso">✅ Impreso</option>
                          <option value="entregado">📦 Entregado</option>
                        </select>
                        
                        <button
                          onClick={() => navigate(`/operador/pedido/${pedido.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1"
                          title="Ver detalles"
                        >
                          👁️
                        </button>
                      </div>
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

export default DashboardOperador;