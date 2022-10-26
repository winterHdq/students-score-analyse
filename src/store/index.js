import Vue from 'vue'
import Vuex from 'vuex'
import { subjectMap } from '../constant/subject'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tables: [],
    curTableId: null,
    subjectMap
  },
  getters: {
    curTable(state) {
      return state.tables.find(item => item.id == state.curTableId)
    },
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
    subjectList(state) {
      return state.subjectMap.map(item => item.name)
    },
    subjectRankList(state) {
      return state.subjectMap.map(item => item.rankKey)
    }
  },
  mutations: {
    getTables(state) {
      state.tables = JSON.parse(localStorage.getItem('tables')) || []
    },
    setTables(state, table) {
      state.tables = table
      localStorage.setItem('tables', JSON.stringify(state.tables))
    },
    addTable(state, table) {
      state.tables.push(table)
      localStorage.setItem('tables', JSON.stringify(state.tables))
    },
    deleteTable(state, index) {
      state.tables.splice(index, 1)
      localStorage.setItem('tables', JSON.stringify(state.tables))
    },
    setCurTableId(state, curTableId) {
      state.curTableId = curTableId
      localStorage.setItem('curTableId', curTableId)
    },
    getCurTableId(state) {
      state.curTableId = localStorage.getItem('curTableId')
    }
  },
  actions: {},
  modules: {}
})
