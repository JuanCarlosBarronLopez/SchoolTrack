// C:\schooltrack\schooltrack\frontend\src\router\index.js
import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/vehicles',
    name: 'Vehicles',
    component: () => import('../views/vehicles/VehicleList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/vehicles/create',
    name: 'VehicleCreate',
    component: () => import('../views/vehicles/VehicleForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/vehicles/:id',
    name: 'VehicleDetail',
    component: () => import('../views/vehicles/VehicleDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/vehicles/:id/edit',
    name: 'VehicleEdit',
    component: () => import('../views/vehicles/VehicleForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/routes',
    name: 'Routes',
    component: () => import('../views/routes/RouteList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/routes/create',
    name: 'RouteCreate',
    component: () => import('../views/routes/RouteForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/routes/:id',
    name: 'RouteDetail',
    component: () => import('../views/routes/RouteDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/routes/:id/edit',
    name: 'RouteEdit',
    component: () => import('../views/routes/RouteForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stops',
    name: 'Stops',
    component: () => import('../views/stops/StopList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stops/create',
    name: 'StopCreate',
    component: () => import('../views/stops/StopForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stops/:id',
    name: 'StopDetail',
    component: () => import('../views/stops/StopDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stops/:id/edit',
    name: 'StopEdit',
    component: () => import('../views/stops/StopForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/users/UserList.vue'),
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/users/create',
    name: 'UserCreate',
    component: () => import('../views/users/UserForm.vue'),
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/users/:id/edit',
    name: 'UserEdit',
    component: () => import('../views/users/UserForm.vue'),
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/tracking',
    name: 'Tracking',
    component: () => import('../views/Tracking.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/map',
    name: 'MapView',
    component: () => import('../views/MapView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  console.log(`Navigating from ${from.path} to ${to.path}`) // Depuración
  if (!store.state.auth.initialized) {
    console.log('Waiting for auth initialization...')
    await store.dispatch('auth/initializeAuth')
  }

  const isAuthenticated = store.getters['auth/isAuthenticated']
  const currentUser = store.getters['auth/currentUser']

  console.log('isAuthenticated:', isAuthenticated, 'currentUser:', currentUser) // Depuración

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Redirecting to /login from:', to.path)
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.guest && isAuthenticated) {
    console.log('Redirecting to / from:', to.path)
    next('/')
    return
  }

  if (to.meta.adminOnly && (!currentUser || currentUser.role !== 'admin')) {
    console.log('Access denied to technische route:', to.path)
    next('/')
    return
  }

  next()
})

export default router