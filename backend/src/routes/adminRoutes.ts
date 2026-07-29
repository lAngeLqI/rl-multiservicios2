// src/routes/adminRoutes.ts
import { Router } from 'express';
import { 
    getUsuariosPendientes,
    aprobarUsuario,
    rechazarUsuario,
    getUsuarios,
    getDispositivosPendientes,
    getDispositivos,
    autorizarDispositivo,
    rechazarDispositivo,
    getAdminStats
} from '../controllers/adminController.js';
import { verifyToken, verifyRol } from '../middleware/auth.js';

const router = Router();

// Todas las rutas requieren autenticación y rol admin
router.use(verifyToken);
router.use(verifyRol(['admin']));

// ========== USUARIOS ==========
router.get('/usuarios', getUsuarios);
router.get('/usuarios/pendientes', getUsuariosPendientes);
router.put('/usuarios/:id/aprobar', aprobarUsuario);
router.put('/usuarios/:id/rechazar', rechazarUsuario);

// ========== DISPOSITIVOS ==========
router.get('/dispositivos', getDispositivos);
router.get('/dispositivos/pendientes', getDispositivosPendientes);  // ← DEBE EXISTIR
router.put('/dispositivos/:id/autorizar', autorizarDispositivo);
router.delete('/dispositivos/:id/rechazar', rechazarDispositivo);

// ========== ESTADÍSTICAS ==========
router.get('/stats', getAdminStats);

export default router;