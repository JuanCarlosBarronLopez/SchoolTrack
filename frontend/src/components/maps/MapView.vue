<!-- C:\schooltrack\schooltrack\frontend\src\components\maps\MapView.vue -->
<template>
  <div class="map-container">
    <div v-if="isMounted" :id="mapId" :style="{ height: height }" class="leaflet-map"></div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'

export default {
  name: 'MapView',
  props: {
    vehicles: {
      type: Array,
      default: () => []
    },
    stops: {
      type: Array,
      default: () => []
    },
    routes: {
      type: Array,
      default: () => []
    },
    height: {
      type: String,
      default: '500px'
    },
    showControls: {
      type: Boolean,
      default: true
    },
    showLegend: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const mapId = ref(`map-${Math.random().toString(36).substr(2, 9)}`)
    const isMounted = ref(false)
    let map = null
    let vehicleMarkers = []
    let stopMarkers = []
    let routePolylines = []

    const initializeMap = () => {
      const mapElement = document.getElementById(mapId.value)
      if (!mapElement) {
        console.error('Map container not found:', mapId.value)
        return
      }

      map = L.map(mapId.value, {
        zoomControl: props.showControls
      }).setView([19.4326, -99.1332], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      if (props.showLegend && props.showControls) {
        const legend = L.control({ position: 'bottomright' })
        legend.onAdd = () => {
          const div = L.DomUtil.create('div', 'legend')
          div.innerHTML = `
            <div style="background: white; padding: 10px; border-radius: 5px;">
              <h4>Leyenda</h4>
              <i style="background: blue"></i> Vehículo Activo<br>
              <i style="background: red"></i> Parada<br>
              <i style="background: green"></i> Ruta
            </div>
          `
          return div
        }
        legend.addTo(map)
      }
    }

    const updateMapData = () => {
      if (!map) return

      vehicleMarkers.forEach(marker => marker.remove())
      stopMarkers.forEach(marker => marker.remove())
      routePolylines.forEach(polyline => polyline.remove())
      vehicleMarkers = []
      stopMarkers = []
      routePolylines = []

      if (Array.isArray(props.vehicles)) {
        props.vehicles.forEach(vehicle => {
          if (vehicle?.location?.coordinates?.length === 2) {
            const [lng, lat] = vehicle.location.coordinates
            const marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: require('leaflet/dist/images/marker-icon.png'),
                iconSize: [25, 41],
                iconAnchor: [12, 41]
              })
            }).addTo(map)
            marker.bindPopup(`
              <b>${vehicle.licensePlate || 'Vehículo'}</b><br>
              Modelo: ${vehicle.model || 'N/A'}<br>
              Estado: ${vehicle.status || 'N/A'}
            `)
            vehicleMarkers.push(marker)
          }
        })
      }

      if (Array.isArray(props.stops)) {
        props.stops.forEach(stop => {
          if (stop?.location?.coordinates?.length === 2) {
            const [lng, lat] = stop.location.coordinates
            const marker = L.marker([lat, lng], {
              icon: L.icon({
                iconUrl: require('leaflet/dist/images/marker-icon.png'),
                iconSize: [25, 41],
                iconAnchor: [12, 41]
              })
            }).addTo(map)
            marker.bindPopup(`<b>${stop.name || 'Parada'}</b><br>Tipo: ${stop.type || 'N/A'}`)
            stopMarkers.push(marker)
          }
        })
      }

      if (Array.isArray(props.routes)) {
        props.routes.forEach(route => {
          if (Array.isArray(route?.stops)) {
            const coords = route.stops
              .filter(stop => stop?.location?.coordinates?.length === 2)
              .map(stop => {
                const [lng, lat] = stop.location.coordinates
                return [lat, lng]
              })
            if (coords.length > 1) {
              const polyline = L.polyline(coords, { color: 'green' }).addTo(map)
              routePolylines.push(polyline)
            }
          }
        })
      }
    }

    onMounted(() => {
      isMounted.value = true
      initializeMap()
      updateMapData()
    })

    onUnmounted(() => {
      if (map) {
        map.remove()
        map = null
      }
    })

    watch(
      () => [props.vehicles, props.stops, props.routes],
      () => {
        if (map) updateMapData()
      },
      { deep: true }
    )

    return { mapId, isMounted }
  }
}
</script>

<style scoped>
.map-container {
  width: 100%;
  position: relative;
}
.leaflet-map {
  width: 100%;
  z-index: 1;
}
.legend i {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 5px;
}
</style>