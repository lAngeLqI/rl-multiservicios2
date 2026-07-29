// src/routes/authRoutes.ts
import { Router } from 'express';
import { login, register, verify } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/verify', verifyToken, verify);

export default router;  // ← Asegurar que existe