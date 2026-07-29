// src/pages/operador/GestionPedidosPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { pedidoService } from '../../services/pedidoService';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Pedido {
  id: number;
  nombre: string;
  fecha_entrega: string;
  prioridad: 'urgente' | 'media' | 'baja';
  comentario_general?: string;
  estado: 'pendiente' | 'proceso' | 'impreso' | 'entregado';
  disenador_nombre?: string;
  total_archivos: number;
  archivos?: Array<{ nombre_original: string }>;
  created_at: string;
}

type EstadoType = Pedido['estado'];

// Lista de diseñadores para checkbox
const DISENADORES = ['Carlos Diseñador', 'María Operadora', 'Luis Pérez', 'Ana Gómez'];

const GestionPedidosPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<EstadoType | 'todos'>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<'todas' | 'urgente' | 'media' | 'baja'>('todas');
  
  // 🔍 Búsqueda avanzada
  const [busquedaArchivo, setBusquedaArchivo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [disenadoresSeleccionados, setDisenadoresSeleccionados] = useState<string[]>([]);

  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const response = await pedidoService.getPedidos(1, 100);
      const items = response.items || [];
      setPedidos(items);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      showNotification('error', 'Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  // ========== FILTROS ==========
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(pedido => {
      // Filtro por estado
      if (filtroEstado !== 'todos' && pedido.estado !== filtroEstado) return false;
      
      // Filtro por prioridad
      if (filtroPrioridad !== 'todas' && pedido.prioridad !== filtroPrioridad) return false;

      // Filtro por fecha
      if (fechaInicio && pedido.fecha_entrega < fechaInicio) return false;
      if (fechaFin && pedido.fecha_entrega > fechaFin) return false;

      // Filtro por diseñador
      if (disenadoresSeleccionados.length > 0) {
        if (!pedido.disenador_nombre) return false;
        if (!disenadoresSeleccionados.includes(pedido.disenador_nombre)) return false;
      }

      // Filtro por nombre de archivo
      if (busquedaArchivo.trim()) {
        const termino = busquedaArchivo.toLowerCase().trim();
        const tieneArchivo = pedido.archivos?.some(archivo => 
          archivo.nombre_original.toLowerCase().includes(termino)
        );
        if (!tieneArchivo) return false;
      }

      return true;
    });
  }, [pedidos, filtroEstado, filtroPrioridad, fechaInicio, fechaFin, disenadoresSeleccionados, busquedaArchivo]);

  // ========== MANEJADORES ==========
  const cambiarEstado = async (id: number, nuevoEstado: EstadoType) => {
    try {
      await pedidoService.cambiarEstado(id, nuevoEstado);
      showNotification('success', `✅ Estado actualizado a "${nuevoEstado}"`);
      cargarPedidos();
    } catch (error: any) {
      showNotification('error', error.userMessage || 'Error al cambiar estado');
    }
  };

  const toggleDisenador = (nombre: string) => {
    setDisenadoresSeleccionados(prev =>
      prev.includes(nombre)
        ? prev.filter(d => d !== nombre)
        : [...prev, nombre]
    );
  };

  const limpiarFiltros = () => {
    setBusquedaArchivo('');
    setFechaInicio('');
    setFechaFin('');
    setDisenadoresSeleccionados([]);
    setFiltroEstado('todos');
    setFiltroPrioridad('todas');
  };

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

  const getPrioridadColor = (prioridad: string) => {
    const colors = {
      urgente: 'bg-red-100 text-red-800',
      media: 'bg-yellow-100 text-yellow-800',
      baja: 'bg-green-100 text-green-800',
    };
    return colors[prioridad as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-800">📋 Gestión de Pedidos</h1>
          <p className="text-gray-500 mt-1">Gestiona todos los pedidos de los diseñadores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={limpiarFiltros} icon="🧹">
            Limpiar filtros
          </Button>
          <Button variant="primary" size="sm" onClick={cargarPedidos} icon="🔄">
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card title="🔍 Búsqueda avanzada">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda por archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📎 Buscar por archivo
            </label>
            <input
              type="text"
              value={busquedaArchivo}
              onChange={(e) => setBusquedaArchivo(e.target.value)}
              placeholder="Ej: banner, logo, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📅 Rango de fechas
            </label>
            <div className="space-y-1">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
              />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Diseñadores */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              👤 Diseñador
            </label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {DISENADORES.map((nombre) => (
                <label key={nombre} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={disenadoresSeleccionados.includes(nombre)}
                    onChange={() => toggleDisenador(nombre)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  {nombre}
                </label>
              ))}
            </div>
          </div>

          {/* Estado y Prioridad */}
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
                  {getEstadoIcon(estado as EstadoType)} {estado}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">
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

        {/* Resultados */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span>📊 <strong>{pedidosFiltrados.length}</strong> pedido(s) encontrado(s)</span>
        </div>
      </Card>

      {/* Tabla de pedidos */}
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

export default GestionPedidosPage;