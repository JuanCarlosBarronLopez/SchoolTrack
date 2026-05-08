<template>
  <div class="Vehicle-list">
    <div class="header">
      <h1>VehÃ­culos</h1>
      <router-link :to="{ name: 'VehicleCreate' }" class="btn-primary">
        Crear VehÃ­culo
      </router-link>
    </div>
    <div class="content">
      <p>Lista de vehÃ­culos</p>
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
.Vehicle-list {
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
