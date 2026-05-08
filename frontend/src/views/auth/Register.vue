<template>
  <div class="register-view">
    <div class="register-card">
      <h1>Registro</h1>
      <form @submit.prevent="handleRegister">
        <input v-model="form.firstName" type="text" placeholder="Nombre" required />
        <input v-model="form.lastName" type="text" placeholder="Apellido" required />
        <input v-model="form.email" type="email" placeholder="Email" required />
        <input v-model="form.password" type="password" placeholder="ContraseÃ±a" required />
        <button type="submit">Registrarse</button>
      </form>
      <router-link to="/login">Â¿Ya tienes cuenta? Inicia sesiÃ³n</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const form = ref({ firstName: '', lastName: '', email: '', password: '' })
const handleRegister = () => { console.log('Register:', form.value) }
</script>

<style scoped>
.register-view { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
.register-card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; width: 100%; }
.register-card form { display: flex; flex-direction: column; gap: 1rem; margin: 1.5rem 0; }
.register-card input { padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; }
.register-card button { padding: 0.75rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; }
</style>
