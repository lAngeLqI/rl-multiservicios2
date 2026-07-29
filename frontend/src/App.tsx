// src/App.tsx
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { router } from './routes';

import './index.css';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        
        <RouterProvider router={router} />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;