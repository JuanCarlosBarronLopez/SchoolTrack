import express from 'express';
import {
  getSession,
  createSession,
  updateSession,
  recordVisit,
  closeSession,
  logoutAllDevices
} from '../controllers/sessionController.js';
import { isAuthenticated } from '../middleware/sessionMiddleware.js';

const router = express.Router();

/**
 * Rutas para manejo de sesiones
 */

// Obtener sesión actual
router.get('/current', getSession);

// Crear sesión (login)
router.post('/create', createSession);

// Actualizar sesión
router.put('/update', isAuthenticated, updateSession);

// Registrar visita
router.post('/visit', recordVisit);

// Cerrar sesión (logout)
router.post('/logout', closeSession);

// Cerrar todas las sesiones
router.post('/logout-all', isAuthenticated, logoutAllDevices);

export default router;
