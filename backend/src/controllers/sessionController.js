import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Controlador para manejo de sesiones
 */

/**
 * Obtener datos de la sesión actual
 */
export const getSession = asyncHandler(async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'No hay sesión activa'
    });
  }

  res.json({
    success: true,
    session: {
      user: req.session.user,
      createdAt: req.session.cookie._expires,
      visits: req.session.visits || 0
    }
  });
});

/**
 * Crear sesión (login)
 */
export const createSession = asyncHandler(async (req, res) => {
  const { userId, username, email, role } = req.body;

  if (!userId || !username) {
    return res.status(400).json({
      success: false,
      message: 'Datos incompletos'
    });
  }

  // Crear sesión
  req.session.user = {
    id: userId,
    username,
    email,
    role: role || 'user'
  };

  req.session.createdAt = new Date();
  req.session.visits = (req.session.visits || 0) + 1;

  res.json({
    success: true,
    message: 'Sesión creada correctamente',
    session: req.session.user
  });
});

/**
 * Actualizar sesión
 */
export const updateSession = asyncHandler(async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'No hay sesión activa'
    });
  }

  const { username, email, role } = req.body;

  if (username) req.session.user.username = username;
  if (email) req.session.user.email = email;
  if (role) req.session.user.role = role;

  res.json({
    success: true,
    message: 'Sesión actualizada',
    session: req.session.user
  });
});

/**
 * Registrar visita a ruta
 */
export const recordVisit = asyncHandler(async (req, res) => {
  if (!req.session) {
    req.session.visits = 1;
  } else {
    req.session.visits = (req.session.visits || 0) + 1;
  }

  res.json({
    success: true,
    message: `Visita #${req.session.visits}`,
    visits: req.session.visits
  });
});

/**
 * Cerrar sesión (logout)
 */
export const closeSession = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error al cerrar sesión'
      });
    }

    res.clearCookie('sessionId', { path: '/' });

    res.json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  });
});

/**
 * Destruir todas las sesiones de un usuario (logout en todos los dispositivos)
 */
export const logoutAllDevices = asyncHandler(async (req, res) => {
  // En producción, esto se implementaría con Redis o similar
  // para rastrear sesiones de usuario

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error cerrando sesiones'
      });
    }

    res.clearCookie('sessionId', { path: '/' });

    res.json({
      success: true,
      message: 'Todas las sesiones fueron cerradas'
    });
  });
});

export default {
  getSession,
  createSession,
  updateSession,
  recordVisit,
  closeSession,
  logoutAllDevices
};
