import Vue from 'vue'
import Vuex from 'vuex'
import { subjectMap } from '../constant/subject'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    subjectMap: subjectMap
  },
  getters: {
    subjectObj(state) {
      let obj = {}
      state.subjectMap.forEach(item => {
        obj[item.name] = item
      })
      return obj
    }
  },
  mutations: {},
  actions: {},
  modules: {}
})
