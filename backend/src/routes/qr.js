import express from 'express';
import {
  generateQR,
  validateQR,
  checkInWithQR,
  getQRDetails,
  getQRByTrip,
  getAllQRCodes,
  voidQRCode
} from '../controllers/qrController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ========================================
// Rutas públicas para validación
// ========================================

// GET validar QR
router.get('/validate/:code', validateQR);

// ========================================
// Rutas protegidas
// ========================================

// GET generar QR para un viaje
router.get('/generate/:tripId', protect, authorize('admin', 'driver'), generateQR);

// POST check-in con QR
router.post('/checkin', protect, checkInWithQR);

// GET detalles de QR
router.get('/:code/details', protect, getQRDetails);

// GET QR por viaje
router.get('/trip/:tripId', protect, getQRByTrip);

// ========================================
// Rutas admin
// ========================================

// GET todos los QRs
router.get('/', protect, authorize('admin'), getAllQRCodes);

// POST marcar QR como voided
router.post('/:code/void', protect, authorize('admin'), voidQRCode);

export default router;