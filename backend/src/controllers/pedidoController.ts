// src/controllers/pedidoController.ts
import { Request, Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import path from 'path';
import sharp from 'sharp';
import { io } from '../server.js'; // 🔥 IMPORTAR IO PARA WEBSOCKET

// ========== CREAR PEDIDO ==========
export const createPedido = async (req: AuthRequest, res: Response) => {
    try {
        const { nombre, fecha_entrega, prioridad, comentario_general } = req.body;
        const disenador_id = req.userId;

        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debes subir al menos un archivo'
            });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [pedidoResult] = await connection.query(
                `INSERT INTO pedidos 
                 (nombre, fecha_entrega, prioridad, comentario_general, disenador_id, estado) 
                 VALUES (?, ?, ?, ?, ?, 'pendiente')`,
                [nombre, fecha_entrega, prioridad || 'media', comentario_general, disenador_id]
            ) as any;

            const pedidoId = pedidoResult.insertId;
            const archivosGuardados = [];

            const files = req.files as Express.Multer.File[];
            const uploadDir = process.env['UPLOAD_DIR'] || './uploads';
            
            for (const file of files) {
                const optimizedPath = path.join(
                    uploadDir,
                    'optimized-' + file.filename
                );

                try {
                    await sharp(file.path)
                        .resize(3000, 3000, { fit: 'inside', withoutEnlargement: true })
                        .jpeg({ quality: 90, progressive: true })
                        .toFile(optimizedPath);

                    const tamañoMb = (file.size / 1024 / 1024);

                    const [archivoResult] = await connection.query(
                        `INSERT INTO archivos 
                         (nombre_original, nombre_guardado, ruta, tamaño_mb, tipo, pedido_id, estado) 
                         VALUES (?, ?, ?, ?, ?, ?, 'listo')`,
                        [
                            file.originalname,
                            file.filename,
                            file.path,
                            tamañoMb,
                            file.mimetype,
                            pedidoId
                        ]
                    ) as any;

                    archivosGuardados.push({
                        id: archivoResult.insertId,
                        nombre: file.originalname,
                        tamaño: tamañoMb
                    });

                } catch (error) {
                    console.error('Error al optimizar archivo:', error);
                }
            }

            await connection.commit();
            connection.release();

            // 🔥 EMITIR EVENTO WEBSOCKET - NUEVO PEDIDO
            io.emit('nuevo-pedido', {
                pedidoId,
                disenador_id,
                mensaje: `📦 Nuevo pedido: ${nombre}`
            });

            return res.status(201).json({
                success: true,
                message: 'Pedido creado exitosamente',
                data: {
                    pedidoId,
                    archivos: archivosGuardados
                }
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        console.error('Error en createPedido:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear el pedido'
        });
    }
};

// ========== OBTENER TODOS LOS PEDIDOS (Operador) ==========
export const getPedidos = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, estado, prioridad } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT p.*, 
                   d.nombre as disenador_nombre, 
                   o.nombre as operador_nombre,
                   (SELECT COUNT(*) FROM archivos WHERE pedido_id = p.id) as total_archivos
            FROM pedidos p
            LEFT JOIN usuarios d ON p.disenador_id = d.id
            LEFT JOIN usuarios o ON p.operador_id = o.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (estado) {
            query += ' AND p.estado = ?';
            params.push(estado);
        }

        if (prioridad) {
            query += ' AND p.prioridad = ?';
            params.push(prioridad);
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);

        const [rows] = await pool.query(query, params) as any;

        let countQuery = 'SELECT COUNT(*) as total FROM pedidos WHERE 1=1';
        const countParams: any[] = [];

        if (estado) {
            countQuery += ' AND estado = ?';
            countParams.push(estado);
        }

        if (prioridad) {
            countQuery += ' AND prioridad = ?';
            countParams.push(prioridad);
        }

        const [countResult] = await pool.query(countQuery, countParams) as any;

        return res.json({
            success: true,
            data: {
                items: rows,
                total: countResult[0].total,
                page: Number(page),
                totalPages: Math.ceil(countResult[0].total / Number(limit))
            }
        });

    } catch (error) {
        console.error('Error en getPedidos:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener pedidos'
        });
    }
};

