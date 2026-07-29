// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import archivoRoutes from './routes/archivoRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
const uploadDir = process.env['UPLOAD_DIR'] || './uploads';
app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/archivos', archivoRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de salud
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejo de errores global
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor'
    });
});

export default app;