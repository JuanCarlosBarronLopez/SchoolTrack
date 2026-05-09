<template>
  <div class="profile-view">
    <div class="page-header mb-4">
      <h1>Mi Perfil</h1>
      <p class="text-muted">Gestiona tu información personal y credenciales de acceso</p>
    </div>

    <div class="row">
      <!-- Tarjeta de Foto de Perfil -->
      <div class="col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-body text-center">
            <div class="avatar-wrapper mb-3 mx-auto">
              <img 
                v-if="user.avatar" 
                :src="getAvatarUrl(user.avatar)" 
                alt="Avatar" 
                class="avatar-img"
              >
              <div v-else class="avatar-placeholder bg-primary text-white">
                {{ getInitials() }}
              </div>
              
              <label class="avatar-upload-btn btn btn-sm btn-light shadow-sm" for="avatar-upload">
                <i class="fas fa-camera"></i>
                <input 
                  type="file" 
                  id="avatar-upload" 
                  class="d-none" 
                  accept="image/jpeg, image/png, image/webp"
                  @change="handleAvatarUpload"
                >
              </label>
            </div>
            
            <h4 class="mb-1">{{ user.firstName }} {{ user.lastName }}</h4>
            <p class="text-muted mb-3">{{ formatRole(user.role) }}</p>
            
            <div v-if="avatarUploading" class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div v-if="avatarMessage" :class="`alert alert-${avatarMessageType} py-2 small`">{{ avatarMessage }}</div>
          </div>
        </div>
      </div>

      <!-- Tarjeta de Datos Personales -->
      <div class="col-lg-8 mb-4">
        <div class="card mb-4">
          <div class="card-header bg-white">
            <h5 class="mb-0"><i class="fas fa-user me-2 text-primary"></i> Datos Personales</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateProfile">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nombre</label>
                  <input type="text" class="form-control" v-model="profileForm.firstName" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Apellido</label>
                  <input type="text" class="form-control" v-model="profileForm.lastName" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Correo Electrónico</label>
                  <input type="email" class="form-control" v-model="profileForm.email" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Teléfono</label>
                  <input type="tel" class="form-control" v-model="profileForm.phone" placeholder="Opcional">
                </div>
              </div>
              
              <div v-if="profileMessage" :class="`alert alert-${profileMessageType} mt-3 mb-0 py-2`">
                {{ profileMessage }}
              </div>
              
              <div class="mt-4 text-end">
                <button type="submit" class="btn btn-primary" :disabled="profileUpdating">
                  <span v-if="profileUpdating" class="spinner-border spinner-border-sm me-2"></span>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Tarjeta de Seguridad -->
        <div class="card">
          <div class="card-header bg-white text-danger">
            <h5 class="mb-0"><i class="fas fa-lock me-2"></i> Seguridad y Contraseña</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updatePassword">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Contraseña Actual</label>
                  <div class="input-group">
                    <input :type="showPassword ? 'text' : 'password'" class="form-control" v-model="passwordForm.currentPassword" required>
                    <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nueva Contraseña</label>
                  <div class="input-group">
                    <input :type="showNewPassword ? 'text' : 'password'" class="form-control" v-model="passwordForm.newPassword" required minlength="6">
                    <button class="btn btn-outline-secondary" type="button" @click="showNewPassword = !showNewPassword">
                      <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Confirmar Nueva Contraseña</label>
                  <div class="input-group">
                    <input :type="showConfirmPassword ? 'text' : 'password'" class="form-control" v-model="passwordForm.confirmPassword" required minlength="6">
                    <button class="btn btn-outline-secondary" type="button" @click="showConfirmPassword = !showConfirmPassword">
                      <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-if="passwordMessage" :class="`alert alert-${passwordMessageType} mt-3 mb-0 py-2`">
                {{ passwordMessage }}
              </div>
              
              <div class="mt-4 text-end">
                <button type="submit" class="btn btn-danger" :disabled="passwordUpdating">
                  <span v-if="passwordUpdating" class="spinner-border spinner-border-sm me-2"></span>
                  Actualizar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

