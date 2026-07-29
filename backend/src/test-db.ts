// src/test-db.ts
import pool from './config/database.js';

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a la base de datos exitosa');
        
        const [rows] = await connection.query('SELECT 1 + 1 as result');
        console.log('✅ Query de prueba:', rows);
        
        connection.release();
        console.log('✅ Todo funciona correctamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error);
        process.exit(1);
    }
}

testConnection();