<template>
  <div class="scanner-container">
    <div class="scanner-card">
      <h2>Escáner de Pasajeros</h2>
      
      <div class="controls">
        <div class="action-toggle">
          <button 
            :class="{ active: scanAction === 'pickup' }" 
            @click="scanAction = 'pickup'"
          >
            Subida (Pickup)
          </button>
          <button 
            :class="{ active: scanAction === 'dropoff' }" 
            @click="scanAction = 'dropoff'"
          >
            Bajada (Dropoff)
          </button>
        </div>
      </div>
      
      <div v-if="error" class="error-msg">
        {{ error }}
      </div>
      
      <div v-if="success" class="success-msg">
        {{ success }}
      </div>

      <div class="scanner-viewport">
        <div id="reader" width="100%"></div>
      </div>
      
      <div class="scanner-status" :class="{ scanning: isScanning }">
        {{ isScanning ? 'Cámara activa - Apunta al código QR' : 'Iniciando cámara...' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '@/services/api';

const props = defineProps({
  vehicleId: {
    type: String,
    required: true
  }
});

const scanAction = ref('pickup'); // 'pickup' o 'dropoff'
const isScanning = ref(false);
const error = ref('');
const success = ref('');
let scanner = null;
let lastScannedCode = '';
let scanTimeout = null;

onMounted(() => {
  // Initialize the scanner
  scanner = new Html5QrcodeScanner(
    "reader", 
    { fps: 10, qrbox: { width: 250, height: 250 } },
    /* verbose= */ false
  );
  
  scanner.render(onScanSuccess, onScanFailure);
  isScanning.value = true;
});

onUnmounted(() => {
  if (scanner) {
    scanner.clear().catch(e => console.error('Failed to clear scanner', e));
  }
  if (scanTimeout) clearTimeout(scanTimeout);
});

const onScanSuccess = async (decodedText) => {
  // Prevent duplicate scans within 3 seconds
  if (decodedText === lastScannedCode) return;
  
  lastScannedCode = decodedText;
  if (scanTimeout) clearTimeout(scanTimeout);
  
  // Reset last scanned after 3 seconds so they can scan again if needed
  scanTimeout = setTimeout(() => {
    lastScannedCode = '';
  }, 3000);

  try {
    error.value = '';
    success.value = 'Procesando...';
    
    // Asumimos que el texto del QR es el ID o un código especial (ej. STU_12345_123)
    const response = await api.post('/qr/scan/student', {
      qrCode: decodedText,
      vehicleId: props.vehicleId,
      action: scanAction.value
    });
    
    if (response.data && response.data.success) {
      success.value = `¡Éxito! ${response.data.student.name} registrado.`;
      
      // Clear success message after a bit
      setTimeout(() => {
        if (success.value.includes('¡Éxito!')) success.value = '';
      }, 3000);
    }
  } catch (err) {
    console.error('Scan error:', err);
    success.value = '';
    error.value = err.response?.data?.message || 'Error al registrar el código QR';
    
    setTimeout(() => {
      error.value = '';
    }, 4000);
  }
};

const onScanFailure = (error) => {
  // Se llama en cada frame que falla (es normal), lo ignoramos
  // console.warn(`Code scan error = ${error}`);
};
</script>

<style scoped>
.scanner-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.scanner-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 500px;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.controls {
  margin-bottom: 1.5rem;
}

.action-toggle {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.action-toggle button {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.action-toggle button.active {
  background: #3b82f6;
  color: white;
}

.scanner-viewport {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 2px solid #e2e8f0;
}

.scanner-status {
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: #f8fafc;
}

.scanner-status.scanning {
  color: #10b981;
  background: #d1fae5;
  font-weight: 500;
}

.error-msg {
  background: #fee2e2;
  color: #ef4444;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 500;
}

.success-msg {
  background: #d1fae5;
  color: #10b981;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 500;
}
</style>
