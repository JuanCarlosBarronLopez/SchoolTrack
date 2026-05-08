import jwt from 'jsonwebtoken';
import Location from '../models/Location.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

class LocationService {
  constructor() {
    this.io = null;
    this.activeDrivers = new Map();
  }

  initializeSocket(io) {
    this.io = io;

    io.on('connection', async (socket) => {
      try {
        const { token } = socket.handshake.auth || {};
        if (!token) throw new Error('Token no proporcionado');

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);
        if (!user || user.role !== 'driver') throw new Error('Usuario no autorizado');

        this.activeDrivers.set(user._id.toString(), socket.id);
        logger.info(`🚗 Conductor conectado: ${user.name} (${socket.id})`);

        socket.on('location-update', async (data) => {
          data.driverId = user._id;
          await this.handleLocationUpdate(data, socket);
        });

        socket.on('disconnect', () => {
          this.activeDrivers.delete(user._id.toString());
          logger.info(`❌ Conductor ${user.name} desconectado`);
        });

      } catch (err) {
        logger.error('❗ Conexión Socket rechazada', { error: err.message });
        socket.disconnect(true);
      }
    });
  }

  async handleLocationUpdate(data, socket) {
    try {
      const { vehicleId, driverId, latitude, longitude, speed, heading, timestamp } = data;
      if (!vehicleId || !driverId || !latitude || !longitude) {
        socket.emit('error', { message: 'Datos de ubicación inválidos' });
        return;
      }

      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle || vehicle.driver.toString() !== driverId.toString()) {
        socket.emit('error', { message: 'Vehículo no válido o no asignado al conductor' });
        return;
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      const location = new Location({
        vehicle: vehicleId,
        driver: driverId,
        coordinates: { latitude: lat, longitude: lng },
        coords: { type: 'Point', coordinates: [lng, lat] },
        speed: speed || 0,
        heading: heading || 0,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        route: vehicle.assignedRoute
      });

      await location.save();
      await Vehicle.findByIdAndUpdate(vehicleId, {
        'currentLocation.latitude': lat,
        'currentLocation.longitude': lng,
        'currentLocation.timestamp': new Date()
      });

      this.io.emit('vehicle-location-update', {
        vehicleId,
        driverId,
        location: { latitude: lat, longitude: lng, speed, heading, timestamp: location.timestamp }
      });

      if (vehicle.assignedRoute) {
        this.io.to(`route-${vehicle.assignedRoute}`).emit('route-vehicle-update', {
          vehicleId,
          location: { latitude: lat, longitude: lng },
          routeId: vehicle.assignedRoute
        });
      }

    } catch (error) {
      logger.error('Error al procesar ubicación', { error: error.message, stack: error.stack });
      socket.emit('error', { message: 'Error procesando ubicación' });
    }
  }

  async getRouteVehicleLocations(routeId) {
    const vehicles = await Vehicle.find({ assignedRoute: routeId, status: 'active' });
    const vehicleLocations = [];

    for (const vehicle of vehicles) {
      const latest = await Location.findOne({ vehicle: vehicle._id })
        .sort({ timestamp: -1 })
        .limit(1)
        .populate('driver', 'name');
      vehicleLocations.push({
        vehicle: vehicle.toJSON(),
        location: latest || vehicle.currentLocation
      });
    }
    return vehicleLocations;
  }
}

export default new LocationService();