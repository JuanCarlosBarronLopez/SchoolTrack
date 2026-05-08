import axios from 'axios'

// Crear instancia de axios con configuración optimizada
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor de solicitudes
api.interceptors.request.use(
  (config) => {
    // Añadir token JWT si existe
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Añadir identificador de sesión si existe
    const sessionId = document.cookie
      .split('; ')
      .find(row => row.startsWith('schooltrack.sid'))
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId.split('=')[1]
    }

    // Log en desarrollo
    if (process.env.VUE_APP_ENVIRONMENT === 'development') {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`)
    }

    return config
  },
  (error) => {
    console.error('❌ Error en solicitud:', error)
    return Promise.reject(error)
  }
)

// Para evitar loops infinitos en el refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Interceptor de respuestas
api.interceptors.response.use(
  (response) => {
    // Log en desarrollo
    if (process.env.VUE_APP_ENVIRONMENT === 'development') {
      console.log(`📥 ${response.status} ${response.config.url}`)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const message = error.response?.data?.message || 'Error de conexión'

    // Manejo de errores específicos
    if (status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await api.post('/auth/refresh')
        const newToken = data.token
        localStorage.setItem('token', newToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        
        processQueue(null, newToken)
        
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        
        // Token refresh failed (refresh token expired or invalid)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        document.cookie = 'schooltrack.sid=; Max-Age=0'
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?reason=expired'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    } else if (status === 401) {
      // It was 401 but we either were already retrying or the refresh itself failed 401
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?reason=expired'
      }
    } else if (status === 403) {
      // Acceso denegado
      console.error('❌ Acceso denegado:', message)
    } else if (status === 404) {
      // No encontrado
      console.warn('⚠️ Recurso no encontrado:', error.config.url)
    } else if (status === 500) {
      // Error del servidor
      console.error('❌ Error del servidor:', message)
    }

    console.error('API Error:', {
      status,
      message,
      url: error.config?.url,
      method: error.config?.method
    })

    return Promise.reject(error)
  }
)

export default api