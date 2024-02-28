<template>
  <div
    class="Excel"
    v-loading="loading"
    element-loading-background="rgba(0, 0, 0, 0.7)"
    element-loading-text="拼命加载中"
  >
    <div class="btns">
      <div class="left">
        <el-upload
          action=""
          accept=".xls,.xlsx"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="fileChange"
          style="display: inline-block"
        >
          <el-button type="primary" id="uploadBtn" plain class="btn">
            上传
          </el-button>
        </el-upload>
        <!-- <el-button
          type="primary"
          class="btn"
          plain
          @click="compaseDialog.show = true"
        >
          进退比较
        </el-button> -->
        <base-mul-class-analyse-btn class="btn" id="mulClassAnalyseBtn" />
        <base-score-analyse-btn class="btn" id="scoreAnalyseBtn" />
        <base-mul-sheet-export-btn class="btn" id="mulSheetExportBtn" />
        <el-button
          type="danger"
          class="btn"
          @click="onDelete"
          id="allDeleteBtn"
        >
          一键删除
        </el-button>
        <!-- <el-button type="danger" @click="onSave">保存</el-button> -->
      </div>
      <div class="right">
        <base-template-btn />
        <base-setting-btn />
        <!-- <el-link
          icon="el-icon-full-screen"
          class="fullBtn"
          type="primary"
          @click="onFull"
        /> -->
      </div>
    </div>
    <div class="content">
      <div class="left">
        <menu-list />
      </div>
      <div class="right">
        <div v-if="curTable.column">
          <!-- 班级科目分析表 -->
          <sort-template
            v-if="curTable.template == 'sortTemplate'"
            :tableId="curTable.extend.tableId"
            :table-height="tableHeight"
          />
          <!-- 学生成绩分析表 -->
          <student-score-template
            v-else-if="curTable.template == 'studentScoreTemplate'"
            :selectTablesId="curTable.extend.selectTablesId"
            :table-height="tableHeight"
          />
          <!-- 年段分析表 -->
          <total-sort-template
            v-else-if="curTable.template == 'totalSortTemplate'"
            :classes="curTable.extend.classes"
            :tableName="curTable.name"
            :table-height="tableHeight"
          />
          <!-- 成绩表 -->
          <score-template v-else :table-height="tableHeight" />
        </div>
      </div>
    </div>
    <compase-dialog
      v-if="compaseDialog.show"
      :tables="tables"
      @onClose="compaseDialog.show = false"
    />
  </div>
</template>

