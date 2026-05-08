<template>
  <div class="Route-list">
    <div class="header">
      <h1>Rutas</h1>
      <router-link :to="{ name: 'RouteCreate' }" class="btn-primary">
        Crear Ruta
      </router-link>
    </div>
    <div class="content">
      <p>Lista de rutas</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const items = ref([])

onMounted(async () => {
  // Cargar datos
})
</script>

<style scoped>
.Route-list {
  padding: 2rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>
