<template>
  <div class="parent-dashboard">
    <div class="page-header">
      <h1>Panel Familiar</h1>
      <p class="text-muted">Supervisa el estado y ubicación de tus hijos</p>
    </div>
    
    <div class="row">
      <!-- Tracking Map -->
      <div class="col-lg-8 mb-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-map-marked-alt me-2"></i>
              Ubicación en Tiempo Real
            </h5>
          </div>
          <div class="card-body p-0">
            <!-- Using the Tracking view we built earlier -->
            <Tracking style="height: 450px;" />
          </div>
        </div>
      </div>
      
      <!-- Children List & QRs -->
      <div class="col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-child me-2"></i>
              Estudiantes
            </h5>
          </div>
          <div class="card-body">
            <div class="student-list">
              <!-- Placeholder for now, in a real app this would loop over user's children -->
              <div class="student-card" @click="selectedStudent = '1'">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6>Juan Pérez</h6>
                    <span class="badge bg-success">En ruta a casa</span>
                  </div>
                  <button class="btn btn-sm btn-outline-primary">Ver QR</button>
                </div>
              </div>
              
              <div class="student-card mt-3" @click="selectedStudent = '2'">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6>María Pérez</h6>
                    <span class="badge bg-secondary">En la escuela</span>
                  </div>
                  <button class="btn btn-sm btn-outline-primary">Ver QR</button>
                </div>
              </div>
            </div>
            
            <div v-if="selectedStudent" class="mt-4 border-top pt-4">
              <StudentQR 
                :studentId="selectedStudent" 
                :studentName="selectedStudent === '1' ? 'Juan Pérez' : 'María Pérez'" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Tracking from './Tracking.vue';
import StudentQR from '../components/qr/StudentQR.vue';

const selectedStudent = ref(null);
</script>

<style scoped>
.parent-dashboard {
  animation: fadeIn 0.5s ease-in;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
}

.student-card {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.student-card:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.student-card h6 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
