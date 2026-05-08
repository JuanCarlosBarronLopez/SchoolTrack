import express from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Validaciones
const userSchema = Joi.object({
  firstName: Joi.string().trim().required().messages({'any.required': 'El nombre es requerido', 'string.empty': 'El nombre es requerido'}),
  lastName: Joi.string().trim().required().messages({'any.required': 'El apellido es requerido', 'string.empty': 'El apellido es requerido'}),
  email: Joi.string().email().required().messages({'string.email': 'Email inválido', 'any.required': 'El email es requerido'}),
  role: Joi.string().valid('admin', 'driver', 'parent', 'school_admin').required().messages({'any.only': 'Rol inválido', 'any.required': 'El rol es requerido'}),
  phone: Joi.string().trim().min(5).optional().messages({'string.min': 'Teléfono inválido'}),
  password: Joi.string().optional() // Allow password update
});

const adminRoles = ['admin', 'school_admin'];

router.get('/', protect, authorize(adminRoles), async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .populate('assignedVehicle', 'licensePlate model brand')
      .populate('children', 'firstName lastName studentId')
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);
    res.json({ users, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    logger.error('Error obteniendo usuarios', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/:id', protect, authorize(adminRoles), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('assignedVehicle', 'licensePlate model brand')
      .populate('children', 'firstName lastName studentId')
      .select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    logger.error('Error obteniendo usuario', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/:id', protect, authorize(adminRoles), validate(userSchema), async (req, res) => {
  try {
    const updateData = req.body;
    if (updateData.password) {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario actualizado exitosamente', user });
  } catch (error) {
    logger.error('Error actualizando usuario', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Solo el 'admin' principal puede borrar
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Eliminar avatar físico si existe
    try {
      if (user.avatar) {
        const uploadDir = path.join(__dirname, '../../uploads');
        const filePath = path.join(uploadDir, 'avatars', user.avatar);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (fsErr) {
      logger.error('Error eliminando avatar del usuario', { error: fsErr.message });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    logger.error('Error eliminando usuario', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/drivers/available', protect, authorize(adminRoles), async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver', isActive: true })
      .select('firstName lastName email phone')
      .sort({ lastName: 1 });
    res.json(drivers);
  } catch (error) {
    logger.error('Error obteniendo conductores disponibles', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
});

export default router;