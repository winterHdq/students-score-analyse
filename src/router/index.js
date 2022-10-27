import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/home/index.vue'

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
  },
  {
    path: '/echarts',
    name: 'echarts',
    component: () =>
      import('../views/test/echarts' /* webpackChunkName: "echarts-view" */)
  }
]

const router = new VueRouter({
  routes
})

export default router
