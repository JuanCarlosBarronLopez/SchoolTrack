import { defineStore } from 'pinia'
import api from '../services/api'
import io from 'socket.io-client'

export const useLocationsStore = defineStore('locations', {
  state: () => ({
    locations: [],
    currentLocation: null,
    vehicleLocations: new Map(), // vehicleId -> location
    loading: false,
    error: null,
    socket: null
  }),
  
  getters: {
    getVehicleLocation: (state) => (vehicleId) => state.vehicleLocations.get(vehicleId),
    isLoading: (state) => state.loading,
    isConnected: (state) => state.socket && state.socket.connected,
    recentLocations: (state) => state.locations.slice(0, 50),
    locationsByVehicle: (state) => (vehicleId) => 
      state.locations.filter(loc => loc.vehicle === vehicleId)
  },
  
  actions: {
    setLoading(status) {
      this.loading = status
    },
    setError(error) {
      this.error = error
    },
    addLocation(location) {
      this.locations.unshift(location)
      if (location.vehicle) {
        this.vehicleLocations.set(location.vehicle._id || location.vehicle, location)
      }
    },
    setVehicleLocation(vehicleId, location) {
      this.vehicleLocations.set(vehicleId, location)
    },
    
    async fetchVehicleLocationHistory(vehicleId, params = {}) {
      this.setLoading(true)
      this.setError(null)
      try {
        const response = await api.get('/locations/history', {
          params: { vehicleId, ...params }
        })
        this.locations = response.data.history || []
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al obtener historial')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async calculateETA(vehicleId, destination) {
      try {
        const response = await api.get('/locations/eta', {
          params: {
            vehicleId,
            lat: destination.latitude,
            lon: destination.longitude
          }
        })
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al calcular ETA')
        throw error
      }
    },
    
    async fetchRouteVehicles(routeId) {
      try {
        const response = await api.get(`/locations/route/${routeId}`)
        response.data.vehicles.forEach(({ vehicle, location }) => {
          this.setVehicleLocation(vehicle._id, location)
        })
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al obtener vehículos')
        throw error
      }
    },
    
    async fetchVehiclesInArea(bounds) {
      try {
        const response = await api.get('/locations/area', { params: bounds })
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error en área')
        throw error
      }
    },
    
    initializeSocket() {
      if (this.socket) return
      
      const socket = io(process.env.VUE_APP_API_URL || 'http://localhost:3000')
      this.socket = socket
      
      socket.on('vehicle-location-update', (data) => {
        this.addLocation(data)
      })
      
      socket.on('route-vehicle-update', (data) => {
        this.setVehicleLocation(data.vehicleId, data.location)
      })
      
      return socket
    },
    
    subscribeToRoute(routeId) {
      if (this.socket) {
        this.socket.emit('subscribe-route', routeId)
      }
    },
    
    unsubscribeFromRoute(routeId) {
      if (this.socket) {
        this.socket.emit('unsubscribe-route', routeId)
      }
    },
    
    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
    }
  }
})
