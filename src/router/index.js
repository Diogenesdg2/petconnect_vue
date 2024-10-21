import { createRouter, createWebHistory } from 'vue-router'
import PetDetails from '../components/PetDetails.vue'

const routes = [
  {
    path: '/pet/:PetsId',
    name: 'PetDetails',
    component: PetDetails
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
