import express from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import routeController from '../controllers/routeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validaciones
const routeSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({'string.empty': 'El nombre es requerido', 'any.required': 'El nombre es requerido'}),
  code: Joi.string().trim().min(1).required().messages({'string.empty': 'El código es requerido', 'any.required': 'El código es requerido'}),
  school: Joi.object({
    name: Joi.string().trim().min(1).required().messages({'string.empty': 'El nombre de la escuela es requerido', 'any.required': 'El nombre de la escuela es requerido'}),
    address: Joi.string().trim().min(1).required().messages({'string.empty': 'La dirección de la escuela es requerida', 'any.required': 'La dirección de la escuela es requerida'}),
    coordinates: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().ordered(
        Joi.number().min(-180).max(180).required().messages({'number.min': 'Longitud inválida', 'number.max': 'Longitud inválida'}),
        Joi.number().min(-90).max(90).required().messages({'number.min': 'Latitud inválida', 'number.max': 'Latitud inválida'})
      ).required()
    }).required()
  }).required(),
  status: Joi.string().valid('active', 'inactive').optional(),
  assignedVehicle: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional()
});

const adminRoles = ['admin', 'school_admin'];

// Rutas de lectura
router.get('/', protect, routeController.getAllRoutes);
router.get('/active', protect, routeController.getActiveRoutes);
router.get('/:id', protect, routeController.getRouteById);

// Rutas de escritura (solo admin)
router.post('/', protect, authorize(adminRoles), validate(routeSchema), routeController.createRoute);
router.put('/:id', protect, authorize(adminRoles), validate(routeSchema), routeController.updateRoute);
router.delete('/:id', protect, authorize(adminRoles), routeController.deleteRoute);
router.post('/:id/assign-vehicle', protect, authorize(adminRoles), routeController.assignVehicle);
router.delete('/:id/remove-vehicle', protect, authorize(adminRoles), routeController.removeVehicle);

export default router;