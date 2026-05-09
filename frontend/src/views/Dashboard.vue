<template>
  <component :is="currentDashboard" />
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import AdminDashboard from './AdminDashboard.vue';
import DriverDashboard from './DriverDashboard.vue';
import ParentDashboard from './ParentDashboard.vue';

const authStore = useAuthStore();

const currentDashboard = computed(() => {
  const role = authStore.user?.role;
  if (role === 'driver') {
    return DriverDashboard;
  } else if (role === 'parent' || role === 'student') {
    return ParentDashboard;
  } else {
    // admin, school_admin, etc
    return AdminDashboard;
  }
});
</script>