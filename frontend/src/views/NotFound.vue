<template>
  <div class="not-found">
    <h1>404</h1>
    <p>PÃ¡gina no encontrada</p>
    <router-link to="/" class="btn-primary">Volver al inicio</router-link>
  </div>
</template>

<style scoped>
.not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
.not-found h1 { font-size: 4rem; color: #e74c3c; }
.btn-primary { margin-top: 2rem; padding: 0.75rem 1.5rem; background: #3498db; color: white; text-decoration: none; border-radius: 4px; }
</style>
