<template>
  <div class="tracking-view">
    <div class="header">
      <h1>Rastreo en Tiempo Real</h1>
      <div class="status">
        <span class="pulse-dot"></span>
        Conectado al servidor GPS
      </div>
    </div>
    <div class="map-container" id="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglo para el icono de marcador por defecto de Leaflet en Vite/Webpack
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const map = ref(null);
const markers = ref({});

onMounted(() => {
  // Inicializar mapa centrado (ejemplo: Ciudad de México)
  map.value = L.map('map').setView([19.4326, -99.1332], 13);

  // Agregar capa de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value);

  // Datos simulados (Aquí iría la conexión real a Socket.io / API)
  setTimeout(() => {
    addOrUpdateVehicle('veh-1', { lat: 19.4326, lng: -99.1332 }, 'Unidad 01 - Placa ABC-123');
    addOrUpdateVehicle('veh-2', { lat: 19.4426, lng: -99.1432 }, 'Unidad 02 - Placa XYZ-987');
  }, 1000);

  // Simular movimiento
  setInterval(() => {
    if (markers.value['veh-1']) {
      const current = markers.value['veh-1'].getLatLng();
      addOrUpdateVehicle('veh-1', { 
        lat: current.lat + (Math.random() - 0.5) * 0.005, 
        lng: current.lng + (Math.random() - 0.5) * 0.005 
      }, 'Unidad 01 - Placa ABC-123');
    }
  }, 3000);
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});

const addOrUpdateVehicle = (id, coords, popupText) => {
  if (markers.value[id]) {
    // Si ya existe, animar hasta la nueva posición
    markers.value[id].setLatLng([coords.lat, coords.lng]);
  } else {
    // Si no existe, crearlo
    const marker = L.marker([coords.lat, coords.lng]).addTo(map.value);
    if (popupText) {
      marker.bindPopup(`<b>${popupText}</b><br><span style="color: green;">Estado: En ruta</span>`);
    }
    markers.value[id] = marker;
  }
};
</script>

<style scoped>
.tracking-view { 
  padding: 1.5rem; 
  height: calc(100vh - 100px); /* Ajustar según tu navbar */
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e8f5e9;
  color: #2e7d32;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background-color: #4caf50;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}

.map-container { 
  flex-grow: 1;
  min-height: 400px; 
  background: #ecf0f1; 
  border-radius: 12px; 
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid #e0e0e0;
  z-index: 1; /* Para no sobreponerse al Navbar */
}
</style>
