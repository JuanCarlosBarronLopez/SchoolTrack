import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import crypto from 'crypto';

/**
 * Rate limiter general para API
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // máximo 200 requests por ventana
  message: 'Demasiadas peticiones desde esta IP, intenta más tarde.',
  standardHeaders: true, // Retorna info en el header `RateLimit-*`
  legacyHeaders: false, // Desactiva `X-RateLimit-*`
  skip: (req) => process.env.NODE_ENV === 'development', // No limitar en desarrollo
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiadas peticiones. Por favor, intenta más tarde.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Rate limiter estricto para login/registro
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 intentos por ventana (antes era 5, muy estricto)
  message: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
  skipSuccessfulRequests: true, // No contar requests exitosos
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos. Por favor, intenta más tarde.'
    });
  }
});

/**
 * Rate limiter para endpoints de archivos
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 uploads por hora
  message: 'Has alcanzado el límite de subidas. Intenta más tarde.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Límite de subidas alcanzado. Intenta más tarde.'
    });
  }
});

/**
 * Middleware para validar tamaño de payload
 */
export const validatePayloadSize = (req, res, next) => {
  const maxSize = process.env.MAX_PAYLOAD_SIZE || 50 * 1024 * 1024; // 50MB por defecto

  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      success: false,
      message: `Payload demasiado grande. Máximo ${maxSize / 1024 / 1024}MB`
    });
  }

  next();
};

/**
 * Middleware para agregar headers de seguridad adicionales
 */
export const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

  // Feature policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

/**
 * Middleware para sanitizar inputs
 */
export const sanitizeInput = (req, res, next) => {
  // Sanitizar strings en body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitizar params
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = req.params[key].trim();
      }
    });
  }

  next();
};

/**
 * Middleware para validar Content-Type
 */
export const validateContentType = (req, res, next) => {
  const allowedTypes = ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded'];
  const contentType = req.headers['content-type'];

  if (req.method !== 'GET' && req.method !== 'DELETE' && contentType) {
    const type = contentType.split(';')[0].trim();
    if (!allowedTypes.includes(type)) {
      return res.status(415).json({
        success: false,
        message: 'Content-Type no soportado'
      });
    }
  }

  next();
};

/**
 * Middleware para prevenir inyección NoSQL
 */
export const preventNoSQLInjection = (req, res, next) => {
  const checkForInjection = (obj) => {
    if (obj === null || typeof obj !== 'object') return false;

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        // Buscar operadores MongoDB
        if (typeof value === 'object' && (
          value.$where || value.$regex || value.$ne || value.$gt || value.$lt
        )) {
          return true;
        }

        // Recursivamente revisar objetos anidados
        if (typeof value === 'object' && checkForInjection(value)) {
          return true;
        }
      }
    }

    return false;
  };

  if (checkForInjection(req.body) || checkForInjection(req.query)) {
    return res.status(400).json({
      success: false,
      message: 'Entrada sospechosa detectada'
    });
  }

  next();
};

/**
 * Middleware para request ID único
 */
export const requestId = (req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};

export default {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  validatePayloadSize,
  securityHeaders,
  sanitizeInput,
  validateContentType,
  preventNoSQLInjection,
  requestId
};
