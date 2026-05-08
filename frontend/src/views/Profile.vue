<template>
  <div class="profile-view">
    <h1>Mi Perfil</h1>
    <div class="profile-content">
      <p>InformaciÃ³n del usuario</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const user = ref({})
</script>

<style scoped>
.profile-view { padding: 2rem; }
.profile-content { background: white; padding: 2rem; border-radius: 8px; margin-top: 1rem; }
</style>
