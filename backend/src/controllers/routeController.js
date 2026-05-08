import Route from '../models/Route.js';
import Stop from '../models/Stop.js';
import Vehicle from '../models/Vehicle.js';
import routeService from '../services/routeService.js';
import logger from '../utils/logger.js';

export const getAllRoutes = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const routes = await Route.find(query)
      .populate('stops.stop', 'name address coordinates')
      .populate('assignedVehicles', 'licensePlate model brand')
      .populate('createdBy', 'name email')
      .limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 });

    const total = await Route.countDocuments(query);
    res.json({ routes, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    logger.error('Error obteniendo rutas', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate({ path: 'stops.stop', populate: { path: 'students', select: 'firstName lastName studentId' } })
      .populate('assignedVehicles', 'licensePlate model brand color currentLocation')
      .populate('createdBy', 'name email');
    if (!route) return res.status(404).json({ message: 'Ruta no encontrada' });
    res.json(route);
  } catch (error) {
    logger.error('Error obteniendo ruta', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const createRoute = async (req, res) => {
  try {
    const routeData = req.body;
    routeData.createdBy = req.user.userId;

    if (routeData.stops && routeData.stops.length > 0) {
      const coordinates = await routeService.calculateRouteGeometry(routeData.stops);
      routeData.geometry = { type: 'LineString', coordinates };
    }

    const route = new Route(routeData);
    await route.save();
    const populatedRoute = await Route.findById(route._id)
      .populate('stops.stop', 'name address coordinates')
      .populate('assignedVehicles', 'licensePlate model brand')
      .populate('createdBy', 'name email');
    res.status(201).json({ message: 'Ruta creada exitosamente', route: populatedRoute });
  } catch (error) {
    logger.error('Error creando ruta', { error: error.message });
    if (error.code === 11000) return res.status(400).json({ message: 'El código de ruta ya existe' });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const updateRoute = async (req, res) => {
  try {
    const routeData = req.body;
    if (routeData.stops) {
      const coordinates = await routeService.calculateRouteGeometry(routeData.stops);
      routeData.geometry = { type: 'LineString', coordinates };
    }

    const route = await Route.findByIdAndUpdate(req.params.id, routeData, { new: true, runValidators: true })
      .populate('stops.stop', 'name address coordinates')
      .populate('assignedVehicles', 'licensePlate model brand')
      .populate('createdBy', 'name email');
    if (!route) return res.status(404).json({ message: 'Ruta no encontrada' });
    res.json({ message: 'Ruta actualizada exitosamente', route });
  } catch (error) {
    logger.error('Error actualizando ruta', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: 'Ruta no encontrada' });
    await Vehicle.updateMany({ assignedRoute: route._id }, { assignedRoute: null });
    res.json({ message: 'Ruta eliminada exitosamente' });
  } catch (error) {
    logger.error('Error eliminando ruta', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const assignVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: 'Ruta no encontrada' });

    if (!route.assignedVehicles.includes(vehicleId)) {
      route.assignedVehicles.push(vehicleId);
      await route.save();
    }
    vehicle.assignedRoute = route._id;
    await vehicle.save();

    const updatedRoute = await Route.findById(route._id).populate('assignedVehicles', 'licensePlate model brand color');
    res.json({ message: 'Vehículo asignado exitosamente', route: updatedRoute });
  } catch (error) {
    logger.error('Error asignando vehículo', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const removeVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.body;
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: 'Ruta no encontrada' });

    route.assignedVehicles = route.assignedVehicles.filter(v => v.toString() !== vehicleId);
    await route.save();
    await Vehicle.findByIdAndUpdate(vehicleId, { assignedRoute: null });
    res.json({ message: 'Vehículo removido exitosamente' });
  } catch (error) {
    logger.error('Error removiendo vehículo', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const getActiveRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ status: 'active' })
      .populate('assignedVehicles', 'licensePlate model brand currentLocation')
      .populate('stops.stop', 'name coordinates');
    res.json(routes);
  } catch (error) {
    logger.error('Error obteniendo rutas activas', { error: error.message });
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export default {
  getAllRoutes, getRouteById, createRoute, updateRoute,
  deleteRoute, assignVehicle, removeVehicle, getActiveRoutes
};