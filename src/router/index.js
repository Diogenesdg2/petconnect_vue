import { createRouter, createWebHistory } from 'vue-router'
import PetDetails from '../components/PetDetails.vue'
import Homepage from '../components/Home.vue'
import PetList from '@/components/PetList.vue'
import DashboardMap from '../views/DashboardMap.vue'



const routes = [
  {
    path: '/pet/:PetsId',
    name: 'PetDetails',
    component: PetDetails
  },
  {
    path: '/',
    name: 'Sobre',
    component: Homepage
  },
  {
    path: '/pets',
    name: 'PetList',
    component: PetList
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardMap,
    meta: { requiresAuth: true }
  },
  {
    path: '/cadastro-pets',
    name: 'CadastroPets',
    component: () => import('../views/CadastroPets.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/meus-pets',
    name: 'MeusPets',
    component: () => import('../views/MeusPets.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
import { getAuth } from 'firebase/auth'

router.beforeEach((to, from, next) => {
  const auth = getAuth()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = auth.currentUser

  if (requiresAuth && !isAuthenticated) {
    next('/')
  } else if (isAuthenticated && to.path === '/') {
    next('/meus-pets')
  } else {
    next()
  }
})

export default router
