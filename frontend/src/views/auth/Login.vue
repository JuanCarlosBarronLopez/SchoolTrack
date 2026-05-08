<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <i class="fas fa-bus"></i>
          <h1>SchoolTrack</h1>
        </div>
        <p class="text-muted">Sistema de Seguimiento de Transporte Escolar</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="auth-form">
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
              placeholder="••••••••"
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
        
        <div class="form-group mb-4">
          <div class="form-check">
            <input 
              id="remember" 
              v-model="form.remember" 
              type="checkbox" 
              class="form-check-input"
            >
            <label for="remember" class="form-check-label">
              Recordarme
            </label>
          </div>
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary w-100"
          :disabled="loading"
        >
          <LoadingSpinner v-if="loading" size="sm" variant="light" />
          <span v-else>
            <i class="fas fa-sign-in-alt me-2"></i>
            Iniciar Sesión
          </span>
        </button>
      </form>
      
      <div class="auth-footer">
        <p class="text-center text-muted">
          ¿No tienes una cuenta?
          <router-link to="/register" class="text-primary">Regístrate</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import LoadingSpinner from '../../components/common/LoadingSpinner.vue'

export default {
  name: 'Login',
  components: {
    LoadingSpinner
  },
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const form = reactive({
      email: '',
      password: '',
      remember: false
    })
    
    const errors = reactive({
      email: '',
      password: ''
    })
    
    const loading = ref(false)
    const showPassword = ref(false)
    
    const validateForm = () => {
      errors.email = ''
      errors.password = ''
      
      if (!form.email) {
        errors.email = 'El correo electrónico es requerido'
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = 'El correo electrónico no es válido'
      }
      
      if (!form.password) {
        errors.password = 'La contraseña es requerida'
      }
      
      return !errors.email && !errors.password
    }
    
    const handleLogin = async () => {
      if (!validateForm()) return
      
      loading.value = true
      
      try {
        const result = await authStore.login({
          email: form.email,
          password: form.password
        })
        
        if (result.success || result.token) {
          router.push('/')
        } else {
          // Handle login error
          if (result.message && result.message.includes('credenciales')) {
            errors.email = 'Credenciales inválidas'
            errors.password = 'Credenciales inválidas'
          } else {
            errors.email = result.message || 'Error al iniciar sesión'
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        errors.email = error.response?.data?.message || 'Error al iniciar sesión. Por favor, intenta de nuevo.'
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      errors,
      loading,
      showPassword,
      handleLogin
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

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.auth-card {
  animation: fadeIn 0.5s ease-out;
}

/* Mobile adjustments */
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