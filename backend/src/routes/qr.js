import express from 'express';
import {
  generateStudentQR,
  generateDriverQR,
  scanStudentQR,
  scanDriverQR,
  getStudentsInVehicle
} from '../controllers/qrController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ========================================
// Rutas de Generación (Admins / Parents)
// ========================================

// GET generar QR para un estudiante
router.post('/generate/student/:studentId', protect, authorize('admin', 'school_admin', 'parent'), generateStudentQR);

// GET generar QR para un conductor
router.post('/generate/driver/:driverId', protect, authorize('admin', 'school_admin'), generateDriverQR);

// ========================================
// Rutas de Escaneo (Drivers / Admins)
// ========================================

// POST escanear QR de estudiante (subida/bajada)
router.post('/scan/student', protect, authorize('driver', 'admin'), scanStudentQR);

// POST escanear QR de conductor (asignación de vehículo)
router.post('/scan/driver', protect, authorize('driver', 'admin'), scanDriverQR);

// ========================================
// Consultas
// ========================================

// GET obtener lista de estudiantes actualmente en un vehículo
router.get('/vehicle/:vehicleId/students', protect, authorize('driver', 'admin', 'school_admin'), getStudentsInVehicle);

export default router;