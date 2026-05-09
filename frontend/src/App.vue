<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <!-- Layout con Sidebar: solo para usuarios autenticados con rol asignado -->
    <template v-if="showFullLayout">
      <Sidebar 
        :is-collapsed="isSidebarCollapsed" 
        :user="currentUser"
        @toggle="toggleSidebar"
      />
      <div class="main-content" :class="{ 'expanded': isSidebarCollapsed }">
        <Navbar 
          @toggle-sidebar="toggleSidebar"
          :user="currentUser"
          :is-dark-mode="isDarkMode"
          @toggle-dark-mode="toggleDarkMode"
        />
        <main class="content">
          <router-view />
        </main>
      </div>
      <div 
        v-if="!isSidebarCollapsed && isMobile" 
        class="mobile-overlay"
        @click="toggleSidebar"
      ></div>
    </template>

    <!-- Layout Minimal: para usuarios pendientes (solo Navbar superior, sin Sidebar) -->
    <template v-else-if="showMinimalLayout">
      <div class="main-content full-width">
        <Navbar 
          :user="currentUser"
          :is-dark-mode="isDarkMode"
          @toggle-dark-mode="toggleDarkMode"
          :hide-sidebar-toggle="true"
        />
        <main class="content">
          <router-view />
        </main>
      </div>
    </template>

    <!-- Sin layout: para rutas públicas (Landing, Login, Register) -->
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRoute } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const route = useRoute()
    
    const isSidebarCollapsed = ref(false)
    const isMobile = ref(false)
    const isDarkMode = ref(false)
    
    const currentUser = computed(() => authStore.user)
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    
    // Rutas públicas sin layout
    const publicRoutes = ['Landing', 'Login', 'Register', 'NotFound']
    
    const isPublicRoute = computed(() => {
      return publicRoutes.includes(route.name)
    })
    
    const isPendingUser = computed(() => {
      return isAuthenticated.value && currentUser.value?.role === 'user'
    })
    
    // Layout completo: autenticado y con rol asignado (no 'user')
    const showFullLayout = computed(() => {
      return isAuthenticated.value && !isPublicRoute.value && !isPendingUser.value
    })
    
    // Layout mínimo: autenticado pero pendiente (solo Navbar)
    const showMinimalLayout = computed(() => {
      return isAuthenticated.value && !isPublicRoute.value && isPendingUser.value
    })
    
    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    }
    
    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
      localStorage.setItem('schooltrack-dark-mode', isDarkMode.value ? 'true' : 'false')
    }
    
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768
      if (!isMobile.value) {
        isSidebarCollapsed.value = false
      }
    }
    
    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
      authStore.initializeAuth()
      
      // Restaurar preferencia de modo oscuro
      const savedDark = localStorage.getItem('schooltrack-dark-mode')
      if (savedDark === 'true') {
        isDarkMode.value = true
      }
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
    })
    
    return {
      isSidebarCollapsed,
      isMobile,
      isDarkMode,
      currentUser,
      isAuthenticated,
      showFullLayout,
      showMinimalLayout,
      toggleSidebar,
      toggleDarkMode
    }
  }
}
</script>

<style>
/* ========== VARIABLES DE TEMA ========== */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-card: #ffffff;
  --bg-input: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --accent-primary: #2563eb;
  --accent-hover: #1d4ed8;
  --navbar-bg: #ffffff;
  --sidebar-bg: linear-gradient(135deg, #2563eb, #1e40af);
}

.dark-mode {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: #1e293b;
  --bg-input: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border-color: #334155;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --accent-primary: #3b82f6;
  --accent-hover: #60a5fa;
  --navbar-bg: #1e293b;
  --sidebar-bg: linear-gradient(135deg, #1e3a5f, #0f172a);
}

/* ========== ESTILOS GLOBALES CON VARIABLES ========== */
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dark-mode body {
  background-color: var(--bg-primary);
}

/* Cards */
.dark-mode .card {
  background-color: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary);
}

.dark-mode .card-header {
  background-color: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.dark-mode .card-body {
  color: var(--text-primary);
}

/* Form Controls */
.dark-mode .form-control,
.dark-mode .form-select {
  background-color: var(--bg-input) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

.dark-mode .form-control:focus,
.dark-mode .form-select:focus {
  border-color: var(--accent-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25) !important;
}

.dark-mode .form-control::placeholder {
  color: var(--text-muted) !important;
}

.dark-mode .form-label {
  color: var(--text-secondary) !important;
}

/* Tables */
.dark-mode .table {
  color: var(--text-primary);
  border-color: var(--border-color);
}

.dark-mode .table th,
.dark-mode .table td {
  border-color: var(--border-color);
}

.dark-mode .table-striped > tbody > tr:nth-of-type(odd) > * {
  background-color: rgba(255, 255, 255, 0.03);
}

.dark-mode .table-hover > tbody > tr:hover > * {
  background-color: rgba(255, 255, 255, 0.06);
}

/* Dropdowns */
.dark-mode .dropdown-menu {
  background-color: var(--bg-card);
  border-color: var(--border-color);
}

.dark-mode .dropdown-item {
  color: var(--text-primary);
}

.dark-mode .dropdown-item:hover {
  background-color: var(--bg-input);
}

.dark-mode .dropdown-divider {
  border-color: var(--border-color);
}

/* Alerts */
.dark-mode .alert-info {
  background-color: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.dark-mode .alert-success {
  background-color: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.dark-mode .alert-danger {
  background-color: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

/* Modals */
.dark-mode .modal-content {
  background-color: var(--bg-card);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark-mode .modal-header {
  border-color: var(--border-color);
}

.dark-mode .modal-footer {
  border-color: var(--border-color);
}

.dark-mode .btn-close {
  filter: invert(1);
}

/* Text helpers */
.dark-mode .text-dark {
  color: var(--text-primary) !important;
}

.dark-mode .text-muted {
  color: var(--text-muted) !important;
}

.dark-mode h1, .dark-mode h2, .dark-mode h3, .dark-mode h4, .dark-mode h5, .dark-mode h6 {
  color: var(--text-primary);
}

/* Navbar dark mode */
.dark-mode .navbar {
  background: var(--navbar-bg) !important;
  border-bottom-color: var(--border-color) !important;
}

.dark-mode .navbar .page-title h1 {
  color: var(--text-primary) !important;
}

.dark-mode .navbar .btn-link {
  color: var(--text-secondary) !important;
}

/* Sidebar dark mode */
.dark-mode .sidebar {
  background: var(--sidebar-bg) !important;
}

/* Buttons */
.dark-mode .btn-outline-secondary {
  border-color: var(--border-color);
  color: var(--text-secondary);
}

.dark-mode .btn-outline-secondary:hover {
  background-color: var(--bg-input);
  color: var(--text-primary);
}

.dark-mode .btn-light {
  background-color: var(--bg-input);
  border-color: var(--border-color);
  color: var(--text-primary);
}

/* Scrollbar */
.dark-mode ::-webkit-scrollbar {
  width: 8px;
}

.dark-mode ::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

.dark-mode ::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

/* ========== LAYOUT ========== */
.full-width {
  margin-left: 0 !important;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0 !important;
  }
}
</style>