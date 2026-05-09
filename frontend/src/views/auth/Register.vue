<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <i class="fas fa-bus"></i>
          <h1>SchoolTrack</h1>
        </div>
        <p class="text-muted">Crea tu cuenta para empezar</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group mb-3">
          <label for="firstName" class="form-label">Nombre</label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.firstName }"
            placeholder="Juan"
            required
          >
          <div v-if="errors.firstName" class="invalid-feedback">
            {{ errors.firstName }}
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="lastName" class="form-label">Apellido</label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.lastName }"
            placeholder="Pérez"
            required
          >
          <div v-if="errors.lastName" class="invalid-feedback">
            {{ errors.lastName }}
          </div>
        </div>

        <div class="form-group mb-3">
          <label for="email" class="form-label">Correo Electrónico</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': errors.email }"
            placeholder="tu@email.com"
            required
          >
          <div v-if="errors.email" class="invalid-feedback">
            {{ errors.email }}
          </div>
        </div>
        
        <div class="form-group mb-3">
          <label for="password" class="form-label">Contraseña</label>
          <div class="input-group">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
              placeholder="Mínimo 6 caracteres"
              required
            >
            <button 
              type="button" 
              class="btn btn-outline-secondary"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
            <div v-if="errors.password" class="invalid-feedback">
              {{ errors.password }}
            </div>
          </div>
        </div>

        <div v-if="errors.general" class="alert alert-danger mb-3">
          {{ errors.general }}
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary w-100"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          <span v-else>
            <i class="fas fa-user-plus me-2"></i>
            Registrarse
          </span>
        </button>
      </form>
      
      <div class="auth-footer">
        <p class="text-center text-muted">
          ¿Ya tienes una cuenta?
          <router-link to="/login" class="text-primary">Inicia sesión</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'Register',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const form = reactive({
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    })
    
    const errors = reactive({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      general: ''
    })
    
    const loading = ref(false)
    const showPassword = ref(false)
    
    const validateForm = () => {
      errors.firstName = ''
      errors.lastName = ''
      errors.email = ''
      errors.password = ''
      errors.general = ''
      
      if (!form.firstName || form.firstName.length < 2) {
        errors.firstName = 'El nombre debe tener al menos 2 caracteres'
      }

      if (!form.lastName || form.lastName.length < 2) {
        errors.lastName = 'El apellido debe tener al menos 2 caracteres'
      }
      
      if (!form.email) {
        errors.email = 'El correo electrónico es requerido'
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = 'El correo electrónico no es válido'
      }
      
      if (!form.password) {
        errors.password = 'La contraseña es requerida'
      } else if (form.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres'
      }
      
      return !errors.firstName && !errors.lastName && !errors.email && !errors.password
    }
    
    const handleRegister = async () => {
      if (!validateForm()) return
      
      loading.value = true
      
      try {
        const result = await authStore.register({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password
        })
        
        if (result.token) {
          router.push('/')
        }
      } catch (error) {
        console.error('Register error:', error)
        if (error.response) {
          // Server responded with error status
          const msg = error.response.data?.message 
            || error.response.data?.errors?.[0]?.message
            || `Error del servidor (${error.response.status})`
          errors.general = msg
        } else if (error.request) {
          // Request was made but no response (CORS or network error)
          errors.general = 'No se pudo conectar con el servidor. Verifica tu conexión o contacta al administrador.'
        } else {
          errors.general = 'Error al registrarse. Intenta de nuevo.'
        }
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      errors,
      loading,
      showPassword,
      handleRegister
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.auth-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  animation: fadeIn 0.5s ease-out;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.logo i {
  font-size: 2rem;
  color: #2563eb;
}

.logo h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.auth-form {
  margin-bottom: 1.5rem;
}

.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-control.is-invalid {
  border-color: #dc2626;
}

.invalid-feedback {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 576px) {
  .auth-card {
    padding: 1.5rem;
    margin: 1rem;
  }
  .auth-container {
    padding: 0;
  }
}
</style>
