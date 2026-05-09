<template>
  <div class="qr-container">
    <div class="qr-card">
      <h3>Credencial de Estudiante</h3>
      <div class="student-info">
        <h4>{{ studentName }}</h4>
        <p>ID: {{ studentId }}</p>
      </div>
      
      <div class="qr-code-wrapper" v-if="qrValue">
        <qrcode-vue :value="qrValue" :size="200" level="H" />
      </div>
      <div v-else class="qr-placeholder">
        <p>Generando código...</p>
      </div>
      
      <p class="instruction">Muestra este código al conductor al subir y bajar del vehículo.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import QrcodeVue from 'qrcode.vue';
import api from '@/services/api';

const props = defineProps({
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    default: 'Estudiante'
  }
});

const qrValue = ref('');

onMounted(async () => {
  try {
    // Intentar generar o recuperar el código QR desde el backend
    const response = await api.post(`/qr/generate/student/${props.studentId}`);
    if (response.data && response.data.student && response.data.student.qrCode) {
      qrValue.value = response.data.student.qrCode;
    }
  } catch (error) {
    console.error('Error al generar QR:', error);
    // Fallback: usar el ID del estudiante temporalmente si falla la API
    qrValue.value = `STU_${props.studentId}`;
  }
});
</script>

<style scoped>
.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.qr-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 350px;
  width: 100%;
  border: 1px solid #eee;
}

h3 {
  color: #3f51b5;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.student-info {
  margin-bottom: 1.5rem;
}

.student-info h4 {
  margin: 0;
  font-size: 1.4rem;
  color: #333;
}

.student-info p {
  margin: 0.2rem 0 0;
  color: #666;
  font-size: 0.9rem;
}

.qr-code-wrapper {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  display: inline-block;
  border: 2px solid #f0f0f0;
}

.qr-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  border-radius: 8px;
  color: #999;
}

.instruction {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: #777;
  line-height: 1.4;
}
</style>
