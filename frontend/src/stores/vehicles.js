import { defineStore } from 'pinia'
import api from '../services/api'

export const useVehiclesStore = defineStore('vehicles', {
  state: () => ({
    vehicles: []
  }),
  
  getters: {
    activeVehicles: (state) => state.vehicles.filter(v => v.status === 'active') || []
  },
  
  actions: {
    setVehicles(vehicles) {
      this.vehicles = vehicles
    },
    
    async fetchVehicles() {
      try {
        const response = await api.get('/vehicles')
        this.setVehicles(response.data.vehicles || response.data)
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        this.setVehicles([])
      }
    }
  }
})
