import Vue from 'vue'
import Vuex from 'vuex'
import { subjectMap } from '../constant/subject'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tables: [],
    curIndex: null,
    curTableId: null,
    subjectMap,
    isShowMenu: true,
    defaultClassName: ''
  },
  getters: {
    curTable(state) {
      let curTbale = state.tables.find((item, index) => {
        if (item.id == state.curTableId) {
          state.curIndex == index
          return true
        }
      })
      return curTbale
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
    upMoveTables(state, index) {
      if (index == 0) return
      let moveItem = state.tables[index]
      Vue.set(state.tables, index, state.tables[index - 1])
      Vue.set(state.tables, index - 1, moveItem)
      localStorage.setItem('tables', JSON.stringify(state.tables))
    },
    downMoveTables(state, index) {
      if (index == state.tables.length - 1) return
      let moveItem = state.tables[index]
      Vue.set(state.tables, index, state.tables[index + 1])
      Vue.set(state.tables, index + 1, moveItem)
      localStorage.setItem('tables', JSON.stringify(state.tables))
    },
    setCurTableId(state, curTableId) {
      state.curTableId = curTableId
      localStorage.setItem('curTableId', curTableId)
    },
    getCurTableId(state) {
      state.curTableId = localStorage.getItem('curTableId')
    },
    getIsShowMenu(state) {
      state.isShowMenu =
        localStorage.getItem('isShowMenu') == 'false' ? false : true
    },
    setIsShowMenu(state, isShowMenu) {
      state.isShowMenu = isShowMenu
      localStorage.setItem('isShowMenu', isShowMenu)
    },
    getDefaultClassName(state) {
      state.defaultClassName = localStorage.getItem('defaultClassName') || ''
    },
    setDefaultClassName(state, value) {
      state.defaultClassName = value
      localStorage.setItem('defaultClassName', value)
    }
  },
  actions: {},
  modules: {}
})
