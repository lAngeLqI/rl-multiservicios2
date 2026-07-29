// src/pages/operador/DetallePedido.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pedidoService } from '../../services/pedidoService';
import { archivoService } from '../../services/archivoService';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface Archivo {
  id: number;
  nombre_original: string;
  nombre_guardado: string;
  ruta: string;
  tamaño_mb: number;
  tipo: string;
  estado: 'pendiente' | 'procesando' | 'listo' | 'error';
  created_at: string;
}

// 🔥 SOLO 4 ESTADOS PARA EL OPERADOR
type EstadoType = 'pendiente' | 'proceso' | 'impreso' | 'entregado';

interface PedidoDetalle {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_entrega: string;
  prioridad: 'urgente' | 'media' | 'baja';
  comentario_general?: string;
  estado: EstadoType;
  disenador_nombre?: string;
  operador_nombre?: string;
  archivos: Archivo[];
  created_at: string;
}

const DetallePedido: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  useEffect(() => {
    if (id) {
      cargarDetallePedido(parseInt(id));
    }
  }, [id]);

  const cargarDetallePedido = async (pedidoId: number) => {
    setLoading(true);
    try {
      
      const data = await pedidoService.getPedidoById(pedidoId);
      
      setPedido(data);
    } catch (error) {
      console.error('❌ Error al cargar detalle:', error);
      showNotification('error', 'Error al cargar los detalles del pedido');
      navigate('/operador/pedidos');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FUNCIÓN PARA CAMBIAR ESTADO (SOLO 4 ESTADOS)
  const cambiarEstado = async (nuevoEstado: EstadoType) => {
    if (!pedido) return;

    setCambiandoEstado(true);
    try {
      await pedidoService.cambiarEstado(pedido.id, nuevoEstado);
      showNotification('success', `✅ Estado actualizado a "${nuevoEstado}"`);
      await cargarDetallePedido(pedido.id);
    } catch (error) {
      
      showNotification('error', 'Error al cambiar el estado');
    } finally {
      setCambiandoEstado(false);
    }
  };

  const descargarArchivo = async (archivo: Archivo) => {
    try {
      const blob = await archivoService.downloadArchivo(archivo.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = archivo.nombre_original;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showNotification('success', `📥 Descargando ${archivo.nombre_original}`);
    } catch (error) {
      
      showNotification('error', 'Error al descargar el archivo');
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

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
      urgente: 'bg-red-500 text-white',
      media: 'bg-yellow-500 text-white',
      baja: 'bg-green-500 text-white',
    };
    return colors[prioridad as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  // 🔥 FUNCIÓN DE SEGURIDAD PARA TAMAÑO
  const formatearTamaño = (tamaño: any): string => {
    const num = typeof tamaño === 'number' ? tamaño : parseFloat(tamaño);
    if (isNaN(num)) return '0.0';
    return num.toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">Pedido no encontrado</p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => navigate('/operador/pedidos')}
        >
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            📋 Pedido #{pedido.id}
          </h1>
          <p className="text-gray-500 mt-1">{pedido.nombre}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/operador/pedidos')}
          icon="←"
        >
          Volver
        </Button>
      </div>

      {/* Información del Pedido */}
      <Card title="📝 Información del Pedido">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(pedido.estado)}`}>
                {getEstadoIcon(pedido.estado)} {pedido.estado}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Prioridad</p>
            <span className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block ${getPrioridadColor(pedido.prioridad)}`}>
              {pedido.prioridad}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Diseñador</p>
            <p className="font-medium">{pedido.disenador_nombre || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de Entrega</p>
            <p className="font-medium">{formatearFecha(pedido.fecha_entrega)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de Creación</p>
            <p className="font-medium">{formatearFecha(pedido.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Archivos</p>
            <p className="font-medium">{pedido.archivos?.length || 0} archivo(s)</p>
          </div>
        </div>

        {pedido.comentario_general && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">💬 Instrucciones del Diseñador</p>
            <p className="mt-1">{pedido.comentario_general}</p>
          </div>
        )}
      </Card>

      {/* 🔥 CAMBIAR ESTADO - SOLO 4 ESTADOS */}
      <Card title="🔄 Cambiar Estado">
        <div className="flex flex-wrap gap-2">
          {['pendiente', 'proceso', 'impreso', 'entregado'].map((estado) => (
            <button
              key={estado}
              onClick={() => cambiarEstado(estado as EstadoType)}
              disabled={cambiandoEstado || pedido.estado === estado}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                pedido.estado === estado
                  ? 'bg-primary-600 text-white cursor-default'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {estado === 'pendiente' && '⏳'}
              {estado === 'proceso' && '🖨️'}
              {estado === 'impreso' && '✅'}
              {estado === 'entregado' && '📦'} {estado}
            </button>
          ))}
        </div>
        {cambiandoEstado && (
          <p className="text-sm text-gray-500 mt-2">⏳ Actualizando estado...</p>
        )}
      </Card>

      {/* Lista de Archivos */}
      <Card title="📎 Archivos">
        {pedido.archivos && pedido.archivos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamaño</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pedido.archivos.map((archivo, index) => (
                  <tr key={archivo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {archivo.nombre_original}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatearTamaño(archivo.tamaño_mb)} MB
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {archivo.tipo?.split('/').pop() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        archivo.estado === 'listo' ? 'bg-green-100 text-green-800' :
                        archivo.estado === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {archivo.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => descargarArchivo(archivo)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        📥 Descargar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">No hay archivos en este pedido</p>
        )}
      </Card>

      {/* 🔥 ACCIONES - SOLO PARA ESTADOS ESPECÍFICOS */}
      <div className="flex gap-3">
        {pedido.estado === 'impreso' && (
          <Button
            variant="success"
            onClick={() => cambiarEstado('entregado')}
            disabled={cambiandoEstado}
            icon="📦"
          >
            Marcar como Entregado
          </Button>
        )}
        {pedido.estado === 'pendiente' && (
          <Button
            variant="primary"
            onClick={() => cambiarEstado('proceso')}
            disabled={cambiandoEstado}
            icon="🖨️"
          >
            Iniciar Impresión
          </Button>
        )}
        {pedido.estado === 'proceso' && (
          <Button
            variant="primary"
            onClick={() => cambiarEstado('impreso')}
            disabled={cambiandoEstado}
            icon="✅"
          >
            Marcar como Impreso
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => navigate('/operador/pedidos')}
        >
          Volver a la lista
        </Button>
      </div>
    </div>
  );
};

export default DetallePedido;