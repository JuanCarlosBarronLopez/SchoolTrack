<template>
  <component :is="currentDashboard" />
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import AdminDashboard from './AdminDashboard.vue';
import DriverDashboard from './DriverDashboard.vue';
import ParentDashboard from './ParentDashboard.vue';
import PendingDashboard from './PendingDashboard.vue';

const authStore = useAuthStore();

const currentDashboard = computed(() => {
  const role = authStore.user?.role;
  if (role === 'admin' || role === 'school_admin') {
    return AdminDashboard;
  } else if (role === 'driver') {
    return DriverDashboard;
  } else if (role === 'parent' || role === 'student') {
    return ParentDashboard;
  } else {
    // user (pending) or unknown
    return PendingDashboard;
  }
});
</script>