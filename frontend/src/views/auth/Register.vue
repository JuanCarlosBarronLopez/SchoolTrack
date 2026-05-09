<template>
  <div class="register-page">
    <div class="register-split">
      <!-- Panel Visual Izquierdo -->
      <div class="register-visual d-none d-lg-flex">
        <div class="visual-content">
          <div class="visual-logo mb-4">
            <i class="fas fa-bus"></i>
            <span>SchoolTrack</span>
          </div>
          <h2>Únete a la comunidad</h2>
          <p>Regístrate para acceder al sistema de seguimiento de transporte escolar más seguro y moderno. Tu cuenta será revisada por un administrador antes de asignarte un rol.</p>
          
          <div class="visual-steps mt-5">
            <div class="step-item">
              <div class="step-number">1</div>
              <span>Crea tu cuenta con tus datos</span>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <span>Un administrador valida tu identidad</span>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <span>Se te asigna un rol y accedes al sistema</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel del Formulario -->
      <div class="register-form-panel">
        <div class="form-wrapper">
          <!-- Logo móvil -->
          <div class="mobile-logo d-lg-none text-center mb-4">
            <i class="fas fa-bus text-primary fs-1"></i>
            <h2 class="fw-bold mt-2">SchoolTrack</h2>
          </div>

          <div class="form-header mb-4">
            <h3 class="fw-bold">Crear Cuenta</h3>
            <p class="text-muted">Ingresa tus datos para registrarte</p>
          </div>
          
          <form @submit.prevent="handleRegister">
            <div class="row g-3 mb-3">
              <div class="col-6">
                <label for="firstName" class="form-label fw-medium">Nombre</label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  class="form-control form-control-lg"
                  :class="{ 'is-invalid': errors.firstName }"
                  placeholder="Juan"
                  required
                >
                <div v-if="errors.firstName" class="text-danger small mt-1">{{ errors.firstName }}</div>
              </div>
              <div class="col-6">
                <label for="lastName" class="form-label fw-medium">Apellido</label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  class="form-control form-control-lg"
                  :class="{ 'is-invalid': errors.lastName }"
                  placeholder="Pérez"
                  required
                >
                <div v-if="errors.lastName" class="text-danger small mt-1">{{ errors.lastName }}</div>
              </div>
            </div>

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
                  placeholder="Mínimo 6 caracteres"
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

            <div v-if="errors.general" class="alert alert-danger py-2 small mb-3">
              {{ errors.general }}
            </div>
            
            <button 
              type="submit" 
              class="btn btn-primary btn-lg w-100 rounded-3 fw-bold"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <span v-else><i class="fas fa-user-plus me-2"></i></span>
              Registrarse
            </button>
          </form>
          
          <div class="text-center mt-4">
            <p class="text-muted mb-0">
              ¿Ya tienes una cuenta?
              <router-link to="/login" class="text-primary fw-bold text-decoration-none">Inicia sesión</router-link>
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
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Register error:', error)
        if (error.response) {
          const msg = error.response.data?.message 
            || error.response.data?.errors?.[0]?.message
            || `Error del servidor (${error.response.status})`
          errors.general = msg
        } else if (error.request) {
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
.register-page {
  min-height: 100vh;
  background: #f8fafc;
}

.register-split {
  display: flex;
  min-height: 100vh;
}

/* Panel Visual */
.register-visual {
  flex: 1;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  position: relative;
  overflow: hidden;
}

.register-visual::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 60%);
  animation: rotate 25s linear infinite;
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
  font-size: 1.05rem;
  opacity: 0.85;
  line-height: 1.7;
}

.visual-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  font-size: 0.95rem;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

/* Panel del Formulario */
.register-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
}

.form-wrapper {
  width: 100%;
  max-width: 480px;
  animation: slideIn 0.5s ease-out;
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

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@media (max-width: 992px) {
  .register-form-panel {
    padding: 1.5rem;
  }
}
</style>
