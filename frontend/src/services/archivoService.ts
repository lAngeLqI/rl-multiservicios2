// src/services/archivoService.ts
import api from './api';

export const archivoService = {
  // 🔥 DESCARGAR ARCHIVO (para descarga)
  downloadArchivo: async (id: number) => {
    const response = await api.get(`/archivos/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // 🔥 OBTENER URL DE PREVISUALIZACIÓN (para visualización en navegador)
  getPreviewUrl: (id: number): string => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    return `${baseUrl}/archivos/${id}/preview?token=${token}`;
  },

  // Obtener archivos de un pedido
  getArchivosByPedido: async (pedidoId: number) => {
    const response = await api.get(`/archivos/pedido/${pedidoId}`);
    return response.data.data;
  },

  // Eliminar archivo
  deleteArchivo: async (id: number) => {
    const response = await api.delete(`/archivos/${id}`);
    return response.data;
  },
};