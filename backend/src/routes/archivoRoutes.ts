// src/routes/archivoRoutes.ts
import { Router } from 'express';
import { 
    downloadArchivo, 
    getArchivosByPedido, 
    deleteArchivo,
    previewArchivo  // ← IMPORTADO
} from '../controllers/archivoController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener archivos de un pedido
router.get('/pedido/:pedidoId', getArchivosByPedido);

// 🔥 RUTA DE PREVISUALIZACIÓN (DEBE ESTAR ANTES DE /:id/download)
router.get('/:id/preview', previewArchivo);

// Descargar archivo
router.get('/:id/download', downloadArchivo);

// Eliminar archivo
router.delete('/:id', deleteArchivo);

export default router;