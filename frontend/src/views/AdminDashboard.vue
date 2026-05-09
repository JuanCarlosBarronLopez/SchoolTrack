<template>
  <div class="dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Dashboard</h1>
      <p class="text-muted">Bienvenido a SchoolTrack - Sistema de Seguimiento de Transporte Escolar</p>
    </div>
    
    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="stats-card">
          <div class="stats-icon bg-primary">
            <i class="fas fa-bus"></i>
          </div>
          <div class="stats-content">
            <h3>{{ stats.totalVehicles }}</h3>
            <p>Vehículos Activos</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3">
        <div class="stats-card">
          <div class="stats-icon bg-success">
            <i class="fas fa-route"></i>
          </div>
          <div class="stats-content">
            <h3>{{ stats.totalRoutes }}</h3>
            <p>Rutas Activas</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3">
        <div class="stats-card">
          <div class="stats-icon bg-info">
            <i class="fas fa-map-pin"></i>
          </div>
          <div class="stats-content">
            <h3>{{ stats.totalStops }}</h3>
            <p>Paradas</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3">
        <div class="stats-card">
          <div class="stats-icon bg-warning">
            <i class="fas fa-users"></i>
          </div>
          <div class="stats-content">
            <h3>{{ stats.totalUsers }}</h3>
            <p>Usuarios</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="row">
      <!-- Map Section -->
      <div class="col-lg-8 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-map-marked-alt me-2"></i>
              Ubicación de Vehículos en Tiempo Real
            </h5>
          </div>
          <div class="card-body">
            <MapView 
              :vehicles="activeVehicles" 
              :show-controls="false"
              height="400px"
            />
          </div>
        </div>
      </div>
      
      <!-- Live Updates -->
      <div class="col-lg-4 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-clock me-2"></i>
              Actualizaciones en Vivo
            </h5>
          </div>
          <div class="card-body">
            <div class="live-updates">
              <div 
                v-for="update in liveUpdates" 
                :key="update.id"
                class="update-item"
              >
                <div class="update-time">{{ formatTime(update.timestamp) }}</div>
                <div class="update-content">
                  <div class="update-title">{{ update.title }}</div>
                  <div class="update-message">{{ update.message }}</div>
                </div>
                <div class="update-status">
                  <span :class="`status-indicator status-${update.type}`"></span>
                </div>
              </div>
              
              <div v-if="liveUpdates.length === 0" class="text-center text-muted py-4">
                <i class="fas fa-info-circle fa-2x mb-2"></i>
                <p>No hay actualizaciones recientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity & Quick Actions -->
    <div class="row">
      <!-- Recent Activity -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-history me-2"></i>
              Actividad Reciente
            </h5>
          </div>
          <div class="card-body">
            <div class="activity-list">
              <div 
                v-for="activity in recentActivity" 
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon" :class="`bg-${activity.type}`">
                  <i :class="activity.icon"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-time">{{ formatDate(activity.timestamp) }}</div>
                </div>
              </div>
              
              <div v-if="recentActivity.length === 0" class="text-center text-muted py-4">
                <i class="fas fa-clock fa-2x mb-2"></i>
                <p>No hay actividad reciente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-bolt me-2"></i>
              Acciones Rápidas
            </h5>
          </div>
          <div class="card-body">
            <div class="quick-actions">
              <router-link to="/vehicles/create" class="action-btn">
                <div class="action-icon bg-primary">
                  <i class="fas fa-plus"></i>
                </div>
                <div class="action-content">
                  <h6>Agregar Vehículo</h6>
                  <p class="text-muted small">Registrar nuevo vehículo</p>
                </div>
              </router-link>
              
              <router-link to="/routes/create" class="action-btn">
                <div class="action-icon bg-success">
                  <i class="fas fa-route"></i>
                </div>
                <div class="action-content">
                  <h6>Crear Ruta</h6>
                  <p class="text-muted small">Definir nueva ruta</p>
                </div>
              </router-link>
              
              <router-link to="/stops/create" class="action-btn">
                <div class="action-icon bg-info">
                  <i class="fas fa-map-pin"></i>
                </div>
                <div class="action-content">
                  <h6>Agregar Parada</h6>
                  <p class="text-muted small">Añadir punto de parada</p>
                </div>
              </router-link>
              
              <router-link to="/tracking" class="action-btn">
                <div class="action-icon bg-warning">
                  <i class="fas fa-location-arrow"></i>
                </div>
                <div class="action-content">
                  <h6>Ver Tracking</h6>
                  <p class="text-muted small">Seguimiento en vivo</p>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useVehiclesStore } from '../stores/vehicles'
import { useRoutesStore } from '../stores/routes'
import { useStopsStore } from '../stores/stops'
import MapView from '../components/maps/MapView.vue'
import api from '../services/api'

export default {
  name: 'Dashboard',
  components: {
    MapView
  },
  setup() {
    const vehiclesStore = useVehiclesStore()
    const routesStore = useRoutesStore()
    const stopsStore = useStopsStore()
    
    // Stats data
    const stats = ref({
      totalVehicles: 12,
      totalRoutes: 8,
      totalStops: 45,
      totalUsers: 28
    })
    
    // No live updates by default
    const liveUpdates = ref([])
    
    // No recent activity by default
    const recentActivity = ref([])
    
    const activeVehicles = computed(() => {
      return vehiclesStore.activeVehicles
    })
    
    // Methods
    const formatTime = (date) => {
      return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(
        Math.ceil((date - new Date()) / 60000),
        'minute'
      )
    }
    
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('es', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      }).format(date)
    }
    
    // Lifecycle
    onMounted(async () => {
      try {
        await vehiclesStore.fetchVehicles()
        await routesStore.fetchRoutes()
        await stopsStore.fetchStops()
        
        // Get real users count
        let totalUsersCount = 0
        try {
          const usersRes = await api.get('/users')
          if (usersRes.data && usersRes.data.data) {
            totalUsersCount = usersRes.data.data.length
          } else if (Array.isArray(usersRes.data)) {
            totalUsersCount = usersRes.data.length
          }
        } catch (err) {
          console.error('Error fetching users:', err)
        }

        // Update stats with real data
        stats.value = {
          totalVehicles: vehiclesStore.vehicles.length,
          totalRoutes: routesStore.routes.length,
          totalStops: stopsStore.stops.length,
          totalUsers: totalUsersCount
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    })
    
    return {
      stats,
      liveUpdates,
      recentActivity,
      activeVehicles,
      formatTime,
      formatDate
    }
  }
}
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.5s ease-in;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

/* Stats Cards */
.stats-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stats-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.stats-content p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

/* Live Updates */
.live-updates {
  max-height: 400px;
  overflow-y: auto;
}

.update-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.update-item:last-child {
  border-bottom: none;
}

.update-time {
  font-size: 0.75rem;
  color: #64748b;
  min-width: 60px;
}

.update-content {
  flex: 1;
}

.update-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.update-message {
  font-size: 0.75rem;
  color: #64748b;
}

.update-status {
  display: flex;
  align-items: center;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Activity List */
.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.75rem;
  color: #64748b;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #f8fafc;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.action-content {
  flex: 1;
}

.action-content h6 {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.action-content p {
  margin: 0;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeIn 0.5s ease-out;
}
</style>
