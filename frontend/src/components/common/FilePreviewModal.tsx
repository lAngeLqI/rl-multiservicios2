// src/components/common/FilePreviewModal.tsx
import React, { useState, useEffect } from 'react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: number;
  fileName: string;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  fileId,
  fileName,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // ❌ ELIMINADO: const [fileSize, setFileSize] = useState<number>(0);

  useEffect(() => {
    if (isOpen && fileId) {
      setLoading(true);
      setError(null);
      setImageUrl(null);
      
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
      
      fetch(`${baseUrl}/archivos/${fileId}/preview?size=medium`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        console.log('📡 Status:', res.status);
        if (!res.ok) {
          return res.text().then(text => { 
            console.error('❌ Error response:', text);
            throw new Error(`Error ${res.status}: ${text}`);
          });
        }
        return res.blob();
      })
      .then(blob => {
        
        // ❌ ELIMINADO: setFileSize(blob.size);
        
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setLoading(false);
      })
      .catch(err => {
      
        setError(err.message || 'Error al cargar la vista previa');
        setLoading(false);
      });
    }
  }, [isOpen, fileId]);

  // Limpiar URL al cerrar
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">👁️</span>
            <h3 className="text-lg font-semibold text-gray-800 truncate max-w-md">
              {fileName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-500">Generando previsualización...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">❌ {error}</p>
              <p className="text-gray-400 mt-2">No se pudo cargar la vista previa del archivo</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  const token = localStorage.getItem('token');
                  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
                  fetch(`${baseUrl}/archivos/${fileId}/preview?size=medium`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  })
                  .then(res => res.blob())
                  .then(blob => {
                    const url = URL.createObjectURL(blob);
                    setImageUrl(url);
                    setLoading(false);
                  })
                  .catch(err => {
                    setError(err.message);
                    setLoading(false);
                  });
                }}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Reintentar
              </button>
            </div>
          ) : imageUrl ? (
            <div>
              <div className="flex justify-center">
                <img
                  src={imageUrl}
                  alt={fileName}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={() => {
                   
                    setError('Error al renderizar la imagen');
                  }}
                />
              </div>
              <div className="mt-4 text-center border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">
                  ⚡ Vista previa generada automáticamente
                </p>
                <p className="text-xs text-gray-400">
                  💡 Usa el botón "Descargar" para obtener el archivo original
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No se pudo cargar la vista previa</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;