// src/pages/disenador/DetallePedidoDisenador.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pedidoService } from '../../services/pedidoService';
import { archivoService } from '../../services/archivoService';
import { useNotification } from '../../context/NotificationContext';
import { useSocket } from '../../hooks/useSocket';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FilePreviewModal from '../../components/common/FilePreviewModal';

interface Archivo {
  id: number;
  nombre_original: string;
  nombre_guardado: string;
  tamaño_mb: number;
  tipo: string;
  estado: 'pendiente' | 'procesando' | 'listo' | 'error';
  created_at: string;
}

interface PedidoDetalle {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_entrega: string;
  prioridad: 'urgente' | 'media' | 'baja';
  comentario_general?: string;
  estado: 'pendiente' | 'proceso' | 'impreso' | 'entregado';
  disenador_nombre?: string;
  operador_nombre?: string;
  archivos: Archivo[];
  created_at: string;
  updated_at: string;
}

type EstadoType = PedidoDetalle['estado'];

const DetallePedidoDisenador: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { on, off } = useSocket();
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [descargando, setDescargando] = useState<number | null>(null);
  const [previewFile, setPreviewFile] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (id) {
      cargarDetalle(parseInt(id));
    }

    const handleEstadoCambiado = () => {
      if (id) {
        cargarDetalle(parseInt(id));
      }
    };

    on('estado-cambiado', handleEstadoCambiado);

    return () => {
      off('estado-cambiado', handleEstadoCambiado);
    };
  }, [id]);

  const cargarDetalle = async (pedidoId: number) => {
    setLoading(true);
    try {
      const data = await pedidoService.getPedidoById(pedidoId);
      setPedido(data);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      showNotification('error', 'Error al cargar los detalles del pedido');
      navigate('/disenador/mis-pedidos');
    } finally {
      setLoading(false);
    }
  };

  const descargarArchivo = async (archivo: Archivo) => {
    try {
      setDescargando(archivo.id);
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
      console.error('Error al descargar archivo:', error);
      showNotification('error', 'Error al descargar el archivo');
    } finally {
      setDescargando(null);
    }
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

  const getEstadoTexto = (estado: EstadoType) => {
    const textos = {
      pendiente: 'Pendiente de revisión',
      proceso: 'En proceso de impresión',
      impreso: 'Impreso y listo',
      entregado: 'Entregado al cliente',
    };
    return textos[estado] || estado;
  };

  const getPrioridadColor = (prioridad: string) => {
    const colors = {
      urgente: 'bg-red-500 text-white',
      media: 'bg-yellow-500 text-white',
      baja: 'bg-green-500 text-white',
    };
    return colors[prioridad as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getPrioridadIcon = (prioridad: string) => {
    const icons = {
      urgente: '🔴',
      media: '🟡',
      baja: '🟢',
    };
    return icons[prioridad as keyof typeof icons] || '⚪';
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatearTamaño = (tamaño: any): string => {
    const num = typeof tamaño === 'number' ? tamaño : parseFloat(tamaño);
    if (isNaN(num)) return '0.0';
    return num.toFixed(1);
  };

  // Calcular peso total
  const pesoTotal = pedido?.archivos?.reduce((acc, archivo) => {
    const num = typeof archivo.tamaño_mb === 'number' ? archivo.tamaño_mb : parseFloat(archivo.tamaño_mb as any) || 0;
    return acc + num;
  }, 0) || 0;

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
          onClick={() => navigate('/disenador/mis-pedidos')}
        >
          Volver a mis pedidos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ========== HEADER ========== */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            📋 {pedido.nombre}
          </h1>
          <p className="text-gray-500 mt-1">
            Pedido #{pedido.id} • Creado el {formatearFecha(pedido.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/disenador/mis-pedidos')}
            icon="←"
          >
            Volver
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

      {/* ========== INFORMACIÓN DEL PEDIDO ========== */}
      <Card title="📝 Información del Pedido">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Estado actual</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(pedido.estado)}`}>
                {getEstadoIcon(pedido.estado)} {getEstadoTexto(pedido.estado)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Prioridad</p>
            <span className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block ${getPrioridadColor(pedido.prioridad)}`}>
              {getPrioridadIcon(pedido.prioridad)} {pedido.prioridad}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de entrega</p>
            <p className="font-medium">{formatearFecha(pedido.fecha_entrega)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Operador asignado</p>
            <p className="font-medium">{pedido.operador_nombre || 'Sin asignar'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Archivos</p>
            <p className="font-medium">{pedido.archivos?.length || 0} archivo(s)</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Peso total</p>
            <p className="font-medium">{pesoTotal.toFixed(1)} MB</p>
          </div>
        </div>

        {pedido.comentario_general && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">💬 Instrucciones del Diseñador</p>
            <p className="mt-1">{pedido.comentario_general}</p>
          </div>
        )}
      </Card>

      {/* ========== LÍNEA DE TIEMPO ========== */}
      <Card title="🔄 Progreso del pedido">
        <div className="relative">
          <div className="flex items-center justify-between">
            {['pendiente', 'proceso', 'impreso', 'entregado'].map((estado, index) => {
              const estadoActual = estado as EstadoType;
              const isActive = pedido.estado === estadoActual;
              const isCompleted = ['pendiente', 'proceso', 'impreso', 'entregado'].indexOf(pedido.estado) >= index;
              
              return (
                <React.Fragment key={estado}>
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                          : isActive
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 animate-pulse'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {estado === 'pendiente' && '⏳ Pendiente'}
                      {estado === 'proceso' && '🖨️ Proceso'}
                      {estado === 'impreso' && '✅ Impreso'}
                      {estado === 'entregado' && '📦 Entregado'}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      ['pendiente', 'proceso', 'impreso', 'entregado'].indexOf(pedido.estado) > index
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          {pedido.estado === 'pendiente' && '⏳ Tu pedido está esperando ser revisado por el operador.'}
          {pedido.estado === 'proceso' && '🖨️ Tu pedido está siendo procesado para impresión.'}
          {pedido.estado === 'impreso' && '✅ Tu pedido ya fue impreso y está listo.'}
          {pedido.estado === 'entregado' && '📦 Tu pedido fue entregado exitosamente.'}
        </p>
      </Card>

      {/* ========== LISTA DE ARCHIVOS ========== */}
      <Card title="📎 Archivos adjuntos">
        {pedido.archivos && pedido.archivos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamaño</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pedido.archivos.map((archivo, index) => {
                  const extension = archivo.nombre_original.split('.').pop()?.toLowerCase();
                  const icon = extension === 'tiff' || extension === 'tif' ? '🖼️' :
                              extension === 'psd' ? '🎨' :
                              extension === 'ai' ? '📐' :
                              extension === 'pdf' ? '📕' : '📄';

                  return (
                    <tr key={archivo.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{icon}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {archivo.nombre_original}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatearTamaño(archivo.tamaño_mb)} MB
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {archivo.tipo?.split('/').pop() || extension || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatearFecha(archivo.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* BOTÓN DE VISTA PREVIA */}
                          <button
                            onClick={() => setPreviewFile({
                              id: archivo.id,
                              name: archivo.nombre_original
                            })}
                            className="text-green-600 hover:text-green-800 text-sm flex items-center gap-1 font-medium"
                            title="Vista previa rápida"
                          >
                            👁️ Ver
                          </button>
                          {/* BOTÓN DE DESCARGA */}
                          <button
                            onClick={() => descargarArchivo(archivo)}
                            disabled={descargando === archivo.id}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 font-medium disabled:opacity-50"
                            title="Descargar archivo"
                          >
                            {descargando === archivo.id ? (
                              <>
                                <span className="animate-spin">⏳</span>
                                Descargando...
                              </>
                            ) : (
                              '📥 Descargar'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No hay archivos en este pedido</p>
        )}
      </Card>

      {/* ========== HISTORIAL ========== */}
      <Card title="📜 Historial del pedido">
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span>📤 Pedido creado</span>
            <span>{formatearFecha(pedido.created_at)}</span>
          </div>
          {pedido.updated_at && pedido.updated_at !== pedido.created_at && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span>🔄 Última actualización</span>
              <span>{formatearFecha(pedido.updated_at)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span>📊 Estado actual</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pedido.estado)}`}>
              {getEstadoIcon(pedido.estado)} {getEstadoTexto(pedido.estado)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span>📎 Archivos</span>
            <span>{pedido.archivos?.length || 0} archivo(s)</span>
          </div>
          <div className="flex justify-between py-2">
            <span>📦 Peso total</span>
            <span>{pesoTotal.toFixed(1)} MB</span>
          </div>
        </div>
      </Card>

      {/* ========== ACCIONES ========== */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={() => navigate('/disenador/nuevo-pedido')}
          icon="📤"
        >
          Crear nuevo pedido
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/disenador/mis-pedidos')}
        >
          Volver a mis pedidos
        </Button>
      </div>

      {/* ========== MODAL DE VISTA PREVIA ========== */}
      {previewFile && (
        <FilePreviewModal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          fileId={previewFile.id}
          fileName={previewFile.name}
        />
      )}
    </div>
  );
};

export default DetallePedidoDisenador;