<template>
  <div class="Stop-detail">
    <div class="header">
      <h1>Detalle de Parada</h1>
      <div class="actions">
        <router-link :to="{ name: 'StopEdit', params: { id: $route.params.id } }" class="btn-primary">
          Editar
        </router-link>
        <router-link :to="{ name: 'Stops' }" class="btn-secondary">
          Volver
        </router-link>
      </div>
    </div>
    <div class="content">
      <p>InformaciÃ³n detallada</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const item = ref(null)

onMounted(async () => {
  // Cargar datos del item
  console.log('Cargando item:', route.params.id)
})
</script>

<style scoped>
.Stop-detail {
  padding: 2rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.actions {
  display: flex;
  gap: 1rem;
}
.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border-radius: 4px;
  color: white;
}
.btn-primary {
  background: #3498db;
}
.btn-secondary {
  background: #95a5a6;
}
</style>