// ========== OBTENER PEDIDOS POR DISEÑADOR ==========
export const getPedidosByDisenador = async (req: AuthRequest, res: Response) => {
    try {
        const { disenadorId } = req.params;
        const userId = req.userId;

        if (Number(disenadorId) !== userId) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado'
            });
        }

        const [rows] = await pool.query(
            `SELECT p.*, 
                    (SELECT COUNT(*) FROM archivos WHERE pedido_id = p.id) as total_archivos
             FROM pedidos p
             WHERE p.disenador_id = ?
             ORDER BY p.created_at DESC`,
            [disenadorId]
        ) as any;

        return res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error en getPedidosByDisenador:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener pedidos'
        });
    }
};

// ========== OBTENER PEDIDO POR ID ==========
export const getPedidoById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            `SELECT p.*, 
                    d.nombre as disenador_nombre, 
                    o.nombre as operador_nombre
             FROM pedidos p
             LEFT JOIN usuarios d ON p.disenador_id = d.id
             LEFT JOIN usuarios o ON p.operador_id = o.id
             WHERE p.id = ?`,
            [id]
        ) as any;

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        const [archivos] = await pool.query(
            'SELECT * FROM archivos WHERE pedido_id = ?',
            [id]
        ) as any;

        return res.json({
            success: true,
            data: {
                ...rows[0],
                archivos
            }
        });

    } catch (error) {
        console.error('Error en getPedidoById:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el pedido'
        });
    }
};

// ========== CAMBIAR ESTADO DEL PEDIDO ==========
export const updateEstado = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const operadorId = req.userId;

        const [result] = await pool.query(
            'UPDATE pedidos SET estado = ?, operador_id = ? WHERE id = ?',
            [estado, operadorId, id]
        ) as any;

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        // 🔥 EMITIR EVENTO WEBSOCKET - ESTADO CAMBIADO
        io.emit('estado-cambiado', {
            pedidoId: id,
            nuevoEstado: estado,
            mensaje: `🔄 Pedido #${id} cambiado a "${estado}"`
        });

        return res.json({
            success: true,
            message: 'Estado actualizado correctamente'
        });

    } catch (error) {
        console.error('Error en updateEstado:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar estado'
        });
    }
};

// ========== APROBAR PEDIDO (Operador) ==========
export const aprobarPedido = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'UPDATE pedidos SET estado = "aprobado" WHERE id = ? AND estado = "listo"',
            [id]
        ) as any;

        if (result.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: 'El pedido no está listo para aprobar o no existe'
            });
        }

        // 🔥 EMITIR EVENTO WEBSOCKET
        io.emit('estado-cambiado', {
            pedidoId: id,
            nuevoEstado: 'aprobado',
            mensagem: `✅ Pedido #${id} aprobado`
        });

        return res.json({
            success: true,
            message: 'Pedido aprobado correctamente'
        });

    } catch (error) {
        console.error('Error en aprobarPedido:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al aprobar pedido'
        });
    }
};

// ========== OBTENER ESTADÍSTICAS ==========
export const getStats = async (_req: Request, res: Response) => {
    try {
        const [total] = await pool.query('SELECT COUNT(*) as total FROM pedidos') as any;
        const [pendientes] = await pool.query('SELECT COUNT(*) as total FROM pedidos WHERE estado = "pendiente"') as any;
        const [proceso] = await pool.query('SELECT COUNT(*) as total FROM pedidos WHERE estado = "proceso"') as any;
        const [impresos] = await pool.query('SELECT COUNT(*) as total FROM pedidos WHERE estado = "impreso"') as any;
        const [entregados] = await pool.query('SELECT COUNT(*) as total FROM pedidos WHERE estado = "entregado"') as any;
        const [urgentes] = await pool.query('SELECT COUNT(*) as total FROM pedidos WHERE prioridad = "urgente"') as any;

        return res.json({
            success: true,
            data: {
                total: total[0].total,
                pendientes: pendientes[0].total,
                en_proceso: proceso[0].total,
                impresos: impresos[0].total,
                entregados: entregados[0].total,
                urgentes: urgentes[0].total
            }
        });

    } catch (error) {
        console.error('Error en getStats:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
};