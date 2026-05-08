import express from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import logger from '../utils/logger.js';
import Stop from '../models/Stop.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validaciones
const stopSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({'string.empty': 'El nombre es requerido', 'any.required': 'El nombre es requerido'}),
  address: Joi.string().trim().min(1).required().messages({'string.empty': 'La dirección es requerida', 'any.required': 'La dirección es requerida'}),
  coordinates: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().ordered(
      Joi.number().min(-180).max(180).required().messages({'number.min': 'Longitud inválida', 'number.max': 'Longitud inválida'}),
      Joi.number().min(-90).max(90).required().messages({'number.min': 'Latitud inválida', 'number.max': 'Latitud inválida'})
    ).required()
  }).required(),
  estimatedArrivalTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({'string.pattern.base': 'Hora inválida (formato HH:MM)'}),
  order: Joi.number().integer().min(0).required().messages({'number.min': 'Orden inválido'}),
  route: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({'string.pattern.base': 'Ruta inválida'})
});

const adminRoles = ['admin', 'school_admin'];

// Rutas
router.get('/', protect, async (req, res) => {
  try {
    const { route, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (route) query.route = route;
    if (status) query.status = status;

    const stops = await Stop.find(query)
      .populate('route', 'name code')
      .populate('students', 'firstName lastName studentId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ order: 1 });

    const total = await Stop.countDocuments(query);
    res.json({ stops, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    logger.error('Error obteniendo paradas', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id).populate('route', 'name code');
    if (!stop) {
      return res.status(404).json({ message: 'Parada no encontrada' });
    }
    res.json(stop);
  } catch (error) {
    logger.error('Error obteniendo parada', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/', protect, authorize(adminRoles), validate(stopSchema), async (req, res) => {
  try {
    const stop = new Stop(req.body);
    await stop.save();
    res.status(201).json(stop);
  } catch (error) {
    logger.error('Error creando parada', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/:id', protect, authorize(adminRoles), validate(stopSchema), async (req, res) => {
  try {
    const stop = await Stop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!stop) {
      return res.status(404).json({ message: 'Parada no encontrada' });
    }
    res.json(stop);
  } catch (error) {
    logger.error('Error actualizando parada', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.delete('/:id', protect, authorize(adminRoles), async (req, res) => {
  try {
    const stop = await Stop.findByIdAndDelete(req.params.id);
    if (!stop) {
      return res.status(404).json({ message: 'Parada no encontrada' });
    }
    res.json({ message: 'Parada eliminada exitosamente' });
  } catch (error) {
    logger.error('Error eliminando parada', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/route/:routeId', protect, async (req, res) => {
  // ... (placeholder)
});

router.get('/nearby/:lat/:lng', protect, async (req, res) => {
  // ... (placeholder)
});

export default router;