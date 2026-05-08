import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
    initialized: false
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  
  actions: {
    setToken(token) {
      this.token = token
      if (token) {
        localStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
      }
    },
    
    setUser(user) {
      this.user = user
    },
    
    setInitialized(value) {
      this.initialized = value
    },
    
    logout() {
      this.token = null
      this.user = null
      this.initialized = false
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    },
    
    async login(credentials) {
      try {
        const { data } = await api.post('/auth/login', credentials)
        this.setToken(data.token)
        this.setUser(data.user)
        return data
      } catch (error) {
        console.error('Error en login:', error)
        throw error
      }
    },
    
    async fetchProfile() {
      if (!this.token) return
      try {
        const { data } = await api.get('/auth/profile')
        this.setUser(data)
      } catch (error) {
        console.error('Error al obtener perfil:', error)
        this.logout()
      }
    },
    
    async initializeAuth() {
      try {
        if (this.initialized) return
        const token = this.token || localStorage.getItem('token')
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          await this.fetchProfile()
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error)
        this.logout()
      } finally {
        this.setInitialized(true)
      }
    }
  }
})
