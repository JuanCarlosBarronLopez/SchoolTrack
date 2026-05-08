<template>
  <div>
    <h1>Mapa y Datos</h1>
    <p v-if="loading">Cargando datos...</p>
    <ul v-else>
      <li v-for="vehicle in vehicles" :key="vehicle._id">
        {{ vehicle.brand }} - {{ vehicle.licensePlate }} (Capacidad: {{ vehicle.capacity }})
      </li>
    </ul>
    <StatusBadge :status="status" />
  </div>
</template>

<script>
import axios from 'axios';
import StatusBadge from '../components/ui/StatusBadge.vue';

export default {
  name: 'MapView',
  components: { StatusBadge },
  data() {
    return { loading: true, vehicles: [], status: 'info' };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      axios.get('http://localhost:3000/api/vehicles')
        .then(response => {
          this.vehicles = response.data;
          this.loading = false;
          this.status = 'success';
        })
        .catch(error => {
          console.log('Error:', error);
          this.status = 'danger';
          this.loading = false;
        });
    }
  }
};
</script>