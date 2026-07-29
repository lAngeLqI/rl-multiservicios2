// src/pages/disenador/MisPedidosPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
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
  estado: 'pendiente' | 'proceso' | 'impreso' | 'entregado';
  total_archivos: number;
  created_at: string;
}

type EstadoType = Pedido['estado'];

const MisPedidosPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ========== FILTROS ==========
  // 🔍 Búsqueda por nombre del proyecto
  const [busquedaNombre, setBusquedaNombre] = useState('');
  
  // 📅 Búsqueda por fecha de creación
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  // 📊 Filtro por estado
  const [filtroEstado, setFiltroEstado] = useState<EstadoType | 'todos'>('todos');
  
  // ⚡ Filtro por prioridad
  const [filtroPrioridad, setFiltroPrioridad] = useState<'todas' | 'urgente' | 'media' | 'baja'>('todas');

  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { on, off } = useSocket();

  // Cargar pedidos del diseñador
  const cargarPedidos = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await pedidoService.getPedidosByDisenador(user.id);
      setPedidos(data || []);
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

  // ========== FILTROS AVANZADOS ==========
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(pedido => {
      // 1. Búsqueda por nombre del proyecto
      if (busquedaNombre.trim()) {
        const termino = busquedaNombre.toLowerCase().trim();
        if (!pedido.nombre.toLowerCase().includes(termino)) return false;
      }

      // 2. Filtro por fecha de creación
      if (fechaInicio && pedido.created_at < fechaInicio) return false;
      if (fechaFin && pedido.created_at > fechaFin) return false;

      // 3. Filtro por estado
      if (filtroEstado !== 'todos' && pedido.estado !== filtroEstado) return false;

      // 4. Filtro por prioridad
      if (filtroPrioridad !== 'todas' && pedido.prioridad !== filtroPrioridad) return false;

      return true;
    });
  }, [pedidos, busquedaNombre, fechaInicio, fechaFin, filtroEstado, filtroPrioridad]);

  // ========== ESTILOS ==========
  const getEstadoColor = (estado: EstadoType) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      proceso: 'bg-blue-100 text-blue-800 border-blue-200',
      impreso: 'bg-green-100 text-green-800 border-green-200',
      entregado: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoIcon = (estado: EstadoType) => {
    const icons = {
      pendiente: '⏳',
      proceso: '🖨️',
      impreso: '✅',
      entregado: '📦',
    };
    return icons[estado] || '📌';
  };

  const getEstadoTexto = (estado: EstadoType) => {
    const textos = {
      pendiente: 'Pendiente',
      proceso: 'En impresión',
      impreso: 'Impreso',
      entregado: 'Entregado',
    };
    return textos[estado] || estado;
  };

  const getPrioridadColor = (prioridad: string) => {
    const colors = {
      urgente: 'bg-red-100 text-red-800',
      media: 'bg-yellow-100 text-yellow-800',
      baja: 'bg-green-100 text-green-800',
    };
    return colors[prioridad as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // ========== MANEJADORES ==========
  const limpiarFiltros = () => {
    setBusquedaNombre('');
    setFechaInicio('');
    setFechaFin('');
    setFiltroEstado('todos');
    setFiltroPrioridad('todas');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📋 Mis Pedidos</h1>
          <p className="text-gray-500 mt-1">
            {pedidos.length === 0 
              ? 'Aún no tienes pedidos' 
              : `Tienes ${pedidos.length} pedido(s)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={limpiarFiltros}
            icon="🧹"
          >
            Limpiar filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={cargarPedidos}
            icon="🔄"
          >
            Actualizar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/disenador/nuevo-pedido')}
            icon="📤"
          >
            Nuevo Pedido
          </Button>
        </div>
      </div>

      {/* ========== FILTROS AVANZADOS ========== */}
      <Card title="🔍 Buscar pedidos">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. BÚSQUEDA POR NOMBRE DEL PROYECTO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 Nombre del proyecto
            </label>
            <input
              type="text"
              value={busquedaNombre}
              onChange={(e) => setBusquedaNombre(e.target.value)}
              placeholder="Ej: Banner, Logo, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-gray-400 mt-1">
              Busca por nombre del pedido
            </p>
          </div>

          {/* 2. BÚSQUEDA POR FECHA DE CREACIÓN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 Fecha de creación
            </label>
            <div className="space-y-1">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                placeholder="Desde"
              />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
                placeholder="Hasta"
              />
            </div>
          </div>

          {/* 3. FILTRO POR ESTADO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📊 Estado
            </label>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setFiltroEstado('todos')}
                className={`px-2 py-1 rounded-full text-xs transition ${
                  filtroEstado === 'todos' ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {['pendiente', 'proceso', 'impreso', 'entregado'].map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado as EstadoType)}
                  className={`px-2 py-1 rounded-full text-xs transition ${
                    filtroEstado === estado ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {getEstadoIcon(estado as EstadoType)} {getEstadoTexto(estado as EstadoType)}
                </button>
              ))}
            </div>
          </div>

          {/* 4. FILTRO POR PRIORIDAD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ⚡ Prioridad
            </label>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setFiltroPrioridad('todas')}
                className={`px-2 py-1 rounded-full text-xs transition ${
                  filtroPrioridad === 'todas' ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltroPrioridad('urgente')}
                className={`px-2 py-1 rounded-full text-xs transition ${
                  filtroPrioridad === 'urgente' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🔴 Urgente
              </button>
              <button
                onClick={() => setFiltroPrioridad('media')}
                className={`px-2 py-1 rounded-full text-xs transition ${
                  filtroPrioridad === 'media' ? 'bg-yellow-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🟡 Media
              </button>
              <button
                onClick={() => setFiltroPrioridad('baja')}
                className={`px-2 py-1 rounded-full text-xs transition ${
                  filtroPrioridad === 'baja' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                🟢 Baja
              </button>
            </div>
          </div>
        </div>

        {/* Resultados de la búsqueda */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm">
            <span>
              📊 <strong>{pedidosFiltrados.length}</strong> pedido(s) encontrado(s)
            </span>
            {busquedaNombre && (
              <span>
                📝 Buscando: <strong>"{busquedaNombre}"</strong>
              </span>
            )}
            {(fechaInicio || fechaFin) && (
              <span>
                📅 Fecha: {fechaInicio || '...'} → {fechaFin || '...'}
              </span>
            )}
            {filtroEstado !== 'todos' && (
              <span>
                📊 Estado: <strong>{getEstadoTexto(filtroEstado)}</strong>
              </span>
            )}
            {filtroPrioridad !== 'todas' && (
              <span>
                ⚡ Prioridad: <strong>{filtroPrioridad}</strong>
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* ========== LISTA DE PEDIDOS ========== */}
      <Card title={`📋 Pedidos (${pedidosFiltrados.length})`}>
        {pedidosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {pedidos.length === 0 
                ? 'Aún no has creado ningún pedido' 
                : 'No hay pedidos que coincidan con los filtros'}
            </p>
            {pedidos.length === 0 && (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/disenador/nuevo-pedido')}
                className="mt-4"
                icon="📤"
              >
                Crear mi primer pedido
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
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
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatearFecha(pedido.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatearFecha(pedido.fecha_entrega)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(pedido.prioridad)}`}>
                        {pedido.prioridad}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(pedido.estado)}`}>
                        {getEstadoIcon(pedido.estado)} {getEstadoTexto(pedido.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-center">
                      {pedido.total_archivos || 0}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/disenador/pedido/${pedido.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        👁️ Ver detalles
                      </button>
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

export default MisPedidosPage;