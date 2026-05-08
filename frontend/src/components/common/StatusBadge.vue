<template>
  <span 
    class="status-badge" 
    :class="badgeClass"
    :title="tooltip"
  >
    <i v-if="icon" :class="iconClass" class="me-1"></i>
    {{ label }}
  </span>
</template>

<script>
export default {
  name: 'StatusBadge',
  props: {
    status: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'status',
      validator: value => ['status', 'role', 'type'].includes(value)
    },
    showIcon: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    badgeConfig() {
      const configs = {
        // Vehicle statuses
        active: { label: 'Activo', variant: 'success', icon: 'fas fa-check-circle' },
        inactive: { label: 'Inactivo', variant: 'secondary', icon: 'fas fa-pause-circle' },
        maintenance: { label: 'Mantenimiento', variant: 'warning', icon: 'fas fa-tools' },
        out_of_service: { label: 'Fuera de Servicio', variant: 'danger', icon: 'fas fa-exclamation-triangle' },
        
        // Route types
        pickup: { label: 'Recogida', variant: 'info', icon: 'fas fa-arrow-up' },
        dropoff: { label: 'Entrega', variant: 'primary', icon: 'fas fa-arrow-down' },
        both: { label: 'Ambos', variant: 'secondary', icon: 'fas fa-exchange-alt' },
        
        // User roles
        admin: { label: 'Administrador', variant: 'danger', icon: 'fas fa-user-shield' },
        driver: { label: 'Conductor', variant: 'primary', icon: 'fas fa-bus' },
        parent: { label: 'Padre/Madre', variant: 'info', icon: 'fas fa-user-friends' },
        school_admin: { label: 'Admin. Escuela', variant: 'success', icon: 'fas fa-school' }
      }
      
      return configs[this.status] || { 
        label: this.status, 
        variant: 'secondary', 
        icon: 'fas fa-circle' 
      }
    },
    label() {
      return this.badgeConfig.label
    },
    variant() {
      return this.badgeConfig.variant
    },
    icon() {
      return this.showIcon ? this.badgeConfig.icon : null
    },
    badgeClass() {
      return `badge bg-${this.variant}`
    },
    iconClass() {
      return this.icon
    },
    tooltip() {
      return `${this.type === 'status' ? 'Estado' : this.type}: ${this.label}`
    }
  }
}
</script>

<style scoped>
.status-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  display: inline-flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge i {
  font-size: 0.625rem;
}
</style>