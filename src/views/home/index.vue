<template>
  <div class="Excel">
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
          <el-button size="small" type="primary" class="btn">上传</el-button>
        </el-upload>
        <el-button
          type="primary"
          size="small"
          class="btn"
          @click="compaseDialog.show = true"
        >
          进退比较
        </el-button>
        <el-button type="primary" size="small" class="btn" @click="onDelete">
          一键删除
        </el-button>
      </div>
      <div class="right">
        <base-template-btn></base-template-btn>
      </div>
    </div>
    <div class="content">
      <div class="left">
        <p
          v-for="(item, index) in tables"
          :key="item.index"
          class="name-item"
          :class="{ 'name-item-active': item.id == curTable.id }"
          @click="changeTable(item)"
        >
          <span class="className">{{ item.className }}</span>
          <span class="name">{{ item.name }}</span>
          <i
            class="el-icon-download btn"
            @click="exportExcel(item, $event)"
          ></i>
          <i
            class="el-icon-delete-solid btn"
            style="padding-left: 5px"
            @click="delectTable(item, index, $event)"
          ></i>
        </p>
      </div>
      <div class="right">
        <div v-if="curTable.column">
          <div style="padding: 10px" class="btns">
            <base-class-setting
              ref="setting"
              v-model="curTable.className"
            ></base-class-setting>
            <template v-if="curTable.sortObj">
              <el-button
                v-for="item in subjectMap"
                :key="item.type"
                type="primary"
                size="small"
                class="btn"
                @click="openSortDialog(item.name)"
              >
                {{ item.name }}分析
              </el-button>
            </template>
          </div>
          <base-table
            ref="baseTable"
            :table-height="tableHeight"
            :table="curTable"
          ></base-table>
        </div>
      </div>
    </div>
    <sort-dialog
      v-if="sortCompareDialog.show"
      :subjectName="sortCompareDialog.name"
      :curTable="curTable"
      @onClose="sortCompareDialog.show = false"
    ></sort-dialog>
    <compase-dialog
      v-if="compaseDialog.show"
      :tables="tables"
      @onClose="compaseDialog.show = false"
    ></compase-dialog>
  </div>
</template>

<script>
import $ from 'jquery'
import * as XLSX from 'xlsx/xlsx.mjs'
import SortDialog from './sortDialog'
import CompaseDialog from './compareDialog'
import BaseTable from './base/baseTable'
import BaseTemplateBtn from './base/baseTemplateBtn'
import baseClassSetting from './base/baseClassSetting'
import baseMixin from './base/baseMixin'
import { mapState } from 'vuex'
export default {
  name: 'ExcelView',
  components: {
    SortDialog,
    CompaseDialog,
    BaseTable,
    BaseTemplateBtn,
    baseClassSetting
  },
  mixins: [baseMixin],
  data() {
    return {
      tableHeight: 500,
      sortCompareDialog: {
        show: false,
        name: ''
      },
      compaseDialog: {
        show: false
      }
    }
  },
  computed: {
    ...mapState({
      subjectMap: state => state.subjectMap,
      tables: state => state.tables
    }),
    curTable() {
      return this.$store.getters.curTable || {}
    }
  },
  created() {
    this.$store.commit('getTables')
  },
  mounted() {
    this.tableHeight = $('.content')[0].offsetHeight - 55
    this.$store.commit('getCurTableId')
  },
  watch: {
    curTable() {
      this.$nextTick(() => {
        this.$refs.table && this.$refs.table.doLayout()
      })
    }
  },
  methods: {
    styleRed(item, key) {
      let include = this.subjectMap.map(item => item.name)
      if (include.includes(key)) {
        return { color: 'red' }
      }
      return {}
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
      reader.onload = ev => {
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
        workBook.SheetNames.forEach(name => {
          const tableData = XLSX.utils.sheet_to_json(workBook.Sheets[name])
          if (tableData.length == 0) return
          const curTable = {
            name: name.indexOf('Sheet') < 0 ? name : file.name,
            data: tableData,
            id: Date.now(),
            column: Object.keys(tableData[0]),
            className: '',
            isCompare: false,
            sortObj: this.sortCompare(tableData)
          }
          this.$store.commit('addTable', curTable)
          curTableId = curTable.id
        })
        this.$store.commit('setCurTableId', curTableId)
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
    handleImport(e) {
      const files = e.target.files
      if (!files.length) return
      const fileName = files[0].name.toLowerCase()
      if (!/\.(xls|xlsx)$/.test(fileName))
        return this.$message.error('上传格式不正确，请上传xls/xlsx文件格式')
      const fileReader = new FileReader()
      fileReader.onloadend = function () {}
    },
    changeTable(item) {
      this.$store.commit('setCurTableId', item.id)
    },
    exportExcel(data, e) {
      e.stopPropagation()
      this.baseExportExcel(data)
    },
    delectTable(item, index, e) {
      e.stopPropagation()
      this.$store.commit('deleteTable', index)
      if (item.id == this.curTableId) {
        this.$store.commit('setCurTableId', null)
      }
    },
    onDelete() {
      this.$store.commit('setCurTableId', null)
      this.$store.commit('setTables', [])
    },
    async openSortDialog(name) {
      try {
        await this.$refs.setting.validate()
        this.sortCompareDialog.name = name
        this.sortCompareDialog.show = true
      } catch (err) {
        console.log(err)
        this.$message.error('请先设置班级')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
$border-color: #409eff;
.Excel {
  .btns {
    display: flex;
    padding: 10px;
    .left {
      flex: 1;
    }
    .right {
      margin: 0 auto;
    }
  }
  .btn {
    margin-left: 10px;
  }
  .content {
    display: flex;
    height: calc(100vh - 55px);
    .left {
      width: 200px;
      border-right: 1px solid $border-color;
      font-size: 14px;
      flex-shrink: 0;
      border-top: 1px solid $border-color;
      .name-item {
        padding: 15px 5px 10px 5px;
        border-bottom: 1px solid $border-color;
        cursor: pointer;
        display: flex;
        align-items: center;
        position: relative;
        .className {
          position: absolute;
          z-index: 2;
          background: #c4c04f;
          top: 0px;
          right: 0px;
          font-size: 13px;
          padding: 0 5px;
          font-weight: bold;
        }
        .name {
          flex: 1;
        }
        .btn {
          margin: 0 auto;
          cursor: pointer;
        }
      }
      .name-item-active {
        background-color: $border-color;
        color: #fff;
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
}
</style>
