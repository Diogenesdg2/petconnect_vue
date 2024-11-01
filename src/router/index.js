import { createRouter, createWebHistory } from 'vue-router'
import PetDetails from '../components/PetDetails.vue'
import Homepage from '../components/Home.vue'
import PetList from '@/components/PetList.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
