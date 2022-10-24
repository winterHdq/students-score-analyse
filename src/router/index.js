import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/home/index.vue'
// import TestView from '../views/test/index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/test',
    name: 'test',
    component: () =>
      import('../views/test/index' /* webpackChunkName: "test-view" */)
  }
]

const router = new VueRouter({
  routes
})

export default router
