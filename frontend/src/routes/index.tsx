// src/routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout';
import LayoutAdmin from '../pages/admin/LayoutAdmin';  // ← NUEVO

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Diseñador Pages
import NuevoPedido from '../pages/disenador/NuevoPedido';
import MisPedidosPage from '../pages/disenador/MisPedidosPage';
import DashboardDisenador from '../pages/disenador/DashboardDisenador';
import DetallePedidoDisenador from '../pages/disenador/DetallePedidoDisenador';

// Operador Pages
import DashboardOperador from '../pages/operador/DashboardOperador';
import GestionPedidosPage from '../pages/operador/GestionPedidosPage';
import DetallePedido from '../pages/operador/DetallePedido';

// Admin Pages
import DashboardAdmin from '../pages/admin/DashboardAdmin';  // ← NUEVO
import GestionUsuarios from '../pages/admin/GestionUsuarios';  // ← NUEVO
import GestionDispositivos from '../pages/admin/GestionDispositivos';  // ← NUEVO

// Shared Pages
import NotFound from '../pages/shared/NotFound';
import Unauthorized from '../pages/shared/Unauthorized';

// Private Route Component
import PrivateRoute from './PrivateRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  // ========== RUTAS PRIVADAS ==========
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      // ========== DISEÑADOR ROUTES ==========
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/disenador/dashboard',
            element: <PrivateRoute rol="disenador" />,
            children: [{ index: true, element: <DashboardDisenador /> }],
          },
          {
            path: '/disenador/nuevo-pedido',
            element: <PrivateRoute rol="disenador" />,
            children: [{ index: true, element: <NuevoPedido /> }],
          },
          {
            path: '/disenador/mis-pedidos',
            element: <PrivateRoute rol="disenador" />,
            children: [{ index: true, element: <MisPedidosPage /> }],
          },
          {
            path: '/disenador/pedido/:id',
            element: <PrivateRoute rol="disenador" />,
            children: [{ index: true, element: <DetallePedidoDisenador /> }],
          },
        ],
      },
      // ========== OPERADOR ROUTES ==========
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/operador/dashboard',
            element: <PrivateRoute rol="operador" />,
            children: [{ index: true, element: <DashboardOperador /> }],
          },
          {
            path: '/operador/pedidos',
            element: <PrivateRoute rol="operador" />,
            children: [{ index: true, element: <GestionPedidosPage /> }],
          },
          {
            path: '/operador/pedido/:id',
            element: <PrivateRoute rol="operador" />,
            children: [{ index: true, element: <DetallePedido /> }],
          },
        ],
      },
      // ========== ADMIN ROUTES ==========
      {
        element: <LayoutAdmin />,
        children: [
          {
            path: '/admin/dashboard',
            element: <PrivateRoute rol="admin" />,
            children: [{ index: true, element: <DashboardAdmin /> }],
          },
          {
            path: '/admin/usuarios',
            element: <PrivateRoute rol="admin" />,
            children: [{ index: true, element: <GestionUsuarios /> }],
          },
          {
            path: '/admin/dispositivos',
            element: <PrivateRoute rol="admin" />,
            children: [{ index: true, element: <GestionDispositivos /> }],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;