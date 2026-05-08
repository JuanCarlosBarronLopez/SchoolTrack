import express from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import vehicleController from '../controllers/vehicleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validaciones
const vehicleSchema = Joi.object({
  licensePlate: Joi.string().trim().min(3).required().messages({'string.min': 'La placa es requerida', 'any.required': 'La placa es requerida', 'string.empty': 'La placa es requerida'}),
  model: Joi.string().trim().min(1).required().messages({'string.empty': 'El modelo es requerido', 'any.required': 'El modelo es requerido'}),
  brand: Joi.string().trim().min(1).required().messages({'string.empty': 'La marca es requerida', 'any.required': 'La marca es requerida'}),
  year: Joi.number().integer().min(1990).max(new Date().getFullYear() + 1).required().messages({'number.min': 'Año inválido', 'number.max': 'Año inválido', 'any.required': 'Año requerido'}),
  color: Joi.string().trim().min(1).required().messages({'string.empty': 'El color es requerido', 'any.required': 'El color es requerido'}),
  capacity: Joi.number().integer().min(1).max(100).required().messages({'number.min': 'Capacidad inválida', 'number.max': 'Capacidad inválida', 'any.required': 'Capacidad requerida'}),
  driver: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({'string.pattern.base': 'Conductor inválido', 'any.required': 'Conductor requerido'}),
  features: Joi.array().items(Joi.string()).optional()
});

const locationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required().messages({'number.min': 'Latitud inválida', 'number.max': 'Latitud inválida', 'any.required': 'Latitud requerida'}),
  longitude: Joi.number().min(-180).max(180).required().messages({'number.min': 'Longitud inválida', 'number.max': 'Longitud inválida', 'any.required': 'Longitud requerida'})
});

// Rutas
router.get('/', protect, vehicleController.getAllVehicles);
router.get('/nearby', protect, vehicleController.getVehiclesNearLocation);
router.get('/:id', protect, vehicleController.getVehicleById);
router.post('/', protect, validate(vehicleSchema), vehicleController.createVehicle);
router.put('/:id', protect, validate(vehicleSchema), vehicleController.updateVehicle);
router.delete('/:id', protect, vehicleController.deleteVehicle);
router.put('/:id/location', protect, validate(locationSchema), vehicleController.updateLocation);

export default router;