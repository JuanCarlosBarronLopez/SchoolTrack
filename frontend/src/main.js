import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

// Leaflet CSS
import 'leaflet/dist/leaflet.css'

// Fix Leaflet icon issue
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

// Global components
import Sidebar from './components/layout/Sidebar.vue'
import Navbar from './components/layout/Navbar.vue'
import LoadingSpinner from './components/common/LoadingSpinner.vue'
import StatusBadge from './components/common/StatusBadge.vue'

// Global filters/mixins
import moment from 'moment'

const app = createApp(App)
const pinia = createPinia()

// Global properties
app.config.globalProperties.$moment = moment
app.config.globalProperties.$formatDate = (date) => {
  return moment(date).format('DD/MM/YYYY HH:mm')
}
app.config.globalProperties.$formatTime = (time) => {
  return moment(time, 'HH:mm').format('HH:mm')
}
app.config.globalProperties.$getStatusColor = (status) => {
  const colors = {
    active: 'success',
    inactive: 'secondary',
    maintenance: 'warning',
    out_of_service: 'danger',
    pickup: 'info',
    dropoff: 'primary',
    both: 'secondary'
  }
  return colors[status] || 'secondary'
}

// Register global components
app.component('Sidebar', Sidebar)
app.component('Navbar', Navbar)
app.component('LoadingSpinner', LoadingSpinner)
app.component('StatusBadge', StatusBadge)

app.use(pinia)
app.use(router)

app.mount('#app')