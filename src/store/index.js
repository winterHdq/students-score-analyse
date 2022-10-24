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
        // 及格分
        obj[item.name].passScore = (item.fullScore || 100) * 0.6
        // 优秀分
        obj[item.name].excellentScore = (item.fullScore || 100) * 0.85
      })
      return obj
    },
    subjectRankList(state) {
      return state.subjectMap.map(item => item.rankKey)
    }
  },
  mutations: {},
  actions: {},
  modules: {}
})