const authStore = useAuthStore();
const user = ref({});

// Formularios
const profileForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const showPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Estados de UI
const profileUpdating = ref(false);
const profileMessage = ref('');
const profileMessageType = ref('success');

const passwordUpdating = ref(false);
const passwordMessage = ref('');
const passwordMessageType = ref('success');

const avatarUploading = ref(false);
const avatarMessage = ref('');
const avatarMessageType = ref('success');

const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

onMounted(async () => {
  await fetchProfile();
});

const fetchProfile = async () => {
  try {
    const res = await api.get('/profile');
    user.value = res.data.data || res.data; // Compatibilidad por si retorna directo o en .data
    
    // Inicializar formulario
    profileForm.value = {
      firstName: user.value.firstName || '',
      lastName: user.value.lastName || '',
      email: user.value.email || '',
      phone: user.value.phone || ''
    };
  } catch (error) {
    console.error('Error cargando perfil:', error);
  }
};

const getAvatarUrl = (filename) => {
  if (!filename) return '';
  if (filename.startsWith('http')) return filename;
  return `${apiUrl}/profile/avatar/${filename}`;
};

const getInitials = () => {
  const f = user.value.firstName || '';
  const l = user.value.lastName || '';
  return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
};

const formatRole = (role) => {
  const roles = {
    'admin': 'Administrador',
    'school_admin': 'Administrador Escolar',
    'driver': 'Conductor',
    'parent': 'Padre/Tutor',
    'student': 'Alumno'
  };
  return roles[role] || role;
};

// Acciones
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('avatar', file);

  avatarUploading.value = true;
  avatarMessage.value = '';

  try {
    const res = await api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    avatarMessageType.value = 'success';
    avatarMessage.value = 'Foto actualizada correctamente';
    
    // Actualizar usuario local
    if (res.data.data && res.data.data.avatar) {
      user.value.avatar = res.data.data.avatar;
      authStore.user.avatar = res.data.data.avatar; // Actualizar store
    }
    
    setTimeout(() => { avatarMessage.value = ''; }, 3000);
  } catch (error) {
    avatarMessageType.value = 'danger';
    avatarMessage.value = error.response?.data?.message || 'Error al subir imagen';
  } finally {
    avatarUploading.value = false;
  }
};

const updateProfile = async () => {
  profileUpdating.value = true;
  profileMessage.value = '';

  try {
    const res = await api.put('/profile', profileForm.value);
    
    profileMessageType.value = 'success';
    profileMessage.value = 'Datos actualizados correctamente';
    
    // Refrescar usuario
    Object.assign(user.value, res.data.data || res.data);
    
    // Actualizar nombre en el store
    authStore.user.firstName = user.value.firstName;
    authStore.user.lastName = user.value.lastName;
    
    setTimeout(() => { profileMessage.value = ''; }, 3000);
  } catch (error) {
    profileMessageType.value = 'danger';
    profileMessage.value = error.response?.data?.message || 'Error al actualizar perfil';
  } finally {
    profileUpdating.value = false;
  }
};

const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessageType.value = 'danger';
    passwordMessage.value = 'Las contraseñas no coinciden';
    return;
  }

  passwordUpdating.value = true;
  passwordMessage.value = '';

  try {
    await api.put('/profile/password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    });
    
    passwordMessageType.value = 'success';
    passwordMessage.value = 'Contraseña actualizada correctamente';
    
    // Limpiar formulario
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    
    setTimeout(() => { passwordMessage.value = ''; }, 3000);
  } catch (error) {
    passwordMessageType.value = 'danger';
    passwordMessage.value = error.response?.data?.message || 'Error al cambiar contraseña';
  } finally {
    passwordUpdating.value = false;
  }
};
</script>

<style scoped>
.profile-view {
  animation: fadeIn 0.4s ease-in;
}

.avatar-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
}

.avatar-img, .avatar-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 600;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}

.avatar-upload-btn:hover {
  background-color: #f8f9fa;
  transform: scale(1.1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
