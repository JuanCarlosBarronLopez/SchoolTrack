<template>
  <div class="driver-dashboard">
    <div class="page-header">
      <h1>Panel de Conductor</h1>
      <p class="text-muted">Gestiona tu ruta y escanea pasajeros</p>
    </div>
    
    <div class="row">
      <!-- QR Scanner -->
      <div class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="card-title mb-0">
              <i class="fas fa-qrcode me-2"></i>
              Escáner QR
            </h5>
          </div>
          <div class="card-body p-0">
            <!-- Simulated Vehicle ID, in a real app this comes from driver's assignment -->
            <QRScanner vehicleId="veh-1" />
          </div>
        </div>
      </div>
      
      <!-- Route & Passenger Info -->
      <div class="col-lg-6 mb-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-route me-2"></i>
              Tu Ruta Actual
            </h5>
          </div>
          <div class="card-body">
            <h4>Ruta Matutina Norte</h4>
            <p class="text-muted">Vehículo: Unidad 01 (ABC-123)</p>
            
            <div class="progress mb-3" style="height: 20px;">
              <div class="progress-bar bg-success" role="progressbar" style="width: 40%;" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100">Progreso 40%</div>
            </div>
            
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Siguiente Parada: Colegio Central
                <span class="badge bg-primary rounded-pill">A 5 min</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Pasajeros a bordo
                <span class="badge bg-info rounded-pill">12 / 20</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import QRScanner from '../components/qr/QRScanner.vue';
</script>

<style scoped>
.driver-dashboard {
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
