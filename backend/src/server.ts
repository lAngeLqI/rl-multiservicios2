// src/server.ts
import app from './app.js';
import dotenv from 'dotenv';
import { Server as SocketServer } from 'socket.io';
import http from 'http';

dotenv.config();

const PORT = process.env['PORT'] || 5005;

// 🔥 CREAR SERVIDOR HTTP
const server = http.createServer(app);

// 🔥 CONFIGURAR SOCKET.IO
const io = new SocketServer(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
});

// 🔥 GUARDAR IO PARA USARLO EN OTROS ARCHIVOS
export { io };

// 🔥 EVENTOS DE SOCKET.IO
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

// 🔥 INICIAR SERVIDOR CON SOCKET.IO
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Archivos estáticos en: ${process.env['UPLOAD_DIR'] || './uploads'}`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket corriendo en ws://localhost:${PORT}`);
});