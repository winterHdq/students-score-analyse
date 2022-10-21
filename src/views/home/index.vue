<template>
  <div class="Excel">
    <div class="btns">
      <el-upload
        action=""
        accept=".xls,.xlsx"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="fileChange"
        style="display: inline-block"
      >
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
      <el-button type="primary" size="small" class="btn" @click="onCompare">
        进退比较
      </el-button>
    </div>
    <div class="content">
      <div class="left">
        <p
          v-for="(item, index) in tables"
          :key="item.index"
          class="name-item"
          :class="{ 'name-item-active': item.id == curTable.id }"
          @click="curTable = item"
        >
          <span class="name">{{ item.name }}</span>
          <i
            class="el-icon-download btn"
            @click="exportExcel(item, $event)"
          ></i>
          <i
            class="el-icon-delete-solid btn"
            style="padding-left: 5px"
            @click="delectTable(index, $event)"
          ></i>
        </p>
      </div>
      <div class="right">
        <div v-if="curTable.th">
          <div style="padding: 10px">
            <el-button
              v-for="item in subjectMap"
              :key="item.type"
              type="primary"
              size="small"
              class="btn"
              @click="openSortDialog(item.type)"
            >
              {{ item.name }}排位
            </el-button>
          </div>
          <el-table
            ref="table"
            :data="curTable.data"
            border
            :height="tableHeight"
          >
            <el-table-column
              fixed
              label="序号"
              type="index"
              align="center"
            ></el-table-column>
            <el-table-column
              v-for="item in curTable.th"
              :key="item"
              :label="item"
              :prop="item"
              :fixed="item.indexOf('班级') >= 0 || item == '姓名'"
              :sortable="item.indexOf('班级') == -1 && item !== '姓名'"
              align="center"
              #default="{ row }"
            >
              <span>{{ row[item] }}</span>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <sort-dialog
      v-if="sortCompareDialog.show"
      :subjectType="sortCompareDialog.type"
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
import SortDialog from './sortDialog'
import CompaseDialog from './compareDialog'
import * as XLSX from 'xlsx/xlsx.mjs'
import setting from './constant'
export default {
  name: 'ExcelView',
  components: { SortDialog, CompaseDialog },
  data() {
    return {
      tables: [],
      curTable: {},
      subjectMap: setting.subjectMap,
      tableHeight: 0,
      sortCompareDialog: {
        show: false,
        type: ''
      },
      compaseDialog: {
        show: false
      }
    }
  },
  mounted() {
    this.tableHeight = $('.content')[0].offsetHeight - 55
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
      console.log(item, key)
      let include = setting.subjectMap.map(item => item.name)
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
      const reader = new FileReader()
      reader.readAsArrayBuffer(file.raw)
      reader.onload = ev => {
        const data = ev.target.result
        // 解析二进制格式数据
        const workBook = XLSX.read(data, {
          type: 'binary'
        })
        // 获取第一张表数据
        const wsname = workBook.SheetNames[0]
        const tableData = XLSX.utils.sheet_to_json(workBook.Sheets[wsname])
        const curTable = {
          name: file.name,
          data: tableData,
          id: Date.now(),
          th: Object.keys(tableData[0]),
          sortObj: this.sortCompare(tableData)
        }
        this.curTable = curTable
        this.tables.push(curTable)
      }
    },
    importExcel() {
      this.$refs.importInput.click()
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
    exportExcel(data, e) {
      e.stopPropagation()
      const book = XLSX.utils.book_new()
      const sheet = XLSX.utils.json_to_sheet(data.data)
      XLSX.utils.book_append_sheet(book, sheet)
      XLSX.writeFile(book, `${data.name}`)
    },
    delectTable(index, e) {
      e.stopPropagation()
      this.tables.splice(index, 1)
    },
    onCompare() {
      this.compaseDialog.show = true
    },
    sortCompare(list) {
      console.log(list)
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
    openSortDialog(type) {
      this.sortCompareDialog.type = type
      this.sortCompareDialog.show = true
    }
  }
}
</script>
<style lang="scss" scoped>
$border-color: #409eff;
.Excel {
  .btns {
    padding: 10px;
  }
  .btn {
    margin-left: 10px;
  }
  .content {
    display: flex;
    height: calc(100vh - 55px);
    .left {
      width: 200px;
      border-right: 2px solid $border-color;
      font-size: 14px;
      flex-shrink: 0;
      border-top: 2px solid $border-color;
      .name-item {
        padding: 10px;
        border-bottom: 1px solid $border-color;
        cursor: pointer;
        display: flex;
        align-items: center;
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
      border-top: 2px solid $border-color;
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  }
}
</style>
