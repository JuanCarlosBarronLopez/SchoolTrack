import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    isLoading: false,
    notifications: [],
    sidebarCollapsed: false
  }),
  actions: {
    setLoading(status) {
      this.isLoading = status
    },
    showNotification(notification) {
      const id = Date.now()
      this.notifications.push({ id, ...notification })
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        this.removeNotification(id)
      }, 5000)
    },
    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    }
  }
})
