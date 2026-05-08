import { defineStore } from 'pinia'
import api from '../services/api'

export const useStopsStore = defineStore('stops', {
  state: () => ({
    stops: [],
    currentStop: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isLoading: (state) => state.loading,
    stopsByRoute: (state) => (routeId) => state.stops.filter(s => s.route === routeId),
    stopsByStatus: (state) => (status) => state.stops.filter(s => s.status === status),
    stopsByType: (state) => (type) => state.stops.filter(s => s.type === type),
    activeStops: (state) => state.stops.filter(s => s.status === 'active')
  },
  
  actions: {
    setLoading(status) {
      this.loading = status
    },
    setError(error) {
      this.error = error
    },
    
    async fetchStops(params = {}) {
      this.setLoading(true)
      this.setError(null)
      try {
        const response = await api.get('/stops', { params })
        this.stops = response.data.stops || []
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al obtener paradas')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async fetchStop(id) {
      this.setLoading(true)
      this.setError(null)
      try {
        const response = await api.get(`/stops/${id}`)
        this.currentStop = response.data
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al obtener parada')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async createStop(stopData) {
      this.setLoading(true)
      this.setError(null)
      try {
        const response = await api.post('/stops', stopData)
        this.stops.unshift(response.data.stop)
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al crear parada')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async updateStop(id, data) {
      this.setLoading(true)
      this.setError(null)
      try {
        const response = await api.put(`/stops/${id}`, data)
        const updatedStop = response.data.stop
        
        const index = this.stops.findIndex(s => s._id === updatedStop._id)
        if (index !== -1) {
          this.stops.splice(index, 1, updatedStop)
        }
        if (this.currentStop?._id === updatedStop._id) {
          this.currentStop = updatedStop
        }
        
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al actualizar parada')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async deleteStop(id) {
      this.setLoading(true)
      this.setError(null)
      try {
        await api.delete(`/stops/${id}`)
        this.stops = this.stops.filter(s => s._id !== id)
        if (this.currentStop?._id === id) {
          this.currentStop = null
        }
        return { success: true }
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al eliminar parada')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async fetchStopsByRoute(routeId) {
      try {
        const response = await api.get(`/stops/route/${routeId}`)
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al obtener paradas de ruta')
        throw error
      }
    },
    
    async fetchNearbyStops(lat, lng, radius) {
      try {
        const response = await api.get(`/stops/nearby/${lat}/${lng}`, {
          params: { radius }
        })
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al obtener paradas cercanas')
        throw error
      }
    }
  }
})
