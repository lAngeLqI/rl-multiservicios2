// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { 
    obtenerHuellaDispositivo, 
    obtenerNombreDispositivo,
    obtenerSO,
    obtenerNavegador,
    obtenerIP
} from '../services/dispositivoService';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'disenador' | 'operador' | 'admin';
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Usuario>;
  logout: () => void;
  isAuthenticated: boolean;
  isDisenador: boolean;
  isOperador: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData: Usuario = JSON.parse(storedUser);
          if (userData && userData.id) {
            setUser(userData);
          } else {
            throw new Error('Usuario inválido en storage');
          }
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<Usuario> => {
    try {
      const huella = obtenerHuellaDispositivo();
      const nombreDispositivo = obtenerNombreDispositivo();
      const sistemaOperativo = obtenerSO();
      const navegador = obtenerNavegador();
      const ip = await obtenerIP();

      const dispositivoData = {
        huella,
        nombreDispositivo,
        sistemaOperativo,
        navegador,
        ip
      };

      const response = await authService.login(email, password, dispositivoData);

      if (!response || !response.user || !response.token) {
        throw new Error('Respuesta del servidor inválida');
      }

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('dispositivo_autorizado', String(response.dispositivoAutorizado || false));
      localStorage.setItem('huella_dispositivo', huella);

      setUser(response.user);

      return response.user;

    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('dispositivo_autorizado');
    localStorage.removeItem('huella_dispositivo');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isDisenador: user?.rol === 'disenador',
    isOperador: user?.rol === 'operador',
    isAdmin: user?.rol === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
};