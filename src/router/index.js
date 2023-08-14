import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/home/index.vue'

const isDev = process.env.NODE_ENV === 'development'

Vue.use(VueRouter)

const defaultRoutes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  }
]

const devRouters = [
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
const routes = isDev ? [...defaultRoutes, ...devRouters] : defaultRoutes

console.log(routes)
const router = new VueRouter({
  routes
})

export default router
