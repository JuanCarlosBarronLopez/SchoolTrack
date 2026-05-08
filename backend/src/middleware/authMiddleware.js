import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * Middleware de protección con JWT
 * Verifica que el token sea válido y obtiene el usuario
 */
export const protect = async (req, res, next) => {
  let token;

  try {
    // 1. Leer el token del header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Verificar que el token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado: Token faltante'
      });
    }

    // 3. Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Obtener el usuario
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado: Usuario no encontrado'
      });
    }

    // 5. Verificar si el usuario está activo
    if (req.user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: Usuario inactivo'
      });
    }

    next();
  } catch (error) {
    logger.error('❌ Error de autenticación', { error: error.message });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'No autorizado'
    });
  }
};

/**
 * Middleware para autorizar por rol
 */
export const authorize = (...roles) => {
  // Flatten in case an array was passed as a single argument: authorize(['admin','school_admin'])
  const flatRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!flatRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado: Se requiere rol de ${flatRoles.join(' o ')}`
      });
    }

    next();
  };
};

/**
 * Middleware para verificar si es el mismo usuario o admin
 */
export const checkOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado'
    });
  }

  const userId = req.params.id || req.params.userId;
  const isOwner = req.user._id.toString() === userId;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para acceder a este recurso'
    });
  }

  next();
};

export default { protect, authorize, checkOwnerOrAdmin };