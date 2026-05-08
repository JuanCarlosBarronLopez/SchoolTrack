import axios from 'axios';
import logger from '../utils/logger.js';

class RouteService {
  constructor() {
    this.graphHopperApiKey = process.env.GRAPHHOPPER_API_KEY;
    this.graphHopperBaseUrl = 'https://graphhopper.com/api/1';
  }

  async calculateRoute(stops) {
    try {
      if (!this.graphHopperApiKey) {
        throw new Error('GraphHopper API key no configurada');
      }

      const points = stops.map(stop =>
        `${stop.coordinates.latitude},${stop.coordinates.longitude}`
      ).join('&point=');

      const response = await axios.get(
        `${this.graphHopperBaseUrl}/route?point=${points}&vehicle=car&locale=es&key=${this.graphHopperApiKey}&calc_points=true&instructions=true`
      );

      if (response.data.paths && response.data.paths.length > 0) {
        const path = response.data.paths[0];
        return {
          distance: path.distance,
          time: path.time,
          points: path.points,
          instructions: path.instructions,
          bbox: path.bbox
        };
      }

      throw new Error('No se pudo calcular la ruta');
    } catch (error) {
      logger.error('Error calculando ruta con GraphHopper', { error: error.message });
      return this.calculateSimpleRoute(stops);
    }
  }

  async calculateRouteGeometry(stops) {
    try {
      const routeData = await this.calculateRoute(stops);

      if (routeData.points) {
        return this.decodePolyline(routeData.points);
      }

      return this.createSimpleGeometry(stops);
    } catch (error) {
      logger.error('Error calculando geometría', { error: error.message });
      return this.createSimpleGeometry(stops);
    }
  }

  calculateSimpleRoute(stops) {
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 0; i < stops.length - 1; i++) {
      const distance = this.calculateDistance(
        stops[i].coordinates,
        stops[i + 1].coordinates
      );
      totalDistance += distance;
      totalTime += (distance / 30) * 3600000;
    }

    return {
      distance: totalDistance * 1000,
      time: totalTime,
      points: null,
      instructions: [],
      bbox: null
    };
  }

  createSimpleGeometry(stops) {
    return stops.map(stop => [
      stop.coordinates.longitude,
      stop.coordinates.latitude
    ]);
  }

  calculateDistance(coord1, coord2) {
    const R = 6371;
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(coord1.latitude)) *
              Math.cos(this.toRadians(coord2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  decodePolyline(str) {
    const coordinates = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < str.length) {
      let shift = 0;
      let result = 0;
      let byte;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += deltaLng;

      coordinates.push([lng / 1e5, lat / 1e5]);
    }

    return coordinates;
  }

  async getETA(origin, destination) {
    try {
      const response = await axios.get(
        `${this.graphHopperBaseUrl}/route?point=${origin.latitude},${origin.longitude}&point=${destination.latitude},${destination.longitude}&vehicle=car&key=${this.graphHopperApiKey}`
      );

      if (response.data.paths && response.data.paths.length > 0) {
        return {
          duration: response.data.paths[0].time,
          distance: response.data.paths[0].distance
        };
      }

      const distance = this.calculateDistance(origin, destination);
      const duration = (distance / 30) * 3600000;

      return { duration, distance: distance * 1000 };
    } catch (error) {
      logger.error('Error calculando ETA', { error: error.message });

      const distance = this.calculateDistance(origin, destination);
      const duration = (distance / 30) * 3600000;

      return { duration, distance: distance * 1000 };
    }
  }

  async optimizeRoute(stops) {
    try {
      if (stops.length <= 2) {
        return stops;
      }

      const start = stops[0];
      const others = stops.slice(1);

      others.sort((a, b) => {
        const angleA = Math.atan2(
          a.coordinates.latitude - start.coordinates.latitude,
          a.coordinates.longitude - start.coordinates.longitude
        );
        const angleB = Math.atan2(
          b.coordinates.latitude - start.coordinates.latitude,
          b.coordinates.longitude - start.coordinates.longitude
        );
        return angleA - angleB;
      });

      return [start, ...others];
    } catch (error) {
      logger.error('Error optimizando ruta', { error: error.message });
      return stops;
    }
  }
}

export default new RouteService();