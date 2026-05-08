import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const getAllVehicles = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const vehicles = await Vehicle.find(query)
      .populate('driver', 'name email phone')
      .populate('assignedRoute', 'name code')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments(query);
    res.json({ vehicles, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    logger.error('Error obteniendo vehículos', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('driver', 'name email phone avatar')
      .populate('assignedRoute', 'name code school');
    if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json(vehicle);
  } catch (error) {
    logger.error('Error obteniendo vehículo', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const vehicleData = req.body;
    const driver = await User.findById(vehicleData.driver);
    if (!driver) return res.status(400).json({ message: 'Conductor no encontrado' });
    if (driver.role !== 'driver') return res.status(400).json({ message: 'El usuario debe ser un conductor' });

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();
    await User.findByIdAndUpdate(vehicleData.driver, { assignedVehicle: vehicle._id });

    const populatedVehicle = await Vehicle.findById(vehicle._id).populate('driver', 'name email phone');
    res.status(201).json({ message: 'Vehículo creado exitosamente', vehicle: populatedVehicle });
  } catch (error) {
    logger.error('Error creando vehículo', { error: error.message });
    if (error.code === 11000) return res.status(400).json({ message: 'La placa ya existe' });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicleData = req.body;
    if (vehicleData.driver) {
      const driver = await User.findById(vehicleData.driver);
      if (!driver || driver.role !== 'driver') return res.status(400).json({ message: 'Conductor inválido' });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, vehicleData, { new: true, runValidators: true }).populate('driver', 'name email phone');
    if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json({ message: 'Vehículo actualizado exitosamente', vehicle });
  } catch (error) {
    logger.error('Error actualizando vehículo', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
    await User.findByIdAndUpdate(vehicle.driver, { assignedVehicle: null });
    res.json({ message: 'Vehículo eliminado exitosamente' });
  } catch (error) {
    logger.error('Error eliminando vehículo', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, {
      'currentLocation.latitude': latitude,
      'currentLocation.longitude': longitude,
      'currentLocation.timestamp': new Date()
    }, { new: true });
    if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json({ message: 'Ubicación actualizada exitosamente', vehicle });
  } catch (error) {
    logger.error('Error actualizando ubicación', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const getVehiclesNearLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;
    const vehicles = await Vehicle.find({
      'currentLocation': {
        $geoWithin: { $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], radius / 6378100] }
      },
      status: 'active'
    }).populate('driver', 'name email phone');
    res.json(vehicles);
  } catch (error) {
    logger.error('Error obteniendo vehículos cercanos', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export default {
  getAllVehicles, getVehicleById, createVehicle, updateVehicle,
  deleteVehicle, updateLocation, getVehiclesNearLocation
};
