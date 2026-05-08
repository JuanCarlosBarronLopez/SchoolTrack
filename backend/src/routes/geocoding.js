import express from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import logger from '../utils/logger.js';
import geocodingService from '../services/geocodingService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validaciones
const geocodeSchema = Joi.object({
  address: Joi.string().trim().min(1).required().messages({'string.empty': 'La dirección es requerida', 'any.required': 'La dirección es requerida'})
});

const reverseGeocodeSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required().messages({'number.min': 'Latitud inválida', 'number.max': 'Latitud inválida', 'any.required': 'Latitud requerida'}),
  lon: Joi.number().min(-180).max(180).required().messages({'number.min': 'Longitud inválida', 'number.max': 'Longitud inválida', 'any.required': 'Longitud requerida'})
});

// Rutas
router.post('/geocode', protect, validate(geocodeSchema), async (req, res) => {
  try {
    const { address } = req.body;
    const result = await geocodingService.geocodeAddress(address);
    res.json(result);
  } catch (error) {
    logger.error('Error en geocodificación', { error: error.message });
    res.status(400).json({ message: error.message });
  }
});

router.post('/reverse-geocode', protect, validate(reverseGeocodeSchema, 'query'), async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const result = await geocodingService.reverseGeocode(parseFloat(lat), parseFloat(lon));
    res.json(result);
  } catch (error) {
    logger.error('Error en geocodificación inversa', { error: error.message });
    res.status(400).json({ message: error.message });
  }
});

router.post('/batch-geocode', protect, async (req, res) => {
  try {
    const { addresses } = req.body;

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ message: 'Se requiere un array de direcciones' });
    }

    if (addresses.length > 50) {
      return res.status(400).json({ message: 'Máximo 50 direcciones por solicitud' });
    }

    const results = await geocodingService.batchGeocode(addresses);
    res.json({ results });
  } catch (error) {
    logger.error('Error en geocodificación por lotes', { error: error.message });
    res.status(400).json({ message: error.message });
  }
});

router.get('/format-address', protect, async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ message: 'La dirección es requerida' });
    }

    const result = await geocodingService.geocodeAddress(address);
    const formattedAddress = geocodingService.formatAddress(result.address);

    res.json({
      formattedAddress,
      original: result
    });
  } catch (error) {
    logger.error('Error formateando dirección', { error: error.message });
    res.status(400).json({ message: error.message });
  }
});

export default router;