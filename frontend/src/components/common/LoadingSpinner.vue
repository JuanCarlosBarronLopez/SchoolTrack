<template>
  <div class="loading-spinner" :class="{ 'overlay': overlay }">
    <div class="spinner">
      <div class="spinner-border" :class="spinnerClass" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <div v-if="text" class="spinner-text">{{ text }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    overlay: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg'].includes(value)
    },
    variant: {
      type: String,
      default: 'primary'
    }
  },
  computed: {
    spinnerClass() {
      return [
        `text-${this.variant}`,
        {
          'spinner-border-sm': this.size === 'sm',
          'spinner-border-lg': this.size === 'lg'
        }
      ]
    }
  }
}
</script>

<style scoped>
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.loading-spinner.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  padding: 0;
}

.spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner-text {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.spinner-border-lg {
  width: 3rem;
  height: 3rem;
}

/* Animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-spinner {
  animation: fadeIn 0.3s ease-in;
}
</style>