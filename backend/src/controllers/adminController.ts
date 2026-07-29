// src/controllers/adminController.ts
import { Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

// ========== OBTENER USUARIOS PENDIENTES ==========
export const getUsuariosPendientes = async (_req: AuthRequest, res: Response) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, nombre, email, rol, telefono, empresa, created_at 
             FROM usuarios 
             WHERE estado = 'pendiente' 
             ORDER BY created_at ASC`
        ) as any;

        return res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error en getUsuariosPendientes:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios pendientes'
        });
    }
};

// ========== APROBAR USUARIO ==========
export const aprobarUsuario = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT id, nombre, email, rol FROM usuarios WHERE id = ? AND estado = "pendiente"',
            [id]
        ) as any;

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado o ya procesado'
            });
        }

        const usuario = rows[0];

        await pool.query(
            'UPDATE usuarios SET estado = "aprobado" WHERE id = ?',
            [id]
        );

        return res.json({
            success: true,
            message: `✅ Usuario ${usuario.nombre} aprobado correctamente`,
            data: {
                usuario_id: id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });

    } catch (error) {
        console.error('Error en aprobarUsuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al aprobar usuario'
        });
    }
};

// ========== RECHAZAR USUARIO ==========
export const rechazarUsuario = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT id, nombre, email FROM usuarios WHERE id = ? AND estado = "pendiente"',
            [id]
        ) as any;

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado o ya procesado'
            });
        }

        const usuario = rows[0];

        await pool.query(
            'UPDATE usuarios SET estado = "rechazado" WHERE id = ?',
            [id]
        );

        return res.json({
            success: true,
            message: `❌ Usuario ${usuario.nombre} rechazado`,
            data: {
                usuario_id: id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });

    } catch (error) {
        console.error('Error en rechazarUsuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al rechazar usuario'
        });
    }
};

// ========== OBTENER TODOS LOS USUARIOS ==========
export const getUsuarios = async (_req: AuthRequest, res: Response) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, nombre, email, rol, estado, telefono, empresa, created_at 
             FROM usuarios 
             ORDER BY created_at DESC`
        ) as any;

        return res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error en getUsuarios:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        });
    }
};

// ================================================================
// ========== GESTIÓN DE DISPOSITIVOS ==========
// ================================================================

export const getDispositivosPendientes = async (_req: AuthRequest, res: Response) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                d.*, 
                u.nombre as usuario_nombre, 
                u.email as usuario_email 
             FROM dispositivos d
             JOIN usuarios u ON d.usuario_id = u.id
             WHERE d.autorizado = FALSE
             ORDER BY d.created_at DESC`
        ) as any;

        return res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error en getDispositivosPendientes:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener dispositivos pendientes'
        });
    }
};

export const getDispositivos = async (_req: AuthRequest, res: Response) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                d.*, 
                u.nombre as usuario_nombre, 
                u.email as usuario_email 
             FROM dispositivos d
             JOIN usuarios u ON d.usuario_id = u.id
             ORDER BY d.created_at DESC`
        ) as any;

        return res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error en getDispositivos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener dispositivos'
        });
    }
};

export const autorizarDispositivo = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `SELECT 
                d.*, 
                u.nombre as usuario_nombre, 
                u.email as usuario_email 
             FROM dispositivos d
             JOIN usuarios u ON d.usuario_id = u.id
             WHERE d.id = ? AND d.autorizado = FALSE`,
            [id]
        ) as any;

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Dispositivo no encontrado o ya autorizado'
            });
        }

        const dispositivo = rows[0];

        await pool.query(
            'UPDATE dispositivos SET autorizado = TRUE WHERE id = ?',
            [id]
        );

        return res.json({
            success: true,
            message: `✅ Dispositivo "${dispositivo.nombre_dispositivo}" autorizado para ${dispositivo.usuario_nombre}`,
            data: {
                dispositivo_id: id,
                usuario: dispositivo.usuario_nombre,
                dispositivo: dispositivo.nombre_dispositivo
            }
        });

    } catch (error) {
        console.error('Error en autorizarDispositivo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al autorizar dispositivo'
        });
    }
};

export const rechazarDispositivo = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `SELECT d.*, u.nombre as usuario_nombre 
             FROM dispositivos d
             JOIN usuarios u ON d.usuario_id = u.id
             WHERE d.id = ? AND d.autorizado = FALSE`,
            [id]
        ) as any;

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Dispositivo no encontrado o ya procesado'
            });
        }

        const dispositivo = rows[0];

        await pool.query(
            'DELETE FROM dispositivos WHERE id = ?',
            [id]
        );

        return res.json({
            success: true,
            message: `❌ Dispositivo "${dispositivo.nombre_dispositivo}" rechazado`,
            data: {
                dispositivo_id: id,
                usuario: dispositivo.usuario_nombre,
                dispositivo: dispositivo.nombre_dispositivo
            }
        });

    } catch (error) {
        console.error('Error en rechazarDispositivo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al rechazar dispositivo'
        });
    }
};

// ================================================================
// ========== ESTADÍSTICAS PARA ADMIN ==========
// ================================================================

export const getAdminStats = async (_req: AuthRequest, res: Response) => {
    try {
        const [totalUsuarios] = await pool.query(
            'SELECT COUNT(*) as total FROM usuarios'
        ) as any;

        const [usuariosPendientes] = await pool.query(
            'SELECT COUNT(*) as total FROM usuarios WHERE estado = "pendiente"'
        ) as any;

        const [dispositivosPendientes] = await pool.query(
            'SELECT COUNT(*) as total FROM dispositivos WHERE autorizado = FALSE'
        ) as any;

        const [usuariosPorRol] = await pool.query(
            'SELECT rol, COUNT(*) as total FROM usuarios GROUP BY rol'
        ) as any;

        return res.json({
            success: true,
            data: {
                totalUsuarios: totalUsuarios[0].total,
                usuariosPendientes: usuariosPendientes[0].total,
                dispositivosPendientes: dispositivosPendientes[0].total,
                usuariosPorRol
            }
        });

    } catch (error) {
        console.error('Error en getAdminStats:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
};