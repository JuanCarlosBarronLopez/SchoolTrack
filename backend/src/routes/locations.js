import express from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import logger from '../utils/logger.js';
import locationService from '../services/locationService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validaciones
const locationHistorySchema = Joi.object({
  vehicleId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({'string.pattern.base': 'ID de vehículo inválido', 'any.required': 'ID de vehículo requerido'}),
  startDate: Joi.date().iso().optional().messages({'date.format': 'Fecha de inicio inválida'}),
  endDate: Joi.date().iso().optional().messages({'date.format': 'Fecha de fin inválida'}),
  limit: Joi.number().integer().min(1).max(1000).optional().messages({'number.min': 'Límite inválido', 'number.max': 'Límite inválido'})
});

const etaSchema = Joi.object({
  vehicleId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({'string.pattern.base': 'ID de vehículo inválido', 'any.required': 'ID de vehículo requerido'}),
  lat: Joi.number().min(-90).max(90).required().messages({'number.min': 'Latitud inválida', 'number.max': 'Latitud inválida', 'any.required': 'Latitud requerida'}),
  lon: Joi.number().min(-180).max(180).required().messages({'number.min': 'Longitud inválida', 'number.max': 'Longitud inválida', 'any.required': 'Longitud requerida'})
});

const areaSchema = Joi.object({
  north: Joi.number().required().messages({'any.required': 'Límite norte requerido'}),
  south: Joi.number().required().messages({'any.required': 'Límite sur requerido'}),
  east: Joi.number().required().messages({'any.required': 'Límite este requerido'}),
  west: Joi.number().required().messages({'any.required': 'Límite oeste requerido'})
});

// Rutas
router.get('/history', protect, validate(locationHistorySchema, 'query'), async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, limit } = req.query;

    const history = await locationService.getVehicleLocationHistory(vehicleId, {
      startDate,
      endDate,
      limit: parseInt(limit) || 100
    });

    res.json({ history });
  } catch (error) {
    logger.error('Error obteniendo historial', { error: error.message });
    res.status(500).json({ message: error.message });
  }
});

router.get('/eta', protect, validate(etaSchema, 'query'), async (req, res) => {
  try {
    const { vehicleId, lat, lon } = req.query;

    const eta = await locationService.calculateVehicleETA(vehicleId, {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon)
    });

    res.json(eta);
  } catch (error) {
    logger.error('Error calculando ETA', { error: error.message });
    res.status(500).json({ message: error.message });
  }
});

router.get('/route/:routeId', protect, async (req, res) => {
  try {
    const { routeId } = req.params;
    const vehicles = await locationService.getRouteVehicleLocations(routeId);

    res.json({ routeId, vehicles });
  } catch (error) {
    logger.error('Error obteniendo ubicaciones de ruta', { error: error.message });
    res.status(500).json({ message: error.message });
  }
});

router.get('/area', protect, validate(areaSchema, 'query'), async (req, res) => {
  try {
    const bounds = {
      north: parseFloat(req.query.north),
      south: parseFloat(req.query.south),
      east: parseFloat(req.query.east),
      west: parseFloat(req.query.west)
    };

    const vehicles = await locationService.getActiveVehiclesInArea(bounds);
    res.json({ vehicles });
  } catch (error) {
    logger.error('Error obteniendo vehículos en área', { error: error.message });
    res.status(500).json({ message: error.message });
  }
});

export default router;