// src/components/common/GlobalNotification.tsx
import React from 'react';
import { useNotification } from '../../context/NotificationContext';

const GlobalNotification: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md space-y-2 pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`p-4 rounded-xl shadow-2xl text-white pointer-events-auto transition-all duration-300 animate-slide-down ${
            n.type === 'success' ? 'bg-green-600 border-l-4 border-green-800' :
            n.type === 'error' ? 'bg-red-600 border-l-4 border-red-800' :
            n.type === 'warning' ? 'bg-yellow-600 border-l-4 border-yellow-800' :
            'bg-blue-600 border-l-4 border-blue-800'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {n.type === 'success' && '✅'}
                {n.type === 'error' && '❌'}
                {n.type === 'warning' && '⚠️'}
                {n.type === 'info' && 'ℹ️'}
              </span>
              <div>
                <p className="font-medium">{n.message}</p>
                <p className="text-sm opacity-80 mt-1">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-white/80 hover:text-white transition ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GlobalNotification;