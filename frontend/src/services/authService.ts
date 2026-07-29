// src/services/authService.ts
import api from './api';

interface DispositivoData {
    huella: string;
    nombreDispositivo: string;
    sistemaOperativo: string;
    navegador: string;
    ip: string;
}

export const authService = {
  login: async (email: string, password: string, dispositivo?: DispositivoData) => {
    try {
      const response = await api.post('/auth/login', { 
        email, 
        password,
        dispositivo: dispositivo || null
      });

      if (response.data && response.data.data && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data.data;
      } else {
        throw new Error('Respuesta del servidor inválida');
      }

    } catch (error: any) {
      throw error;
    }
  },

  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('dispositivo_autorizado');
    localStorage.removeItem('huella_dispositivo');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  verifyToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const response = await api.get('/auth/verify');
      return response.data.data;
    } catch {
      return null;
    }
  }
};