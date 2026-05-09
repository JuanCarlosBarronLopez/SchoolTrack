<template>
  <div class="user-management">
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h1>Gestión de Usuarios</h1>
        <p class="text-muted">Administra los roles, accesos y estados de los usuarios del sistema</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <i class="fas fa-user-plus me-2"></i> Nuevo Usuario
      </button>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Filtrar por Rol</label>
            <select v-model="filterRole" class="form-select" @change="fetchUsers">
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="school_admin">Admin Escolar</option>
              <option value="driver">Conductor</option>
              <option value="parent">Padre/Tutor</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Usuarios -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Rol</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="users.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">No se encontraron usuarios</td>
              </tr>
              <tr v-else v-for="user in users" :key="user._id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar bg-primary text-white me-3">
                      {{ getInitials(user.firstName, user.lastName) }}
                    </div>
                    <div>
                      <div class="fw-bold">{{ user.firstName }} {{ user.lastName }}</div>
                      <div class="text-muted small">ID: {{ user._id.slice(-6) }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div><i class="fas fa-envelope text-muted me-2"></i> {{ user.email }}</div>
                  <div v-if="user.phone"><i class="fas fa-phone text-muted me-2"></i> {{ user.phone }}</div>
                </td>
                <td>
                  <span class="badge" :class="getRoleBadgeClass(user.role)">
                    {{ formatRole(user.role) }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="user.status === 'active' ? 'bg-success' : 'bg-danger'">
                    {{ user.status === 'active' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-secondary me-2" @click="openEditModal(user)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    v-if="user.role !== 'admin'" 
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteUser(user._id)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Paginación -->
        <div class="card-footer bg-white border-top d-flex justify-content-between align-items-center">
          <span class="text-muted small">Mostrando página {{ currentPage }} de {{ totalPages }}</span>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline-secondary" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">Anterior</button>
            <button class="btn btn-sm btn-outline-secondary" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">Siguiente</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Formulario Usuario -->
    <div v-if="showModal" class="modal-backdrop fade show"></div>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Nombre</label>
                  <input type="text" class="form-control" v-model="formData.firstName" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Apellido</label>
                  <input type="text" class="form-control" v-model="formData.lastName" required>
                </div>
                <div class="col-12">
                  <label class="form-label">Correo Electrónico</label>
                  <input type="email" class="form-control" v-model="formData.email" :disabled="isEditing" required>
                </div>
                <div class="col-12" v-if="!isEditing">
                  <label class="form-label">Contraseña (Opcional)</label>
                  <input type="password" class="form-control" v-model="formData.password" placeholder="Dejar en blanco para generar una (Temporal123!)">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Teléfono</label>
                  <input type="text" class="form-control" v-model="formData.phone">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Rol</label>
                  <select class="form-select" v-model="formData.role" required>
                    <option value="parent">Padre/Tutor</option>
                    <option value="driver">Conductor</option>
                    <option value="admin">Administrador</option>
                    <option value="school_admin">Admin Escolar</option>
                  </select>
                </div>
                <div class="col-12" v-if="isEditing">
                  <label class="form-label">Estado</label>
                  <select class="form-select" v-model="formData.status">
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>
              </div>
              
              <div v-if="formError" class="alert alert-danger mt-3 mb-0">{{ formError }}</div>
              
              <div class="mt-4 text-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                  Guardar Usuario
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
import api from '@/services/api';

const users = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const filterRole = ref('');

const showModal = ref(false);
const isEditing = ref(false);
const saving = ref(false);
const formError = ref('');

const defaultForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  role: 'parent',
  status: 'active'
};

const formData = ref({ ...defaultForm });
const editingId = ref(null);

onMounted(() => {
  fetchUsers();
});

const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = { page: currentPage.value, limit: 10 };
    if (filterRole.value) params.role = filterRole.value;
    
    const response = await api.get('/users', { params });
    users.value = response.data.users;
    totalPages.value = response.data.totalPages;
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchUsers();
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  formData.value = { ...defaultForm };
  formError.value = '';
  showModal.value = true;
};

const openEditModal = (user) => {
  isEditing.value = true;
  editingId.value = user._id;
  formData.value = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    status: user.status || 'active'
  };
  formError.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveUser = async () => {
  saving.value = true;
  formError.value = '';
  
  try {
    if (isEditing.value) {
      await api.put(`/users/${editingId.value}`, formData.value);
    } else {
      await api.post('/users', formData.value);
    }
    closeModal();
    fetchUsers();
  } catch (error) {
    console.error('Error saving user:', error);
    formError.value = error.response?.data?.message || 'Error al guardar el usuario';
  } finally {
    saving.value = false;
  }
};

const deleteUser = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar el usuario');
    }
  }
};

// Utils
const getInitials = (first, last) => {
  return `${(first || '').charAt(0)}${(last || '').charAt(0)}`.toUpperCase();
};

const formatRole = (role) => {
  const roles = {
    'admin': 'Admin',
    'school_admin': 'Admin Escolar',
    'driver': 'Conductor',
    'parent': 'Padre',
    'student': 'Alumno'
  };
  return roles[role] || role;
};

const getRoleBadgeClass = (role) => {
  const classes = {
    'admin': 'bg-dark',
    'school_admin': 'bg-purple',
    'driver': 'bg-info text-dark',
    'parent': 'bg-primary'
  };
  return classes[role] || 'bg-secondary';
};
</script>

<style scoped>
.user-management {
  animation: fadeIn 0.5s ease-in;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.bg-purple {
  background-color: #6f42c1;
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