<script>
import $ from 'jquery'
import * as XLSX from 'xlsx/xlsx.mjs'
import CompaseDialog from './components/compareDialog'
import BaseTemplateBtn from './base/baseTemplateBtn'
import SortTemplate from './template/sortTemplate'
import ScoreTemplate from './template/scoreTemplate'
import TotalSortTemplate from './template/totalSortTemplate'
import StudentScoreTemplate from './template/studentScoreTemplate'
import BaseMulSheetExportBtn from './base/baseMulSheetExportBtn'
import BaseMulClassAnalyseBtn from './base/baseMulClassAnalyseBtn'
import BaseScoreAnalyseBtn from './base/baseScoreAnalyseBtn'
import BaseSettingBtn from './base/baseSettingBtn'
import MenuList from './components/menuList'
import baseMixin from './base/baseMixin'
import { mapState } from 'vuex'
import guide from './guide'
export default {
  name: 'ExcelView',
  components: {
    CompaseDialog,
    BaseTemplateBtn,
    SortTemplate,
    ScoreTemplate,
    StudentScoreTemplate,
    BaseMulSheetExportBtn,
    BaseMulClassAnalyseBtn,
    BaseScoreAnalyseBtn,
    BaseSettingBtn,
    MenuList,
    TotalSortTemplate
  },
  mixins: [baseMixin],
  data() {
    return {
      loading: false,
      tableHeight: 500,
      compaseDialog: {
        show: false
      },
      isFull: false
    }
  },
  computed: {
    ...mapState({
      subjectMap: state => state.subjectMap,
      tables: state => state.tables,
      defaultClassName: state => state.defaultClassName
    }),
    curTable() {
      return this.$store.getters.curTable || {}
    }
  },
  created() {
    // const openTime = localStorage.getItem('openTime')
    // if (!openTime || Date.now() - parseInt(openTime) > 3600 * 24 * 30) {
    //   this.$message.error('超过一月未使用，数据已清空，请重新上传')
    //   this.$store.commit('setTables', [])
    // }
    // localStorage.setItem('openTime', Date.now())
    this.$store.commit('getTables')
    this.$store.commit('getDefaultClassName')
    this.$store.commit('getDownloadSetting')
  },
  mounted() {
    this.tableHeight = $('.content')[0].offsetHeight - 56
    this.$store.commit('getCurTableId')
    !this.defaultClassName && this.startDriver()
  },
  methods: {
    startDriver() {
      setTimeout(() => {
        this.$driver.defineSteps(guide)
        this.$driver.start()
      }, 50)
    },
    fileChange(file) {
      if (!/\.(xls|xlsx)$/.test(file.name))
        return this.$message.error('上传格式不正确，请上传xls/xlsx文件格式')
      if (!file.raw) return this.$message.error('文件导入失败')
      this.importFile(file)
    },
    importFile(file) {
      let curTableId = this.curTable
      const reader = new FileReader()
      reader.readAsArrayBuffer(file.raw)
      reader.onload = async ev => {
        try {
          this.loading = true
          const data = ev.target.result
          // 解析二进制格式数据
          const workBook = XLSX.read(data, {
            type: 'binary'
          })
          // 获取第一张表数据
          // const wsname = workBook.SheetNames[0]
          // const tableData = XLSX.utils.sheet_to_json(workBook.Sheets[wsname])
          // const curTable = {
          //   name: file.name,
          //   data: tableData,
          //   id: Date.now(),
          //   column: Object.keys(tableData[0]),
          //   sortObj: this.sortCompare(tableData)
          // }
          // 获取多张表格
          const addTables = []
          workBook.SheetNames.forEach(name => {
            const tableData = XLSX.utils.sheet_to_json(workBook.Sheets[name])
            if (tableData.length == 0) return
            const curTable = {
              name: name.indexOf('Sheet') < 0 ? name : file.name,
              data: tableData,
              id: Date.now() + addTables.length, // 如果不加addTables.length， 可能存在相同id
              column: Object.keys(tableData[0]),
              className: this.defaultClassName,
              isCompare: false,
              sortObj: this.sortCompare(tableData)
            }
            addTables.push(curTable)
            curTableId = curTable.id
          })
          this.$store.commit('addTables', addTables)
          this.$store.commit('setCurTableId', curTableId)
          // 滚动到可视区域
          this.$nextTick(() => {
            $('.name-item-active')[0].scrollIntoView()
          })
        } finally {
          this.loading = false
        }
      }
    },
    sortCompare(list) {
      let sortObj = {}
      list.forEach(item => {
        let name = item['姓名']
        for (let k in item) {
          if (k !== '姓名') {
            if (!sortObj[k]) sortObj[k] = []
            sortObj[k].push({
              name: name,
              score: item[k]
            })
          }
        }
      })
      return sortObj
    },
    // handleImport(e) {
    //   const files = e.target.files
    //   if (!files.length) return
    //   const fileName = files[0].name.toLowerCase()
    //   if (!/\.(xls|xlsx)$/.test(fileName))
    //     return this.$message.error('上传格式不正确，请上传xls/xlsx文件格式')
    //   const fileReader = new FileReader()
    //   fileReader.onloadend = function () {}
    // },
    onDelete() {
      this.$confirm('确认删除当前所有表格数据吗？', '提示')
        .then(() => {
          this.$store.commit('setCurTableId', null)
          this.$store.commit('setTables', [])
          this.$message.success('删除成功')
        })
        .catch()
    },
    onFull() {
      var docElm = document.documentElement
      if (this.isFull) {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        }
      } else {
        if (docElm.requestFullscreen) {
          docElm.requestFullscreen()
        } else if (docElm.msRequestFullscreen) {
          docElm.msRequestFullscreen()
        } else if (docElm.mozRequestFullScreen) {
          docElm.mozRequestFullScreen()
        } else if (docElm.webkitRequestFullScreen) {
          docElm.webkitRequestFullScreen()
        }
      }
      this.isFull = !this.isFull
    },
    onSave() {
      this.$store.commit('setTablesLocalStorage')
      this.$message.success('保存成功')
    }
  }
}
</script>
<style lang="scss" scoped>
$border-color: #409eff;
.Excel {
  background-color: #061b2c;
  width: 100%;
  height: 100%;
  position: absolute;
  .btns {
    display: flex;
    padding: 10px;
    .left {
      flex: 1;
    }
    .right {
      margin: 0 auto;
      .fullBtn {
        font-size: 25px;
      }
    }
  }
  .btn {
    margin-left: 10px;
  }
  .content {
    display: flex;
    height: calc(100% - 55px);
    .left {
      border-right: 1px solid $border-color;
      font-size: 14px;
      flex-shrink: 0;
      border-top: 1px solid $border-color;
      /* 设置滚动条的样式 */
      ::-webkit-scrollbar {
        width: 10px;
      }
      /* 滚动槽 */
      ::-webkit-scrollbar-track {
        background: rgba(144, 147, 153, 0.2);
      }
      /* 滚动条滑块 */
      ::-webkit-scrollbar-thumb {
        border-radius: 3px;
        background: rgba(191, 193, 197, 0.5);
      }
    }
    .right {
      flex: 1;
      border-top: 1px solid $border-color;
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  }
  @media print {
    .btns,
    .left {
      display: none;
    }
  }
}
</style>
