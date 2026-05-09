<template>
  <div class="login-page">
    <div class="login-split">
      <!-- Panel Visual Izquierdo -->
      <div class="login-visual d-none d-lg-flex">
        <div class="visual-content">
          <div class="visual-logo mb-4">
            <i class="fas fa-bus"></i>
            <span>SchoolTrack</span>
          </div>
          <h2>Bienvenido de vuelta</h2>
          <p>Accede a la plataforma para monitorear el transporte escolar en tiempo real, gestionar rutas y mantener a los estudiantes seguros.</p>
          
          <div class="visual-features mt-5">
            <div class="feature-item">
              <i class="fas fa-shield-alt"></i>
              <span>Datos protegidos con cifrado 256-bit</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>Rastreo GPS en tiempo real</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-bell"></i>
              <span>Alertas instantáneas a padres</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel del Formulario -->
      <div class="login-form-panel">
        <div class="form-wrapper">
          <!-- Logo móvil -->
          <div class="mobile-logo d-lg-none text-center mb-4">
            <i class="fas fa-bus text-primary fs-1"></i>
            <h2 class="fw-bold mt-2">SchoolTrack</h2>
          </div>

          <div class="form-header mb-4">
            <h3 class="fw-bold">Iniciar Sesión</h3>
            <p class="text-muted">Ingresa tus credenciales para acceder</p>
          </div>
          
          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="email" class="form-label fw-medium">Correo Electrónico</label>
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-light border-end-0"><i class="fas fa-envelope text-muted"></i></span>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="form-control border-start-0 ps-0"
                  :class="{ 'is-invalid': errors.email }"
                  placeholder="tu@email.com"
                  required
                >
              </div>
              <div v-if="errors.email" class="text-danger small mt-1">{{ errors.email }}</div>
            </div>
            
            <div class="mb-3">
              <label for="password" class="form-label fw-medium">Contraseña</label>
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-light border-end-0"><i class="fas fa-lock text-muted"></i></span>
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control border-start-0 border-end-0 ps-0"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="••••••••"
                  required
                >
                <button 
                  type="button" 
                  class="input-group-text bg-light border-start-0"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-muted"></i>
                </button>
              </div>
              <div v-if="errors.password" class="text-danger small mt-1">{{ errors.password }}</div>
            </div>
            
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div class="form-check">
                <input id="remember" v-model="form.remember" type="checkbox" class="form-check-input">
                <label for="remember" class="form-check-label small">Recordarme</label>
              </div>
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary btn-lg w-100 rounded-3 fw-bold"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <span v-else><i class="fas fa-sign-in-alt me-2"></i></span>
              Iniciar Sesión
            </button>
          </form>
          
          <div class="text-center mt-4">
            <p class="text-muted mb-0">
              ¿No tienes una cuenta?
              <router-link to="/register" class="text-primary fw-bold text-decoration-none">Regístrate</router-link>
            </p>
          </div>

          <div class="text-center mt-3">
            <router-link to="/" class="text-muted small text-decoration-none">
              <i class="fas fa-arrow-left me-1"></i> Volver al inicio
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
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
          router.push('/dashboard')
        } else {
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
.login-page {
  min-height: 100vh;
  background: #f8fafc;
}

.login-split {
  display: flex;
  min-height: 100vh;
}

/* Panel Visual */
.login-visual {
  flex: 1;
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  position: relative;
  overflow: hidden;
}

.login-visual::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.visual-content {
  position: relative;
  z-index: 1;
  color: white;
  max-width: 480px;
}

.visual-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.visual-logo i {
  font-size: 2rem;
}

.visual-content h2 {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.visual-content p {
  font-size: 1.1rem;
  opacity: 0.85;
  line-height: 1.7;
}

.visual-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  font-size: 0.95rem;
}

.feature-item i {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
}

/* Panel del Formulario */
.login-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
}

.form-wrapper {
  width: 100%;
  max-width: 420px;
}

.form-header h3 {
  font-size: 1.75rem;
  color: #1e293b;
}

.input-group-text {
  border-color: #e2e8f0;
}

.form-control {
  border-color: #e2e8f0;
}

.form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border: none;
  padding: 0.85rem;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
}

.btn-primary:disabled {
  opacity: 0.7;
  transform: none;
}

/* Animación */
.form-wrapper {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Mobile */
@media (max-width: 992px) {
  .login-form-panel {
    padding: 1.5rem;
  }
}
</style>