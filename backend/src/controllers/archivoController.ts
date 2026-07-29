// src/controllers/archivoController.ts
import { Request, Response } from 'express';
import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// ========== DESCARGAR ARCHIVO ==========
export const downloadArchivo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM archivos WHERE id = ?',
            [id]
        ) as any;

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Archivo no encontrado'
            });
        }

        const archivo = rows[0];
        const filePath = path.resolve(archivo.ruta);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Archivo físico no encontrado'
            });
        }

        return res.download(filePath, archivo.nombre_original);

    } catch (error) {
        console.error('Error en downloadArchivo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al descargar archivo'
        });
    }
};

// ========== OBTENER ARCHIVOS DE UN PEDIDO ==========
export const getArchivosByPedido = async (req: Request, res: Response) => {
    try {
        const { pedidoId } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM archivos WHERE pedido_id = ? ORDER BY created_at DESC',
            [pedidoId]
        ) as any;

        return res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error('Error en getArchivosByPedido:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener archivos'
        });
    }
};

// ========== ELIMINAR ARCHIVO ==========
export const deleteArchivo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            'SELECT * FROM archivos WHERE id = ?',
            [id]
        ) as any;

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Archivo no encontrado'
            });
        }

        const archivo = rows[0];
        const filePath = path.resolve(archivo.ruta);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await pool.query('DELETE FROM archivos WHERE id = ?', [id]);

        return res.json({
            success: true,
            message: 'Archivo eliminado correctamente'
        });

    } catch (error) {
        console.error('Error en deleteArchivo:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar archivo'
        });
    }
};

// ========== PREVISUALIZAR ARCHIVO (CONVERSIÓN A PNG) ==========
export const previewArchivo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { size = 'medium' } = req.query;

    

        // 1. Buscar archivo en la base de datos
        const [rows] = await pool.query(
            'SELECT * FROM archivos WHERE id = ?',
            [id]
        ) as any;

        if (rows.length === 0) {
            
            return res.status(404).json({
                success: false,
                message: 'Archivo no encontrado'
            });
        }

        const archivo = rows[0];
       

        const filePath = path.resolve(archivo.ruta);
        

        // 2. Verificar que el archivo existe físicamente
        if (!fs.existsSync(filePath)) {
            
            return res.status(404).json({
                success: false,
                message: 'Archivo físico no encontrado'
            });
        }

        // 3. Verificar si es una imagen soportada por Sharp
        const isImage = archivo.tipo?.startsWith('image/') || 
                        archivo.nombre_original.match(/\.(tiff|tif|jpg|jpeg|png|gif|bmp|webp)$/i);

        if (!isImage) {
            
            return res.status(415).json({
                success: false,
                message: 'No se puede previsualizar este tipo de archivo'
            });
        }

        // 4. Configurar tamaño de previsualización
        let width = 800;
        let height = 800;
        
        if (size === 'small') { 
            width = 300; 
            height = 300; 
        } else if (size === 'large') { 
            width = 1200; 
            height = 1200; 
        }

       

        // 5. Convertir a PNG (compatible con todos los navegadores)
        const pngBuffer = await sharp(filePath)
            .resize(width, height, { 
                fit: 'inside', 
                withoutEnlargement: true 
            })
            .png({ 
                quality: 80,
                compressionLevel: 6
            })
            .toBuffer();

        

        // 6. Enviar la imagen PNG
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 24 horas
        res.setHeader('Content-Disposition', 'inline');
        
        return res.send(pngBuffer);

    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: 'Error al previsualizar archivo'
        });
    }
};