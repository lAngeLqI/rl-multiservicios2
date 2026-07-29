// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const register = async (req: Request, res: Response) => {
    try {
        const { nombre, email, password, rol, telefono, empresa } = req.body;

        // Verificar si el usuario ya existe
        const [existing] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        ) as any;

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario
        const [result] = await pool.query(
            `INSERT INTO usuarios (nombre, email, password, rol, telefono, empresa) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, email, hashedPassword, rol || 'disenador', telefono, empresa]
        ) as any;

        const userId = result.insertId;

        // Generar token
        const token = jwt.sign(
            { id: userId, email, rol: rol || 'disenador' },
            process.env['JWT_SECRET'] || 'secret',
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                token,
                user: {
                    id: userId,
                    nombre,
                    email,
                    rol: rol || 'disenador'
                }
            }
        });

    } catch (error) {
        console.error('Error en register:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al registrar usuario'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, dispositivo } = req.body;
        console.log('🔵 login - Dispositivo:', dispositivo);

        // Buscar usuario
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        ) as any;

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        const user = rows[0];

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        // 🔥 VERIFICAR SI EL USUARIO ESTÁ APROBADO (estado general)
        if (user.estado === 'pendiente') {
            return res.status(403).json({
                success: false,
                message: '⏳ Tu cuenta está pendiente de aprobación por el administrador'
            });
        }

        if (user.estado === 'rechazado') {
            return res.status(403).json({
                success: false,
                message: '❌ Tu cuenta ha sido rechazada. Contacta al administrador.'
            });
        }

        // 🔥 VERIFICAR DISPOSITIVO AUTORIZADO
        let dispositivoAutorizado = false;
        
        if (dispositivo) {
            // Buscar si el dispositivo ya está registrado
            const [dispositivoRows] = await pool.query(
                'SELECT * FROM dispositivos WHERE usuario_id = ? AND huella_dispositivo = ?',
                [user.id, dispositivo.huella]
            ) as any;

            if (dispositivoRows.length > 0) {
                dispositivoAutorizado = dispositivoRows[0].autorizado === 1;
                
                // Actualizar último acceso
                await pool.query(
                    'UPDATE dispositivos SET ultimo_acceso = NOW() WHERE id = ?',
                    [dispositivoRows[0].id]
                );
            } else {
                // 🔥 NUEVO DISPOSITIVO - REGISTRAR Y SOLICITAR AUTORIZACIÓN
                await pool.query(
                    `INSERT INTO dispositivos 
                     (usuario_id, nombre_dispositivo, huella_dispositivo, sistema_operativo, navegador, ip, autorizado) 
                     VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
                    [
                        user.id,
                        dispositivo.nombreDispositivo || 'Dispositivo desconocido',
                        dispositivo.huella,
                        dispositivo.sistemaOperativo || 'Desconocido',
                        dispositivo.navegador || 'Desconocido',
                        dispositivo.ip || 'Desconocida'
                    ]
                );
                
                // 🔥 NOTIFICAR AL ADMIN (se implementa después)
                console.log(`📱 Nuevo dispositivo registrado para ${user.nombre} (${user.email})`);
                console.log(`📱 Dispositivo: ${dispositivo.nombreDispositivo}`);
                
                return res.status(403).json({
                    success: false,
                    message: '⏳ Este dispositivo necesita autorización del administrador',
                    requiereAutorizacion: true,
                    dispositivo: {
                        nombre: dispositivo.nombreDispositivo,
                        sistemaOperativo: dispositivo.sistemaOperativo,
                        navegador: dispositivo.navegador,
                        ip: dispositivo.ip
                    }
                });
            }
        }

        // 🔥 SI EL DISPOSITIVO NO ESTÁ AUTORIZADO
        if (!dispositivoAutorizado) {
            return res.status(403).json({
                success: false,
                message: '⏳ Este dispositivo no está autorizado. Contacta al administrador.'
            });
        }

        // ✅ TODO OK - Generar token
        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol },
            process.env['JWT_SECRET'] || 'secret',
            { expiresIn: '7d' }
        );

        delete user.password;

        return res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                user,
                dispositivoAutorizado
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión'
        });
    }
};

export const verify = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'secret') as any;
        
        const [rows] = await pool.query(
            'SELECT id, nombre, email, rol, telefono, empresa FROM usuarios WHERE id = ?',
            [decoded.id]
        ) as any;

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        return res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
};