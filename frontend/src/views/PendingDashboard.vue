<template>
  <div class="pending-dashboard container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6 text-center">
        <div class="card shadow-sm border-0">
          <div class="card-body p-5">
            <div class="status-icon mb-4">
              <i class="fas fa-user-clock text-warning"></i>
            </div>
            
            <h2 class="mb-3">Cuenta en Revisión</h2>
            
            <p class="text-muted mb-4">
              Hola, <strong>{{ authStore.user?.firstName }}</strong>. Tu cuenta ha sido registrada con éxito y actualmente está clasificada como <strong>Usuario General</strong>.
            </p>
            
            <div class="alert alert-info text-start mb-4">
              <h5 class="alert-heading"><i class="fas fa-info-circle me-2"></i>¿Qué sigue?</h5>
              <p class="mb-0">Para proteger la seguridad de los estudiantes, un administrador de la escuela debe verificar tu identidad y asignarte el rol correspondiente (Padre/Tutor, Conductor o Alumno).</p>
            </div>
            
            <p class="mb-4 text-muted small">
              Si ya solicitaste tu asignación, por favor espera a que la escuela procese la solicitud. Una vez asignado tu rol, las pantallas correspondientes aparecerán aquí automáticamente.
            </p>
            
            <router-link to="/profile" class="btn btn-primary px-4">
              <i class="fas fa-user-edit me-2"></i>Completar mi Perfil
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>

<style scoped>
.pending-dashboard {
  animation: fadeIn 0.5s ease-in;
}

.status-icon i {
  font-size: 5rem;
  opacity: 0.9;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
