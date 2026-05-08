import { defineStore } from 'pinia'
import api from '../services/api'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isLoading: (state) => state.loading,
    drivers: (state) => state.users.filter(u => u.role === 'driver'),
    admins: (state) => state.users.filter(u => u.role === 'admin'),
    parents: (state) => state.users.filter(u => u.role === 'parent'),
    activeUsers: (state) => state.users.filter(u => u.isActive),
    usersByRole: (state) => (role) => state.users.filter(u => u.role === role)
  },
  
  actions: {
    setLoading(status) {
      this.loading = status
    },
    setError(error) {
      this.error = error
    },
    
    async fetchUsers(params = {}) {
      this.setLoading(true)
      this.setError(null)
      try {
        const response = await api.get('/users', { params })
        this.users = response.data.users || []
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al obtener usuarios')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async fetchUser(id) {
      this.setLoading(true)
      this.setError(null)
      try {
        const response = await api.get(`/users/${id}`)
        this.currentUser = response.data
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al obtener usuario')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async createUser(userData) {
      this.setLoading(true)
      this.setError(null)
      try {
        const response = await api.post('/users', userData)
        this.users.unshift(response.data.user)
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al crear usuario')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async updateUser(id, data) {
      this.setLoading(true)
      this.setError(null)
      try {
        const response = await api.put(`/users/${id}`, data)
        const updatedUser = response.data.user
        
        const index = this.users.findIndex(u => u._id === updatedUser._id)
        if (index !== -1) {
          this.users.splice(index, 1, updatedUser)
        }
        if (this.currentUser?._id === updatedUser._id) {
          this.currentUser = updatedUser
        }
        
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al actualizar usuario')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async deleteUser(id) {
      this.setLoading(true)
      this.setError(null)
      try {
        await api.delete(`/users/${id}`)
        this.users = this.users.filter(u => u._id !== id)
        if (this.currentUser?._id === id) {
          this.currentUser = null
        }
        return { success: true }
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al eliminar usuario')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
    
    async fetchAvailableDrivers() {
      try {
        const response = await api.get('/users/drivers/available')
        return response.data
      } catch (error) {
        this.setError(error.response?.data?.message || 'Error al obtener conductores disponibles')
        throw error
      }
    }
  }
})
