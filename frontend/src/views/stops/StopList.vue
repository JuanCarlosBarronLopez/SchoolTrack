<template>
  <div class="Stop-list">
    <div class="header">
      <h1>Paradas</h1>
      <router-link :to="{ name: 'StopCreate' }" class="btn-primary">
        Crear Parada
      </router-link>
    </div>
    <div class="content">
      <p>Lista de paradas</p>
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
.Stop-list {
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
