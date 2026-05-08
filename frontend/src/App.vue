<template>
  <div id="app">
    <!-- Sidebar -->
    <Sidebar 
      :is-collapsed="isSidebarCollapsed" 
      :user="currentUser"
      @toggle="toggleSidebar"
    />
    
    <!-- Main Content -->
    <div class="main-content" :class="{ 'expanded': isSidebarCollapsed }">
      <!-- Navbar -->
      <Navbar 
        @toggle-sidebar="toggleSidebar"
        :user="currentUser"
      />
      
      <!-- Page Content -->
      <main class="content">
        <router-view />
      </main>
    </div>
    
    <!-- Mobile Overlay -->
    <div 
      v-if="!isSidebarCollapsed && isMobile" 
      class="mobile-overlay"
      @click="toggleSidebar"
    ></div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from './stores/auth'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    
    // Reactive data
    const isSidebarCollapsed = ref(false)
    const isMobile = ref(false)
    
    // Computed
    const currentUser = computed(() => authStore.user)
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    
    // Methods
    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    }
    
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768
      if (!isMobile.value) {
        isSidebarCollapsed.value = false
      }
    }
    
    const handleResize = () => {
      checkMobile()
    }
    
    // Lifecycle
    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', handleResize)
      
      // Initialize auth
      authStore.initializeAuth()
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
    
    return {
      isSidebarCollapsed,
      isMobile,
      currentUser,
      isAuthenticated,
      toggleSidebar
    }
  }
}
</script>

<style>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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