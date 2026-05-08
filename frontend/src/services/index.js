import api from './api'

/**
 * Servicio de autenticación
 */
export const authService = {
  register(userData) {
    return api.post('/auth/register', userData)
  },

  login(email, password) {
    return api.post('/auth/login', { email, password })
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    document.cookie = 'schooltrack.sid=; Max-Age=0'
    return Promise.resolve()
  },

  getProfile() {
    return api.get('/profile')
  },

  updateProfile(userData) {
    return api.put('/profile', userData)
  }
}

/**
 * Servicio de perfil y avatar
 */
export const profileService = {
  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  changeAvatar(file) {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.put('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  deleteAvatar() {
    return api.delete('/profile/avatar')
  },

  getAvatar(filename) {
    return `/uploads/avatars/${filename}`
  }
}

/**
 * Servicio de estudiantes
 */
export const studentService = {
  getAll(filters = {}) {
    return api.get('/students', { params: filters })
  },

  getById(id) {
    return api.get(`/students/${id}`)
  },

  create(studentData) {
    return api.post('/students', studentData)
  },

  update(id, studentData) {
    return api.put(`/students/${id}`, studentData)
  },

  delete(id) {
    return api.delete(`/students/${id}`)
  }
}

/**
 * Servicio de vehículos
 */
export const vehicleService = {
  getAll(filters = {}) {
    return api.get('/vehicles', { params: filters })
  },

  getById(id) {
    return api.get(`/vehicles/${id}`)
  },

  create(vehicleData) {
    return api.post('/vehicles', vehicleData)
  },

  update(id, vehicleData) {
    return api.put(`/vehicles/${id}`, vehicleData)
  },

  delete(id) {
    return api.delete(`/vehicles/${id}`)
  }
}

/**
 * Servicio de rutas
 */
export const routeService = {
  getAll(filters = {}) {
    return api.get('/routes', { params: filters })
  },

  getById(id) {
    return api.get(`/routes/${id}`)
  },

  create(routeData) {
    return api.post('/routes', routeData)
  },

  update(id, routeData) {
    return api.put(`/routes/${id}`, routeData)
  },

  delete(id) {
    return api.delete(`/routes/${id}`)
  }
}

/**
 * Servicio de ubicaciones en tiempo real
 */
export const locationService = {
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            })
          },
          (error) => reject(error)
        )
      } else {
        reject(new Error('Geolocalización no disponible'))
      }
    })
  },

  getLocations(filters = {}) {
    return api.get('/locations', { params: filters })
  },

  getVehicleLocation(vehicleId) {
    return api.get(`/locations/vehicle/${vehicleId}`)
  }
}

/**
 * Servicio QR
 */
export const qrService = {
  generateQR(data) {
    return api.post('/qr/generate', { data })
  },

  getQRCode(id) {
    return api.get(`/qr/${id}`)
  }
}

/**
 * Servicio de sesiones
 */
export const sessionService = {
  getSessions() {
    return api.get('/sessions')
  },

  terminateSession(sessionId) {
    return api.delete(`/sessions/${sessionId}`)
  },

  logout() {
    return api.post('/sessions/logout')
  }
}

/**
 * Servicio de blog
 */
export const blogService = {
  getPosts(page = 1, limit = 10) {
    return api.get('/blog', { params: { page, limit } })
  },

  getPost(id) {
    return api.get(`/blog/${id}`)
  },

  createPost(postData) {
    return api.post('/blog', postData)
  },

  updatePost(id, postData) {
    return api.put(`/blog/${id}`, postData)
  },

  deletePost(id) {
    return api.delete(`/blog/${id}`)
  }
}

export default {
  authService,
  profileService,
  studentService,
  vehicleService,
  routeService,
  locationService,
  qrService,
  sessionService,
  blogService,
  api
}
