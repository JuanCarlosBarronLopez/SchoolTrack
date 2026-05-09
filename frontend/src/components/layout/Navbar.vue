<template>
  <nav class="navbar">
    <div class="navbar-content">
      <!-- Mobile Toggle -->
      <button 
        class="btn btn-link d-md-none" 
        @click="toggleSidebar"
        aria-label="Toggle sidebar"
      >
        <i class="fas fa-bars"></i>
      </button>
      
      <!-- Desktop Toggle -->
      <button 
        class="btn btn-link d-none d-md-block" 
        @click="toggleSidebar"
        aria-label="Toggle sidebar"
      >
        <i class="fas fa-bars"></i>
      </button>
      
      <!-- Page Title -->
      <div class="page-title">
        <h1>{{ pageTitle }}</h1>
      </div>
      
      <!-- Right Side -->
      <div class="navbar-actions">
        <!-- Notifications -->
        <div class="dropdown">
          <button 
            class="btn btn-link position-relative" 
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="fas fa-bell"></i>
            <span 
              v-if="unreadNotifications.length > 0" 
              class="badge bg-danger position-absolute top-0 end-0"
            >
              {{ unreadNotifications.length }}
            </span>
          </button>
          
          <ul class="dropdown-menu dropdown-menu-end">
            <li v-if="notifications.length === 0">
              <span class="dropdown-item text-muted">No hay notificaciones</span>
            </li>
            <li v-for="notification in notifications.slice(0, 5)" :key="notification.id">
              <a class="dropdown-item" href="#" @click.prevent="markAsRead(notification.id)">
                <div class="d-flex align-items-center">
                  <i :class="notification.icon" class="me-2"></i>
                  <div>
                    <div class="fw-bold">{{ notification.title }}</div>
                    <small class="text-muted">{{ notification.message }}</small>
                  </div>
                </div>
              </a>
            </li>
            <li v-if="notifications.length > 5">
              <hr class="dropdown-divider">
            </li>
            <li v-if="notifications.length > 5">
              <a class="dropdown-item text-center" href="#">Ver todas</a>
            </li>
          </ul>
        </div>
        
        <!-- User Menu -->
        <div class="dropdown">
          <button 
            class="btn btn-link d-flex align-items-center" 
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <span class="d-none d-md-block ms-2">{{ user?.name || 'Usuario' }}</span>
          </button>
          
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <router-link to="/profile" class="dropdown-item">
                <i class="fas fa-user me-2"></i>Perfil
              </router-link>
            </li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li>
              <a class="dropdown-item text-danger" href="#" @click.prevent="logout">
                <i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'Navbar',
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  emits: ['toggle-sidebar'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const router = useRouter()
    
    // Mock notifications - in real app this would come from API
    const notifications = ref([
      {
        id: 1,
        title: 'Nueva Ubicación',
        message: 'Vehículo R-123 actualizado',
        icon: 'fas fa-map-marker-alt',
        read: false
      },
      {
        id: 2,
        title: 'Ruta Completada',
        message: 'Ruta Matutina finalizada',
        icon: 'fas fa-check-circle',
        read: true
      }
    ])
    
    const pageTitle = computed(() => {
      const route = router.currentRoute.value
      const titles = {
        Dashboard: 'Dashboard',
        Vehicles: 'Vehículos',
        VehicleCreate: 'Nuevo Vehículo',
        VehicleDetail: 'Detalles del Vehículo',
        VehicleEdit: 'Editar Vehículo',
        Routes: 'Rutas',
        RouteCreate: 'Nueva Ruta',
        RouteDetail: 'Detalles de la Ruta',
        RouteEdit: 'Editar Ruta',
        Stops: 'Paradas',
        StopCreate: 'Nueva Parada',
        StopDetail: 'Detalles de la Parada',
        StopEdit: 'Editar Parada',
        Users: 'Usuarios',
        UserCreate: 'Nuevo Usuario',
        UserEdit: 'Editar Usuario',
        Tracking: 'Seguimiento en Tiempo Real',
        MapView: 'Mapa',
        Profile: 'Perfil'
      }
      return titles[route.name] || 'SchoolTrack'
    })
    
    const unreadNotifications = computed(() => 
      notifications.value.filter(n => !n.read)
    )
    
    const toggleSidebar = () => {
      emit('toggle-sidebar')
    }
    
    const logout = async () => {
      try {
        await authStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
      }
    }
    
    const markAsRead = (id) => {
      const notification = notifications.value.find(n => n.id === id)
      if (notification) {
        notification.read = true
      }
    }
    
    return {
      notifications,
      pageTitle,
      unreadNotifications,
      toggleSidebar,
      logout,
      markAsRead
    }
  }
}
</script>

<style scoped>
.navbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1020;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 60px;
}

.page-title h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar-actions .dropdown-toggle::after {
  display: none;
}

.user-avatar {
  font-size: 1.5rem;
  color: #64748b;
}

.dropdown-item {
  padding: 0.5rem 1rem;
}

.dropdown-item:hover {
  background-color: #f8fafc;
}

.btn-link {
  color: #64748b;
  text-decoration: none;
}

.btn-link:hover {
  color: #2563eb;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .navbar-content {
    padding: 0 1rem;
  }
  
  .page-title h1 {
    font-size: 1.25rem;
  }
}
</style>