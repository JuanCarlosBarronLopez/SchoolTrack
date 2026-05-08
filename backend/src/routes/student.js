import express from 'express';
import {
  createStudent,
  getMyStudents,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const adminRoles = ['admin', 'school_admin'];
const parentRole = ['parent'];
const allRoles = ['admin', 'school_admin', 'parent'];

// Todas las rutas requieren estar logueado
router.use(protect);

// --- RUTAS DE ADMIN ---
router.get('/', authorize(adminRoles), getAllStudents);

// --- RUTAS DE PADRE ---
router.get('/my', authorize(parentRole), getMyStudents);

// --- RUTA DE CREACIÓN ---
router.post('/', authorize(allRoles), createStudent);

// --- RUTAS DE GESTIÓN POR ID ---
router.route('/:id')
  .get(authorize(allRoles), getStudentById)
  .put(authorize(adminRoles), updateStudent)
  .delete(authorize(adminRoles), deleteStudent);

export default router;