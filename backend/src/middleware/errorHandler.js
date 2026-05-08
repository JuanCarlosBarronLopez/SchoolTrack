/**
 * Logging profesional de errores
 */
import logger from '../utils/logger.js';

const logError = (err, req) => {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    message: err.message,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };
  
  logger.error('❌ ERROR', { error: errorLog });
};

/**
 * Manejador global de errores mejorado
 */
export const errorHandler = (err, req, res, next) => {
  logError(err, req);

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');

    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      details: messages,
      timestamp: new Date().toISOString()
    });
  }

  // Errores de ID duplicado (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} ya está registrado`,
      timestamp: new Date().toISOString()
    });
  }

  // Error de casting (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
      timestamp: new Date().toISOString()
    });
  }

  // Errores JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      timestamp: new Date().toISOString()
    });
  }

  // Error por defecto
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
};

/**
 * Capturador de rutas no encontradas (404)
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
};

/**
 * Wrapper para funciones asincrónicas
 * Previene try-catch repetitivos
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default { errorHandler, notFound, asyncHandler };
