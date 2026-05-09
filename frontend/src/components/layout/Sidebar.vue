<template>
  <aside 
    class="sidebar" 
    :class="{ 'collapsed': isCollapsed, 'mobile-open': isMobileOpen }"
  >
    <div class="sidebar-header">
      <div class="logo">
        <i class="fas fa-bus"></i>
        <span v-show="!isCollapsed">SchoolTrack</span>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li class="nav-item">
          <router-link to="/" class="nav-link" exact-active-class="active">
            <i class="fas fa-tachometer-alt"></i>
            <span v-show="!isCollapsed">Dashboard</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/map" class="nav-link" active-class="active">
            <i class="fas fa-map-marked-alt"></i>
            <span v-show="!isCollapsed">Mapa</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/tracking" class="nav-link" active-class="active">
            <i class="fas fa-location-arrow"></i>
            <span v-show="!isCollapsed">Tracking</span>
          </router-link>
        </li>
        
        <li class="nav-divider" v-show="!isCollapsed"></li>
        
        <li class="nav-item">
          <router-link to="/vehicles" class="nav-link" active-class="active">
            <i class="fas fa-bus"></i>
            <span v-show="!isCollapsed">Vehículos</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/routes" class="nav-link" active-class="active">
            <i class="fas fa-route"></i>
            <span v-show="!isCollapsed">Rutas</span>
          </router-link>
        </li>
        
        <li class="nav-item">
          <router-link to="/stops" class="nav-link" active-class="active">
            <i class="fas fa-map-pin"></i>
            <span v-show="!isCollapsed">Paradas</span>
          </router-link>
        </li>
        
        <li class="nav-divider" v-show="!isCollapsed && user?.role === 'admin'"></li>
        
        <li class="nav-item" v-if="user?.role === 'admin'">
          <router-link to="/users" class="nav-link" active-class="active">
            <i class="fas fa-users"></i>
            <span v-show="!isCollapsed">Usuarios</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <div class="sidebar-footer" v-show="!isCollapsed">
      <div class="user-info">
        <div class="user-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="user-details">
          <div class="user-name">{{ user?.name || 'Usuario' }}</div>
          <div class="user-role">{{ getRoleName(user?.role) }}</div>
        </div>
      </div>
      
      <div class="sidebar-actions">
        <router-link to="/profile" class="btn btn-sm btn-outline-light">
          <i class="fas fa-cog"></i>
        </router-link>
        <button class="btn btn-sm btn-outline-light" @click="logout">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  </aside>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'Sidebar',
  props: {
    isCollapsed: {
      type: Boolean,
      default: false
    },
    isMobileOpen: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: null
    }
  },
  emits: ['toggle'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const getRoleName = (role) => {
      const roles = {
        admin: 'Administrador',
        driver: 'Conductor',
        parent: 'Padre/Madre',
        school_admin: 'Admin. Escuela'
      }
      return roles[role] || 'Usuario'
    }
    
    const toggleSidebar = () => {
      emit('toggle')
    }
    
    const logout = async () => {
      try {
        await authStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
      }
    }
    
    return {
      getRoleName,
      toggleSidebar,
      logout
    }
  }
}
</script>

<style scoped>
.sidebar {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  gap: 0.75rem;
}

.logo i {
  font-size: 1.75rem;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 0 8px 8px 0;
  margin-right: 1rem;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.nav-link.active {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border-right: 3px solid white;
}

.nav-link i {
  width: 20px;
  text-align: center;
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.nav-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 1rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.user-avatar {
  font-size: 2rem;
  margin-right: 0.75rem;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
}

.user-role {
  font-size: 0.75rem;
  opacity: 0.8;
}

.sidebar-actions {
  display: flex;
  gap: 0.5rem;
}

.sidebar-actions .btn {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
}

/* Collapsed state */
.sidebar.collapsed {
  width: 70px;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  margin-right: 0;
  padding: 0.75rem 0;
}

.sidebar.collapsed .nav-link i {
  margin-right: 0;
  font-size: 1.25rem;
}

.sidebar.collapsed .logo {
  justify-content: center;
}

.sidebar.collapsed .logo span {
  display: none;
}

/* Mobile styles */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1050;
    transform: translateX(-100%);
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
}
</style>