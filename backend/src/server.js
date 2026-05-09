import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Importar logger
import logger from './utils/logger.js';

// Importar conexión a BD
import connectDB from './config/db.js';

// Importar middlewares
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { sessionConfig } from './middleware/sessionMiddleware.js';
import {
  apiLimiter,
  authLimiter,
  securityHeaders,
  sanitizeInput,
  validateContentType,
  preventNoSQLInjection,
  requestId
} from './middleware/security.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import vehicleRoutes from './routes/vehicles.js';
import routeRoutes from './routes/routes.js';
import stopRoutes from './routes/stops.js';
import userRoutes from './routes/users.js';
import locationRoutes from './routes/locations.js';
import geocodingRoutes from './routes/geocoding.js';
import qrRoutes from './routes/qr.js';
import statusRoutes from './routes/status.js';
import fileRoutes from './routes/files.js';
import sessionRoutes from './routes/sessions.js';
import blogRoutes from './routes/blog.js';
import profileRoutes from './routes/profile.js';

// Configuración de directorios
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads');
const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info('📁 Directorio de uploads creado');
}

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  logger.info('📁 Directorio de logs creado');
}

// Conectar a base de datos
connectDB();

// Crear aplicación
const app = express();
const server = http.createServer(app);

// Configuración de Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Guardar io en app para usarlo en controllers
app.set('io', io);

// ==================== MIDDLEWARES ====================

// Helmet para seguridad (incluye CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "https:", "ws:", "wss:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  referrerPolicy: {
    policy: 'no-referrer-when-downgrade'
  }
}));

// CORS mejorado
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8080',
    process.env.BACKEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// Morgan para logging con formato personalizado
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Sanitización de datos contra inyección NoSQL
app.use(mongoSanitize());

// Prevenir contaminación de parámetros HTTP (HPP)
app.use(hpp());

// Compresión de respuestas HTTP
app.use(compression());

// Cookie parser
app.use(cookieParser(process.env.JWT_SECRET));

// Middlewares de seguridad personalizado
app.use(requestId); // Request ID único para tracking
app.use(securityHeaders); // Headers de seguridad
app.use(validateContentType); // Validar Content-Type
app.use(sanitizeInput); // Sanitizar inputs
app.use(preventNoSQLInjection); // Prevenir inyección NoSQL

// Sesiones
app.use(sessionConfig);

// Rate limiting general
app.use('/api/', apiLimiter);

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==================== RUTAS ====================

// Health check mejorado
app.get('/api/health', (req, res) => {
  const mongoState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = mongoose.connection.readyState;
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'NOT SET';
  const sanitizedUri = uri !== 'NOT SET' ? uri.replace(/:([^@]+)@/, ':****@') : 'NOT SET';
  
  const healthcheck = {
    success: true,
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    database: {
      status: mongoState[state] || 'unknown',
      stateCode: state,
      uri: sanitizedUri,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A'
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  };
  res.json(healthcheck);
});

// Endpoint de seguridad
app.get('/api/security-headers', (req, res) => {
  res.json({
    success: true,
    message: 'Headers de seguridad activos',
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    }
  });
});

// Rutas de autenticación (con rate limiting estricto)
app.use('/api/auth', authLimiter, authRoutes);

// Rutas de estudiantes
app.use('/api/students', studentRoutes);

// Rutas de vehículos
app.use('/api/vehicles', vehicleRoutes);

// Rutas de rutas
app.use('/api/routes', routeRoutes);

// Rutas de paradas
app.use('/api/stops', stopRoutes);

// Rutas de usuarios
app.use('/api/users', userRoutes);

// Rutas de perfil
app.use('/api/profile', profileRoutes);

// Rutas de ubicaciones
app.use('/api/locations', locationRoutes);

// Rutas de geocoding
app.use('/api/geocoding', geocodingRoutes);

// Rutas de QR
app.use('/api/qr', qrRoutes);

// Rutas de estado
app.use('/api/status', statusRoutes);

// Rutas de archivos
app.use('/api/files', fileRoutes);

// Rutas de sesiones
app.use('/api/sessions', sessionRoutes);

// Rutas de blog
app.use('/api/blog', blogRoutes);

// ==================== WEBSOCKET ====================

io.on('connection', (socket) => {
  logger.info(`✅ Cliente conectado: ${socket.id}`);

  // Evento de actualización de ubicación
  socket.on('location-update', (data) => {
    io.emit('location-updated', {
      vehicleId: data.vehicleId,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date(),
      speed: data.speed,
      accuracy: data.accuracy
    });
  });

  // Evento de cambio de estado
  socket.on('status-change', (data) => {
    io.emit('status-changed', {
      vehicleId: data.vehicleId,
      status: data.status,
      timestamp: new Date()
    });
  });

  // Evento de desconexión
  socket.on('disconnect', () => {
    logger.info(`❌ Cliente desconectado: ${socket.id}`);
  });
});

// ==================== MANEJO DE ERRORES ====================

// Ruta 404
app.use(notFound);

// Manejador global de errores
app.use(errorHandler);

// ==================== INICIAR SERVIDOR ====================

const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  logger.info(`
╔════════════════════════════════════╗
║  🚀 SchoolTrack Backend Iniciado  ║
╠════════════════════════════════════╣
║  Puerto: ${PORT}
║  Entorno: ${process.env.NODE_ENV || 'development'}
║  URL: http://localhost:${PORT}
║  Frontend: ${process.env.FRONTEND_URL || 'http://localhost:8080'}
╚════════════════════════════════════╝
  `);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Rechazo no manejado', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Excepción no capturada', { error: error.stack || error });
  process.exit(1);
});

export default app;