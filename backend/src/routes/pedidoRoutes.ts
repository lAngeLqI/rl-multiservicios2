// src/routes/pedidoRoutes.ts
import { Router } from 'express';
import { 
    createPedido, 
    getPedidos, 
    getPedidoById,
    getPedidosByDisenador,
    updateEstado,
    aprobarPedido,
    getStats
} from '../controllers/pedidoController.js';
import { verifyToken, verifyRol } from '../middleware/auth.js';
import { uploadMultiple } from '../config/multer.js';

const router = Router();

router.use(verifyToken);

router.get('/stats', verifyRol(['operador', 'admin']), getStats);
router.post('/', verifyRol(['disenador']), uploadMultiple, createPedido);
router.get('/', verifyRol(['operador', 'admin']), getPedidos);
router.get('/disenador/:disenadorId', getPedidosByDisenador);
router.get('/:id', getPedidoById);
router.patch('/:id/estado', verifyRol(['operador', 'admin']), updateEstado);
router.post('/:id/aprobar', verifyRol(['operador', 'admin']), aprobarPedido);

export default router;  // ← Asegurar que existe