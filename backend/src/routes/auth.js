import express from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/authMiddleware.js';
import { register, login, getProfile, refreshToken, logout } from '../controllers/authController.js';

const router = express.Router();

// Validación para el registro
const registerSchema = Joi.object({
  name: Joi.string().optional(),
  firstName: Joi.string().when('name', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }).messages({'any.required': 'El nombre es requerido'}),
  lastName: Joi.string().when('name', { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }).messages({'any.required': 'El apellido es requerido'}),
  email: Joi.string().email().required().messages({'string.email': 'Debe ser un email válido'}),
  password: Joi.string().min(6).required().messages({'string.min': 'La contraseña debe tener al menos 6 caracteres'}),
  role: Joi.string().valid('admin', 'school_admin', 'driver', 'parent').optional()
});

// Validación para el login
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({'string.email': 'Email inválido'}),
  password: Joi.string().required().messages({'any.required': 'La contraseña es requerida'})
});

// POST /api/auth/register (pública)
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login (pública)
router.post('/login', validate(loginSchema), login);

// POST /api/auth/refresh (pública, usa cookie)
router.post('/refresh', refreshToken);

// POST /api/auth/logout (privada)
router.post('/logout', protect, logout);

// GET /api/auth/profile (privada)
router.get('/profile', protect, getProfile);

export default router;