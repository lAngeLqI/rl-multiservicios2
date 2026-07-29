// src/config/database.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env['DB_HOST'] || 'localhost',
    user: process.env['DB_USER'] || 'root',
    password: process.env['DB_PASSWORD'] || 'root',  // ← Usar corchetes
    database: process.env['DB_NAME'] || 'rl_multiservicios',
    port: Number(process.env['DB_PORT']) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;