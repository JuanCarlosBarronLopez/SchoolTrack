import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración de sesiones para Express
 * Maneja autenticación y gestión de cookies de sesión seguras
 */
export const sessionConfig = session({
  secret: process.env.SECRET_SESSION || process.env.JWT_SECRET,
  name: 'schooltrack.sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production' || process.env.SECURE_COOKIES === 'true',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24, // 24 horas
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost'
  }
});

/**
 * Configuración mejorada de cookies para datos no sensibles
 */
export const setCookie = (res, name, value, options = {}) => {
  const defaultOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    ...options
  };
  
  res.cookie(name, value, defaultOptions);
};

/**
 * Middleware para limpiar cookies
 */
export const clearCookie = (res, name) => {
  res.clearCookie(name, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
};

/**
 * Middleware para verificar si el usuario está autenticado en sesión
 */
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'No autenticado. Inicia sesión primero.'
  });
};

/**
 * Middleware para verificar rol del usuario
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: Rol insuficiente'
      });
    }

    next();
  };
};

/**
 * Middleware para cerrar sesión mejorado
 */
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al cerrar sesión'
      });
    }
    clearCookie(res, 'schooltrack.sid');
    res.json({
      success: true,
      message: 'Sesión cerrada correctamente',
      timestamp: new Date().toISOString()
    });
  });
};

export { setCookie, clearCookie, logout, sessionConfig };
