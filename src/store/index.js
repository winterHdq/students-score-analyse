import Vue from 'vue'
import Vuex from 'vuex'
import { MessageBox } from 'element-ui'
// eslint-disable-next-line no-unused-vars
import { aesEncrypt, aesDecrypt } from '@/utils/aes'
import { subjectMap, totalMap } from '../constant/subject'

Vue.use(Vuex)

function setTablesLocalStorage(tables) {
  console.log('排序改变')
  console.time('start')
  const saveTables = aesEncrypt(JSON.stringify(tables))
  console.timeEnd('start')
  if (saveTables.length > 5 * 1024 * 1024) {
    MessageBox.alert(
      '超出存储大小，只可当前查看，无法保存，如需保存，请删除其他数据',
      '提示'
    )
    return false
  }
  localStorage.setItem('tables', saveTables)
}

export default new Vuex.Store({
  state: {
    tables: [],
    curTableId: null,
    subjectMap,
    totalMap,
    isShowMenu: true,
    defaultClassName: '',
    downloadSetting: {}
  },
  getters: {
    curTable(state) {
      return state.tables.find(item => item.id == state.curTableId)
    },
    curIndex(state) {
      let _index = null
      state.tables.find((item, index) => {
        if (item.id == state.curTableId) {
          _index = index
          return true
        }
      })
      return _index
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
      const tables = localStorage.getItem('tables')
      if (!tables) return
      if (/[\u4e00-\u9fa5]|\[\]/gm.test(tables)) {
        state.tables = JSON.parse(tables) || []
      } else {
        state.tables = JSON.parse(aesDecrypt(tables)) || []
      }
    },
    setTablesLocalStorage(state) {
      setTablesLocalStorage(state.tables)
    },
    setTables(state, table) {
      state.tables = table
      setTablesLocalStorage(state.tables)
    },
    addTable(state, table) {
      state.tables.push(table)
      setTablesLocalStorage(state.tables)
    },
    addTables(state, tables) {
      state.tables.push(...tables)
      setTablesLocalStorage(state.tables)
    },
    deleteTable(state, index) {
      if (index == null) return
      state.tables.splice(index, 1)
      setTablesLocalStorage(state.tables)
    },
    upMoveTables(state, index) {
      if (index == 0) return
      let moveItem = state.tables[index]
      Vue.set(state.tables, index, state.tables[index - 1])
      Vue.set(state.tables, index - 1, moveItem)
      setTablesLocalStorage(state.tables)
    },
    downMoveTables(state, index) {
      if (index == state.tables.length - 1) return
      let moveItem = state.tables[index]
      Vue.set(state.tables, index, state.tables[index + 1])
      Vue.set(state.tables, index + 1, moveItem)
      setTablesLocalStorage(state.tables)
    },
    moveTables(state, { oldIndex, newIndex }) {
      const currRow = state.tables.splice(oldIndex, 1)[0]
      state.tables.splice(newIndex, 0, currRow)
      setTablesLocalStorage(state.tables)
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
    },
    getDownloadSetting(state) {
      const downloadSetting = localStorage.getItem('downloadSetting')
      state.downloadSetting = downloadSetting
        ? JSON.parse(downloadSetting)
        : null
    },
    setDownloadSetting(state, value) {
      state.downloadSetting = value
      localStorage.setItem('downloadSetting', JSON.stringify(value))
    }
  },
  actions: {},
  modules: {}
})
