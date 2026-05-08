<template>
  <div class="Vehicle-form">
    <h1>{{ isEdit ? 'Editar' : 'Crear' }} VehÃ­culo</h1>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Nombre</label>
        <input v-model="form.name" type="text" required />
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-primary">Guardar</button>
        <router-link :to="{ name: 'Vehicles' }" class="btn-secondary">
          Cancelar
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const form = ref({ name: '' })

const handleSubmit = async () => {
  console.log('Guardando:', form.value)
  // Implementar lÃ³gica de guardado
  router.push({ name: 'Vehicles' })
}
</script>

<style scoped>
.Vehicle-form {
  padding: 2rem;
  max-width: 600px;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.form-actions {
  display: flex;
  gap: 1rem;
}
.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #95a5a6;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>
