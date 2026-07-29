// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId?: number;
    userRol?: string;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ 
            success: false, 
            message: 'Token no proporcionado' 
        });
        return;  // ← IMPORTANTE: agregar return
    }

    try {
        const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'secret') as any;
        req.userId = decoded.id;
        req.userRol = decoded.rol;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Token inválido o expirado' 
        });
        return;  // ← IMPORTANTE: agregar return
    }
};

export const verifyRol = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.userRol) {
            res.status(403).json({ 
                success: false, 
                message: 'No autorizado' 
            });
            return;  // ← IMPORTANTE: agregar return
        }

        if (!roles.includes(req.userRol)) {
            res.status(403).json({ 
                success: false, 
                message: 'No tienes permisos para realizar esta acción' 
            });
            return;  // ← IMPORTANTE: agregar return
        }

        next();
    };
};