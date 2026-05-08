import { defineStore } from 'pinia'
import api from '../services/api'

export const useRoutesStore = defineStore('routes', {
  state: () => ({
    routes: [],
    currentRoute: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isLoading: (state) => state.loading,
    activeRoutes: (state) => state.routes.filter(r => r.status === 'active'),
    routesByStatus: (state) => (status) => state.routes.filter(r => r.status === status),
    routesBySchool: (state) => (schoolId) => state.routes.filter(r => r.school?._id === schoolId)
  },
  
  actions: {
    setLoading(status) {
      this.loading = status
    },
    setError(error) {
      this.error = error
    },
    
    async fetchRoutes(params = {}) {
      this.setLoading(true)
      this.setError(null)
      try {
        const response = await api.get('/routes', { params })
        this.routes = response.data.routes || []
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al obtener rutas')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async fetchRoute(id) {
      this.setLoading(true)
      this.setError(null)
      try {
        const response = await api.get(`/routes/${id}`)
        this.currentRoute = response.data
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al obtener ruta')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async createRoute(routeData) {
      this.setLoading(true)
      this.setError(null)
      try {
        const response = await api.post('/routes', routeData)
        this.routes.unshift(response.data.route)
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al crear ruta')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async updateRoute(id, data) {
      this.setLoading(true)
      this.setError(null)
      try {
        const response = await api.put(`/routes/${id}`, data)
        const updatedRoute = response.data.route
        
        const index = this.routes.findIndex(r => r._id === updatedRoute._id)
        if (index !== -1) {
          this.routes.splice(index, 1, updatedRoute)
        }
        if (this.currentRoute?._id === updatedRoute._id) {
          this.currentRoute = updatedRoute
        }
        
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al actualizar ruta')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async deleteRoute(id) {
      this.setLoading(true)
      this.setError(null)
      try {
        await api.delete(`/routes/${id}`)
        this.routes = this.routes.filter(r => r._id !== id)
        if (this.currentRoute?._id === id) {
          this.currentRoute = null
        }
        return { success: true }
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al eliminar ruta')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async assignVehicle(routeId, vehicleId) {
      try {
        const response = await api.post(`/routes/${routeId}/assign-vehicle`, { vehicleId })
        const updatedRoute = response.data.route
        
        const index = this.routes.findIndex(r => r._id === updatedRoute._id)
        if (index !== -1) {
          this.routes.splice(index, 1, updatedRoute)
        }
        if (this.currentRoute?._id === updatedRoute._id) {
          this.currentRoute = updatedRoute
        }
        
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al asignar vehículo')
        throw error
      }
    },
    
    async removeVehicle(routeId, vehicleId) {
      try {
        const response = await api.delete(`/routes/${routeId}/remove-vehicle`, { 
          data: { vehicleId } 
        })
        const updatedRoute = response.data.route
        
        const index = this.routes.findIndex(r => r._id === updatedRoute._id)
        if (index !== -1) {
          this.routes.splice(index, 1, updatedRoute)
        }
        if (this.currentRoute?._id === updatedRoute._id) {
          this.currentRoute = updatedRoute
        }
        
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al remover vehículo')
        throw error
      }
    },
    
    async fetchActiveRoutes() {
      try {
        const response = await api.get('/routes/active')
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al obtener rutas activas')
        throw error
      }
    }
  }
})
