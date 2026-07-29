// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const mostrarNotificacion = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const ejecutarLogin = async () => {
    if (!email || !email.trim()) {
      mostrarNotificacion('warning', '⚠️ Por favor, ingresa tu correo electrónico');
      return;
    }

    if (!password || password.length < 6) {
      mostrarNotificacion('warning', '⚠️ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      const user = await login(email, password);
      mostrarNotificacion('success', `✅ ¡Bienvenido ${user.nombre}!`);
      
      setTimeout(() => {
        if (user.rol === 'operador') {
          navigate('/operador/dashboard');
        } else if (user.rol === 'disenador') {
          navigate('/disenador/dashboard');
        } else if (user.rol === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 1000);
      
    } catch (error: any) {
      if (error.response?.status === 403) {
        const mensaje = error.response?.data?.message || '';
        
        if (mensaje.includes('pendiente de aprobación')) {
          mostrarNotificacion('warning', '⏳ Tu cuenta está pendiente de aprobación por el administrador');
        } else if (mensaje.includes('rechazada')) {
          mostrarNotificacion('error', '❌ Tu cuenta ha sido rechazada. Contacta al administrador.');
        } else if (mensaje.includes('dispositivo necesita autorización')) {
          const dispositivo = error.response?.data?.dispositivo;
          const nombreDispositivo = dispositivo?.nombre || 'Desconocido';
          mostrarNotificacion('warning', 
            `📱 Nuevo dispositivo detectado: "${nombreDispositivo}"\n⏳ Espera la autorización del administrador`
          );
        } else {
          mostrarNotificacion('warning', '⏳ No tienes permisos para acceder');
        }
      } else if (error.response?.status === 401) {
        mostrarNotificacion('error', '❌ Correo electrónico o contraseña incorrectos');
      } else if (error.response?.status === 404) {
        mostrarNotificacion('error', '❌ Servidor no disponible. Intenta más tarde.');
      } else if (error.code === 'ERR_NETWORK') {
        mostrarNotificacion('error', '❌ Error de conexión. Verifica tu internet.');
      } else {
        mostrarNotificacion('error', error.userMessage || '❌ Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      ejecutarLogin();
    }
  };

  const handleClick = async () => {
    ejecutarLogin();
  };

  const getNotificationStyles = () => {
    if (!notification) return '';
    const styles = {
      success: 'bg-green-600 border-l-4 border-green-800',
      error: 'bg-red-600 border-l-4 border-red-800',
      warning: 'bg-yellow-600 border-l-4 border-yellow-800',
      info: 'bg-blue-600 border-l-4 border-blue-800',
    };
    return styles[notification.type as keyof typeof styles] || styles.info;
  };

  const getNotificationIcon = () => {
    if (!notification) return '';
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[notification.type as keyof typeof icons] || 'ℹ️';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md p-4 rounded-xl shadow-2xl text-white font-medium animate-slide-down ${getNotificationStyles()}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getNotificationIcon()}</span>
            <span className="whitespace-pre-line">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🖨️</div>
          <h1 className="text-3xl font-bold text-primary-900">RL-Multiservicios</h1>
          <p className="text-gray-500 mt-1">Sistema de Optimización de Gigantografías</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="ejemplo@empresa.com"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-center text-xs text-gray-500 border border-gray-200">
            <p className="font-semibold text-gray-700">🔑 Credenciales de prueba:</p>
            <p>🎨 Diseñador: <strong>disenador@test.com</strong> / <strong>password123</strong></p>
            <p>🖨️ Operador: <strong>operador@test.com</strong> / <strong>password123</strong></p>
            <p>👑 Admin: <strong>admin@test.com</strong> / <strong>password123</strong></p>
            <p className="text-gray-400 mt-1">💡 Copia y pega las credenciales para probar</p>
          </div>

          <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Cargando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('');
              setPassword('');
              mostrarNotificacion('info', '🧹 Campos limpiados');
            }}
            className="w-full text-gray-400 hover:text-gray-600 text-sm transition"
          >
            Limpiar campos
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;