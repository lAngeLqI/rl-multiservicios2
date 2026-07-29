// src/services/pedidoService.ts
import api from './api';

export const pedidoService = {
  // ========== CREAR PEDIDO (con archivos) ==========
  createPedido: async (formData: FormData, onProgress?: (progress: number) => void) => {
    const response = await api.post('/pedidos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return response.data;
  },

  // ========== OBTENER PEDIDOS DEL DISEÑADOR ==========
  getPedidosByDisenador: async (disenadorId: number) => {
    const response = await api.get(`/pedidos/disenador/${disenadorId}`);
    return response.data.data;
  },

  // ========== OBTENER PEDIDO POR ID ==========
  getPedidoById: async (id: number) => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data.data;
  },

  // ========== OBTENER TODOS LOS PEDIDOS (Operador) ==========
  getPedidos: async (page = 1, limit = 10, filters?: any) => {
    const response = await api.get('/pedidos', {
      params: { page, limit, ...filters },
    });
    return response.data.data;
  },

  // ========== CAMBIAR ESTADO DEL PEDIDO ==========
  cambiarEstado: async (id: number, estado: string) => {
    const response = await api.patch(`/pedidos/${id}/estado`, { estado });
    return response.data;
  },

  // ========== APROBAR PEDIDO ==========
  aprobarPedido: async (id: number) => {
    const response = await api.post(`/pedidos/${id}/aprobar`);
    return response.data;
  },

  // ========== OBTENER ESTADÍSTICAS ==========
  getStats: async () => {
    const response = await api.get('/pedidos/stats');
    return response.data.data;
  },
};