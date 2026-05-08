<template>
  <div class="profile-avatar-section">
    <!-- Avatar Display -->
    <div class="avatar-container">
      <div v-if="user.avatar" class="avatar-image">
        <img :src="`/uploads/avatars/${user.avatar}`" 
             :alt="`${user.firstName} ${user.lastName}`" 
             class="img-fluid rounded-circle"
             style="width: 150px; height: 150px; object-fit: cover;">
      </div>
      <div v-else class="avatar-placeholder">
        <i class="fas fa-user-circle fa-5x text-secondary"></i>
      </div>
      
      <p class="text-muted mt-2 small">Foto de perfil</p>
    </div>

    <!-- Error Messages -->
    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="error = ''" aria-label="Close"></button>
    </div>

    <!-- Success Messages -->
    <div v-if="success" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ success }}
      <button type="button" class="btn-close" @click="success = ''" aria-label="Close"></button>
    </div>

    <!-- Upload Form -->
    <div class="avatar-actions">
      <div class="mb-3">
        <input 
          type="file" 
          id="avatarInput" 
          ref="fileInput"
          @change="onFileSelected"
          accept="image/jpeg,image/png,image/gif"
          class="form-control"
          :disabled="loading">
        <small class="form-text text-muted d-block mt-1">
          JPG, PNG o GIF. Máximo 10 MB
        </small>
      </div>

      <!-- Preview -->
      <div v-if="preview" class="mb-3">
        <p class="small text-muted">Vista previa:</p>
        <img :src="preview" alt="Preview" class="img-fluid rounded" style="max-width: 200px;">
      </div>

      <!-- Action Buttons -->
      <div class="d-flex gap-2 flex-wrap">
        <button 
          @click="uploadAvatar" 
          :disabled="!preview || loading"
          class="btn btn-primary btn-sm"
          type="button">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ preview ? 'Guardar Foto' : 'Seleccionar Foto' }}
        </button>

        <button 
          v-if="user.avatar && !preview"
          @click="changeAvatar" 
          :disabled="loading"
          class="btn btn-warning btn-sm"
          type="button">
          <i class="fas fa-exchange-alt me-1"></i>
          Cambiar Foto
        </button>

        <button 
          v-if="user.avatar && !preview"
          @click="deleteAvatar" 
          :disabled="loading"
          class="btn btn-danger btn-sm"
          type="button">
          <i class="fas fa-trash me-1"></i>
          Eliminar Foto
        </button>

        <button 
          v-if="preview"
          @click="cancelUpload" 
          class="btn btn-secondary btn-sm"
          type="button">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import api from '../services/api';

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['avatar-updated', 'avatar-deleted']);

const fileInput = ref(null);
const preview = ref(null);
const loading = ref(false);
const error = ref('');
const success = ref('');

const onFileSelected = (event) => {
  const file = event.target.files[0];
  
  if (!file) {
    preview.value = null;
    return;
  }

  // Validar tipo de archivo
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    error.value = 'Solo se permiten archivos JPG, PNG o GIF';
    return;
  }

  // Validar tamaño
  if (file.size > 10 * 1024 * 1024) {
    error.value = 'El archivo no puede ser mayor a 10 MB';
    return;
  }

  // Crear preview
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.value = e.target.result;
    error.value = '';
  };
  reader.readAsDataURL(file);
};

const uploadAvatar = async () => {
  if (!fileInput.value?.files[0]) {
    error.value = 'Por favor selecciona un archivo';
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

    try {
    const formData = new FormData();
    formData.append('avatar', fileInput.value.files[0]);

    const response = await api.post('/profile/avatar', formData);

    success.value = 'Foto subida exitosamente';
    preview.value = null;
    fileInput.value.value = '';

    // Emitir evento para actualizar el usuario
    emit('avatar-updated', response.data.data);

    // Limpiar después de 3 segundos
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al subir la foto';
  } finally {
    loading.value = false;
  }
};

const changeAvatar = () => {
  fileInput.value?.click();
};

const deleteAvatar = async () => {
  if (!confirm('¿Está seguro de que desea eliminar la foto de perfil?')) {
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    await api.delete('/profile/avatar');
    success.value = 'Foto eliminada exitosamente';
    emit('avatar-deleted');

    // Limpiar después de 3 segundos
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al eliminar la foto';
  } finally {
    loading.value = false;
  }
};

const cancelUpload = () => {
  preview.value = null;
  fileInput.value.value = '';
  error.value = '';
};
</script>

<style scoped>
.profile-avatar-section {
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.avatar-container {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar-image img {
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.avatar-actions {
  max-width: 400px;
  margin: 0 auto;
}

.form-control:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gap-2 {
  gap: 0.5rem;
}

@media (max-width: 576px) {
  .avatar-actions {
    max-width: 100%;
  }

  .d-flex.gap-2 {
    flex-direction: column;
  }

  .d-flex.gap-2 button {
    width: 100%;
  }
}
</style>
