// src/pages/disenador/NuevoPedido.tsx
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';  // ← Importación de tipo
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { pedidoService } from '../../services/pedidoService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

type Prioridad = 'urgente' | 'media' | 'baja';

interface ArchivoSubido {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

const NuevoPedido: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad>('media');
  const [comentarioGeneral, setComentarioGeneral] = useState('');
  const [archivos, setArchivos] = useState<ArchivoSubido[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const nuevosArchivos = acceptedFiles.map(file => ({
        file,
        progress: 0,
        status: 'pending' as const,
      }));
      setArchivos(prev => [...prev, ...nuevosArchivos]);
    },
    onDropRejected: (fileRejections: FileRejection[]) => {
      const errores = fileRejections.map((rejection: FileRejection) => {
        const error = rejection.errors[0];
        if (error?.code === 'file-invalid-type') {
          return `${rejection.file.name}: Formato no soportado (solo TIFF, PSD, AI, PDF, PNG, JPG)`;
        }
        if (error?.code === 'file-too-large') {
          return `${rejection.file.name}: Excede los 500MB`;
        }
        return `${rejection.file.name}: ${error?.message || 'Error desconocido'}`;
      });
      showNotification('error', `❌ Errores:\n${errores.join('\n')}`);
    },
    accept: {
      'image/tiff': ['.tiff', '.tif'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
      'application/postscript': ['.psd', '.ai'],
    },
    maxSize: 500 * 1024 * 1024,
    maxFiles: 20,
  });

  const eliminarArchivo = (index: number) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
  };

  const calcularPesoTotal = () => {
    const totalBytes = archivos.reduce((acc, curr) => acc + curr.file.size, 0);
    return (totalBytes / 1024 / 1024).toFixed(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      showNotification('warning', '⚠️ Ingresa un nombre para el pedido');
      return;
    }
    if (!fechaEntrega) {
      showNotification('warning', '⚠️ Selecciona una fecha de entrega');
      return;
    }
    if (archivos.length === 0) {
      showNotification('warning', '⚠️ Sube al menos un archivo');
      return;
    }

    setSubiendo(true);
    setProgreso(0);

    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('fecha_entrega', fechaEntrega);
      formData.append('prioridad', prioridad);
      formData.append('comentario_general', comentarioGeneral);
      formData.append('disenador_id', user?.id?.toString() || '');

      archivos.forEach(({ file }) => {
        formData.append('archivos', file);
      });

      await pedidoService.createPedido(formData, (progress: number) => {
        setProgreso(progress);
      });

      showNotification('success', `✅ Pedido enviado con ${archivos.length} archivo(s)`);
      navigate('/disenador/mis-pedidos');

    } catch (error: any) {
      showNotification('error', error.userMessage || 'Error al enviar el pedido');
    } finally {
      setSubiendo(false);
      setProgreso(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📤 Nuevo Pedido - Gigantografía</h1>
        <p className="text-gray-500 mt-1">Completa el formulario y sube tus archivos en segundos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="📝 Información del Pedido">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Pedido *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="Ej: Banner Publicitario - MegaPlaza"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega *</label>
              <input
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad *</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'urgente' as Prioridad, label: '🔴 Urgente', color: 'red' },
                  { value: 'media' as Prioridad, label: '🟡 Media', color: 'yellow' },
                  { value: 'baja' as Prioridad, label: '🟢 Baja', color: 'green' },
                ].map(({ value, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPrioridad(value)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      prioridad === value
                        ? `bg-${color}-500 text-white shadow-lg shadow-${color}-200 scale-105`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💬 Instrucciones para el Operador <span className="text-xs text-gray-400 ml-2">(Opcional)</span>
              </label>
              <textarea
                value={comentarioGeneral}
                onChange={(e) => setComentarioGeneral(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Ej: Los archivos están en CMYK, 300 DPI. La impresión debe ser en vinilo mate..."
              />
              <p className="text-xs text-gray-400 mt-1">📌 Este comentario aplica para TODOS los archivos del pedido</p>
            </div>
          </div>
        </Card>

        <Card title="📎 Archivos">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <div className="text-5xl">📁</div>
              <p className="text-gray-600 font-medium">
                {isDragActive ? '📥 Suelta los archivos aquí' : 'Arrastra o haz clic para subir archivos'}
              </p>
              <p className="text-sm text-gray-400">Formatos: TIFF, PSD, AI, PDF, PNG, JPG | Máx. 500MB</p>
              <div className="flex justify-center gap-4 text-xs text-gray-400">
                <span>✅ Alta calidad</span>
                <span>✅ Sin compresión</span>
                <span>✅ CMYK</span>
              </div>
            </div>
          </div>

          {archivos.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-gray-700">
                  📎 {archivos.length} archivo(s) <span className="text-sm text-gray-400 ml-2">({calcularPesoTotal()} MB)</span>
                </span>
                <button type="button" onClick={() => setArchivos([])} className="text-sm text-red-500 hover:text-red-700" disabled={subiendo}>
                  🗑️ Eliminar todos
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {archivos.map((archivo, index) => {
                  const extension = archivo.file.name.split('.').pop()?.toLowerCase();
                  const icon = extension === 'tiff' || extension === 'tif' ? '🖼️' :
                              extension === 'psd' ? '🎨' :
                              extension === 'ai' ? '📐' :
                              extension === 'pdf' ? '📕' : '📄';

                  return (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-2xl">{icon}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{archivo.file.name}</p>
                          <p className="text-xs text-gray-400">{(archivo.file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => eliminarArchivo(index)} className="text-gray-400 hover:text-red-500 transition p-1" disabled={subiendo}>
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {subiendo && (
          <div className="bg-white rounded-xl shadow p-6 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>📤 Subiendo pedido...</span>
              <span>{progreso}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progreso}%` }} />
            </div>
            <p className="text-xs text-gray-400 text-center">{archivos.length} archivo(s) en proceso de subida</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" size="lg" loading={subiendo} disabled={archivos.length === 0 || subiendo} className="flex-1" icon="🚀">
            {subiendo ? 'Subiendo pedido...' : 'Enviar Pedido al Operador'}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate('/disenador/mis-pedidos')}>
            Cancelar
          </Button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-700 flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              <strong>Formato recomendado:</strong> Usa archivos TIFF sin compresión, en modo CMYK y a 300 DPI para garantizar la mejor calidad en la impresión de gigantografías.
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default NuevoPedido;