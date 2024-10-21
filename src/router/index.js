import Vue from 'vue';
import VueRouter from 'vue-router';
import PetDetails from '../components/PetDetails.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/pet/:petId',
    name: 'PetDetails',
    component: PetDetails
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
