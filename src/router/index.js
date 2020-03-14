import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'
import Servidores from '@/components/Servidores.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Servidores',
    component: Servidores
  }
]

const router = new VueRouter({
  routes
})

export default router
